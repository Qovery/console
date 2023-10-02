// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import prettyBytes from 'pretty-bytes'

export function formatBytes(number?: Parameters<typeof prettyBytes>[0], options?: Parameters<typeof prettyBytes>[1]) {
  if (number === undefined) {
    return number
  }
  return prettyBytes(number, options)
}
