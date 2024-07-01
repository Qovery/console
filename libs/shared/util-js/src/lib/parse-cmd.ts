import { parse } from 'shell-quote'

/*
  Parse a command string into an array of arguments
  Back-end expects an array of arguments that's why we flatten the array
  Operator and comment are objects, we extract the 'op' and 'comment' properties
  
  `extractEnvVariables` is hack to display the env variables in the UI

  `shell-quote` library for more information:
  https://www.npmjs.com/package/shell-quote
*/
export const parseCmd = (cmd: string): string[] => {
  const args = parse(cmd, extractEnvVariables(cmd))

  return args.flatMap((arg) => {
    if (typeof arg === 'string') {
      const words = arg.split(' ').length
      if (words > 1) {
        return `"${arg}"`
      }
      return arg
    }
    if ('op' in arg) {
      return arg.op
    }
    if ('comment' in arg) {
      return ['#', arg.comment]
    }
    return arg
  })
}

function extractEnvVariables(inputString: string): { [key: string]: string } {
  const regex = /\$([a-zA-Z_][a-zA-Z0-9_-]*)/g
  const envObject: { [key: string]: string } = {}

  // Using matchAll to retrieve all matches
  ;[...inputString.matchAll(regex)].forEach((match) => {
    const varName = match[1] // variable name without the '$'
    envObject[varName] = `$${varName}`
  })

  return envObject
}
