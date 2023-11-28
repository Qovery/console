// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import cronstrue from 'cronstrue'

export function formatCronExpression(expression?: string, tzOffset?: number) {
  if (expression === undefined) {
    return undefined
  }
  const res = cronstrue.toString(expression, {
    throwExceptionOnParseError: false,
    tzOffset: tzOffset ? tzOffset : 0,
  })
  return res.indexOf('An error') === -1 ? res : undefined
}
