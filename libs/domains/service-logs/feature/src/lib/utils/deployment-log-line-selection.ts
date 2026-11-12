export interface DeploymentLogLineRange {
  start: number
  end: number
}

const LINE_HASH_REGEX = /^#?L(\d+)(?:-L(\d+))?$/

/**
 * Reads the lines a URL hash points to: `#L12`, or `#L12-L20` for a range.
 */
export function parseDeploymentLogLineHash(hash: string): DeploymentLogLineRange | undefined {
  const match = LINE_HASH_REGEX.exec(hash)
  if (!match) return undefined

  const firstLineId = Number(match[1])
  const lastLineId = match[2] ? Number(match[2]) : firstLineId
  return { start: Math.min(firstLineId, lastLineId), end: Math.max(firstLineId, lastLineId) }
}

export function formatDeploymentLogLineHash({ start, end }: DeploymentLogLineRange) {
  return start === end ? `L${start}` : `L${start}-L${end}`
}

export function isDeploymentLogLineSelected(range: DeploymentLogLineRange | undefined, lineId: number) {
  return range !== undefined && range.start <= lineId && lineId <= range.end
}

/**
 * Selects the clicked line, like GitHub: with shift held, the lines from the start of the selection to it.
 * Clicking the only selected line clears the selection.
 */
export function getNextDeploymentLogLineRange(
  range: DeploymentLogLineRange | undefined,
  lineId: number,
  isExtending: boolean
): DeploymentLogLineRange | undefined {
  if (isExtending && range) {
    return { start: Math.min(range.start, lineId), end: Math.max(range.start, lineId) }
  }
  if (range?.start === lineId && range.end === lineId) return undefined

  return { start: lineId, end: lineId }
}
