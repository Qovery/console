// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import cronstrue from 'cronstrue'

export function formatCronExpression(expression?: string) {
  if (expression === undefined) {
    return undefined
  }
  const res = cronstrue.toString(expression, { throwExceptionOnParseError: false })
  return !res.startsWith('An error') ? res : undefined
}
