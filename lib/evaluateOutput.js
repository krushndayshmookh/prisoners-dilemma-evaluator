export default function evalauteOutput(interactionOutput) {
  let { process1Output, process2Output, options } = interactionOutput

  // compare results and find the final score
  let process1Score = 0
  let process2Score = 0

  for (let i = 0; i < process1Output.length; i++) {
    // output can be cooperate or defect. If it's cooperate, both players get
    // 3 points, if it's defect, both players get 1 point, else the defector
    // gets 5 points and the cooperator gets 0 points

    let p1 = process1Output[i].trim().toLowerCase().replace(/\n/g, '')
    let p2 = process2Output[i].trim().toLowerCase().replace(/\n/g, '')

    if (p1 === 'cooperate' && p2 === 'cooperate') {
      process1Score += 3
      process2Score += 3
    } else if (p1 === 'defect' && p2 === 'defect') {
      process1Score += 1
      process2Score += 1
    } else if (p1 === 'cooperate' && p2 === 'defect') {
      process1Score += 0
      process2Score += 5
    } else if (p1 === 'defect' && p2 === 'cooperate') {
      process1Score += 5
      process2Score += 0
    }
  }

  const result = {
    process1Score,
    process2Score,
    winner:
      process1Score > process2Score ? options.process1Id : options.process2Id,
    options,
  }

  return result
}
