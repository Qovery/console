import { parse } from 'shell-quote'

export const parseCmdDocker = (cmd: string): string[] => {
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
