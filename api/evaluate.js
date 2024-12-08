// import fs from 'fs-extra'
import interactProcesses from '../lib/interactProcesses.js'
import evalauteOutput from '../lib/evaluateOutput.js'

export const maxDuration = 60 // function timeout in seconds

export default async function evaluate(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const code1 = req.body.code1
  const code2 = req.body.code2
  const options = req.body.options

  // validate code1 and code2
  if (!code1 || !code2) {
    return res.status(400).json({ error: 'code1 and code2 are required' })
  }

  // validate options
  if (options && typeof options !== 'object') {
    return res.status(400).json({ error: 'options must be an object' })
  }
  if (!options.process1Id || !options.process2Id) {
    return res
      .status(400)
      .json({ error: 'options.process1Id and options.process2Id are required' })
  }
  if (!options.rounds) {
    options.rounds = 100
  }

  try {
    const startTime = process.hrtime.bigint()
    const interactionOutput = await interactProcesses(code1, code2, options)
    const endTime = process.hrtime.bigint()

    const executionTime = endTime - startTime // in nano seconds
    // convert to seconds
    const executionTimeInSeconds = Number(executionTime) / 1_000_000_000

    // log to vercel console
    console.info({ interactionOutput, executionTimeInSeconds })

    const result = evalauteOutput(interactionOutput)
    const output = {
      ...result,
      executionTimeInSeconds,
    }

    // TODO: save output to the database

    return res.status(200).json(output)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({
      message: 'Internal Server Error',
      error,
    })
  }
}
