import { sql } from '@vercel/postgres'
import axios from 'axios'

import { config } from 'dotenv'
config()

export const maxDuration = 60 // function timeout in seconds

const HOST = 'https://prisoners-dilemma-evaluator.vercel.app'

const host =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : HOST

export default async function triggerEvaluation(req, res) {
  

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const strategyId = req.body.strategyId
  const rounds = req.body.rounds

  // fetch strategy code from the database and also other strategies to evaluate against

  try {
    const { rows: strategyRows } =
      await sql`SELECT * FROM psp_strategies WHERE id = ${strategyId}`

    const strategy = strategyRows[0]

    if (!strategy) {
      return res.status(404).json({ message: 'Strategy not found' })
    }

    // reject if last_evaluated_at is less than 30 minutes ago
    // if (
    //   strategy.last_evaluated_at &&
    //   Date.now() -
    //     5.5 * 60 * 60 * 1000 -
    //     new Date(strategy.last_evaluated_at).getTime() <
    //     30 * 60 * 1000
    // ) {
    //   return res.status(400).json({
    //     code: 'strategy_evaluated_recently',
    //     message: 'Strategy evaluated less than 30 minutes ago',
    //   })
    // }

    const { rows: strategies } =
      await sql`SELECT * FROM psp_strategies WHERE id != ${strategyId}`

    // create pairings
    const pairings = strategies.map((s) => ({
      code1: strategy.code,
      code2: s.code,
      options: {
        process1Id: strategy.id,
        process2Id: s.id,
        rounds,
      },
    }))

    // evaluate each pairing by sending POST request to /api/evaluate in batches
    // of 25 pairings and wait for the results, ensure to handle timeouts and
    // also ensure minimum of 2 seconds between each batch

    const startTime = process.hrtime.bigint()

    const batchSize = 25
    const batchesCount = Math.ceil(pairings.length / batchSize)

    const results = []

    for (let i = 0; i < batchesCount; i++) {
      const batch = pairings.slice(i * batchSize, (i + 1) * batchSize)

      const promises = batch.map((pairing) => {
        return axios.post(`${host}/api/evaluate`, pairing)
      })

      const batchResults = await Promise.allSettled(promises)

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value.data)
        } else {
          results.push({ error: result.reason })
        }
      }

      // add delay of 2 seconds before next batch
      if (i < batchesCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2 * 1000))
      }
    }

    // calculate the final score for the strategy
    let finalWinCount = 0
    let finalLossCount = 0

    for (const result of results) {
      if (result.error) {
        // log the error
        console.error('Error:', result.error)
        continue
      }

      if (result.winner === strategy.id) {
        finalWinCount++
      } else {
        finalLossCount++
      }
    }

    const endTime = process.hrtime.bigint()

    const executionTime = endTime - startTime // in nano seconds
    // convert to seconds
    const executionTimeInSeconds = Number(executionTime) / 1_000_000_000

    // save to the database with last_evaluated_at timestamp
    const { rows: updatedRows } =
      await sql`UPDATE psp_strategies SET win_count = ${finalWinCount}, loss_count = ${finalLossCount}, last_evaluated_at = NOW(), last_evaluation_time = ${executionTimeInSeconds}, evaluated_against_count = ${pairings.length} WHERE id = ${strategyId} RETURNING *`

    return res.status(200).json({ results, updatedRows })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Internal Server Error', error })
  }
}
