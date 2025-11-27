import { type AlertRuleResponse } from 'qovery-typescript-axios'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

const METRIC_LABEL_OVERRIDES: Record<string, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  instances: 'Instances',
  k8s_event: 'K8s events',
  network: 'Network',
  logs: 'Logs',
}

const OPERATOR_SYMBOLS: Record<string, string> = {
  ABOVE: '>',
  BELOW: '<',
}

export function formatMetricLabel(tag?: string) {
  if (!tag) return undefined
  if (METRIC_LABEL_OVERRIDES[tag]) {
    return METRIC_LABEL_OVERRIDES[tag]
  }

  const words = tag.split('_').filter(Boolean)
  if (words.length === 0) return undefined

  return words.map((word) => (word.length <= 3 ? word.toUpperCase() : upperCaseFirstLetter(word))).join(' ')
}

export function formatOperator(operator?: string) {
  if (!operator) return undefined
  return OPERATOR_SYMBOLS[operator] ?? operator
}

export function formatThreshold(threshold?: number) {
  if (threshold === undefined || threshold === null) return undefined
  const normalized = threshold <= 1 ? threshold * 100 : threshold
  const formatted = Number.isInteger(normalized) ? normalized.toString() : normalized.toFixed(1).replace(/\.0$/, '')
  return `${formatted}%`
}

export function formatDuration(duration?: string) {
  if (!duration) return undefined
  const matchDuration = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!matchDuration) return undefined

  const [, hours, minutes, seconds] = matchDuration

  if (!hours && !minutes && seconds && (seconds === '0' || seconds === '1')) {
    return 'immediately'
  }

  const parts = []

  if (hours) parts.push(`${hours} hour${hours === '1' ? '' : 's'}`)
  if (minutes) parts.push(`${minutes} minute${minutes === '1' ? '' : 's'}`)
  if (seconds) parts.push(`${seconds} second${seconds === '1' ? '' : 's'}`)

  if (parts.length === 0) return undefined

  return parts.join(' ')
}

export function getRuleSummary(alert: AlertRuleResponse) {
  if (alert.condition.kind === 'CUSTOM') {
    return alert.name
  }

  const metric = formatMetricLabel(alert.tag)
  const operator = formatOperator(alert.condition.operator)
  const threshold = formatThreshold(alert.condition.threshold)
  const duration = formatDuration(alert.for_duration)

  if (!metric || !operator || !threshold || !duration) {
    return alert.name
  }

  return `${metric} ${operator} ${threshold} for ${duration}`
}
