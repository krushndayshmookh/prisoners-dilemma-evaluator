import { spawn } from 'node:child_process'
import delay from '../util/delay.js'

export default async function interactProcesses(code1, code2, options) {
  if (!options) {
    options = {
      rounds: 100,
      process1Id: 'p1',
      process2Id: 'p2',
    }
  }

  if (!options.rounds) {
    options.rounds = 100
  }

  const MAX_ROUNDS = options.rounds

  return new Promise(async (resolve, reject) => {
    const process1 = spawn('python3', ['-c', code1])
    const process2 = spawn('python3', ['-c', code2])

    let process1Output = []
    let process2Output = []

    let rounds1 = 1
    let rounds2 = 1

    process1.stdout.on('data', async (data) => {
      // console.log(`R${rounds1} P1:\n`, data.toString())
      process1Output.push(data.toString())

      if (rounds1 >= MAX_ROUNDS) {
        process2.stdin.write('stop')
        process2.stdin.end()
      } else {
        // add delay
        await delay(10)
        process2.stdin.write(data.toString())
      }

      rounds1++
    })

    process2.stdout.on('data', async (data) => {
      // console.log(`R${rounds2} P2:\n`, data.toString())
      process2Output.push(data.toString())

      if (rounds2 >= MAX_ROUNDS) {
        process1.stdin.write('stop')
        process1.stdin.end()
      } else {
        // add delay
        await delay(10)
        process1.stdin.write(data.toString())
      }

      rounds2++
    })

    process1.stderr.on('data', (data) => {
      console.error(`Process 1 Error: ${data}`)
    })

    process2.stderr.on('data', (data) => {
      console.error(`Process 2 Error: ${data}`)
    })

    let process1End = false
    let process2End = false

    process1.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Process 1 exited with code ${code}`))
      }
      process2.stdin.end()

      process1End = true

      if (process2End) {
        resolve({
          process1Output,
          process2Output,
          options,
        })
      }
    })

    process2.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Process 2 exited with code ${code}`))
      }
      process1.stdin.end()

      process2End = true

      if (process1End) {
        resolve({
          process1Output,
          process2Output,
          options,
        })
      }
    })
  })
}

