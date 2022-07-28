export function countOverride(data: { [key: string]: string }, existingEnvVarNames: (string | undefined)[]) {
  let count = 0
  Object.keys(data)
    .filter((key) => key.indexOf('_key') >= 0)
    .forEach((key) => {
      if (existingEnvVarNames.includes(data[key])) count++
    })

  return count
}
