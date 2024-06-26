import { parse } from 'shell-quote'

/*
  Parse a command string into an array of arguments
  Back-end expects an array of arguments that's why we flatten the array
  Operator and comment are objects, we extract the 'op' and 'comment' properties

  `shell-quote` library for more information:
  https://www.npmjs.com/package/shell-quote
*/
export const parseCmd = (cmd: string): string[] => {
  const args = parse(cmd)
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
