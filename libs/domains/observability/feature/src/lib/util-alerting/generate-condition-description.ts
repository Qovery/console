import { type AlertRuleConditionFunction, type AlertRuleConditionOperator } from 'qovery-typescript-axios'
import { pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type MetricCategory } from '../alerting/alerting-creation-flow/alerting-creation-flow.types'

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

const FUNCTION_LABELS: Record<string, string> = {
  MAX: 'Maximum',
  AVG: 'Average',
  MIN: 'Minimum',
  COUNT: 'Count',
  NONE: '',
}

export function formatMetricLabel(tag?: string) {
  if (!tag) return undefined
  if (METRIC_LABEL_OVERRIDES[tag]) {
    return METRIC_LABEL_OVERRIDES[tag]
  }

  const words = tag.split('_').filter(Boolean)
  if (words.length === 0) return undefined

  return words
    .map((word) => {
      if (word.toLowerCase() === 'http') return 'HTTP'
      return word.length <= 3 ? word.toUpperCase() : upperCaseFirstLetter(word)
    })
    .join(' ')
}

export function formatOperator(operator?: string) {
  if (!operator) return undefined
  return OPERATOR_SYMBOLS[operator] ?? operator
}

export function formatThreshold(metric?: MetricCategory, threshold?: number, unit = '%') {
  if (threshold === undefined || threshold === null) return undefined
  const normalized = threshold <= 1 ? threshold * 100 : threshold
  const formatted = Number.isInteger(normalized) ? normalized.toString() : normalized.toFixed(1).replace(/\.0$/, '')
  return metric === 'http_latency' ? `${threshold}${unit}` : `${formatted}${unit}`
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

  if (hours) parts.push(`${hours} ${pluralize(Number(hours), 'hour')}`)
  if (minutes) parts.push(`${minutes} ${pluralize(Number(minutes), 'minute')}`)
  if (seconds) parts.push(`${seconds} ${pluralize(Number(seconds), 'second')}`)

  if (parts.length === 0) return undefined

  return parts.join(' ')
}

export function formatFunction(func?: AlertRuleConditionFunction | string) {
  if (!func) return undefined
  return FUNCTION_LABELS[func] ?? func
}

export function generateConditionDescription(
  func?: AlertRuleConditionFunction | string,
  operator?: AlertRuleConditionOperator | string,
  threshold?: number,
  metric?: MetricCategory,
  unit = '%'
): string {
  // Desired format: "{{metric}} - {{function}} {{operator}} {{threshold}}"
  // Example: "CPU - Average >= 80%"
  const metricLabel = formatMetricLabel(metric)
  const functionLabel = formatFunction(func)
  const operatorSymbol = formatOperator(operator)
  const thresholdFormatted = formatThreshold(metric, threshold, unit)

  let conditionPart = ''
  if (functionLabel && operatorSymbol && thresholdFormatted) {
    conditionPart = `${functionLabel} ${operatorSymbol} ${thresholdFormatted}`
  } else if (functionLabel && operatorSymbol) {
    conditionPart = `${functionLabel} ${operatorSymbol}`
  } else if (functionLabel && thresholdFormatted) {
    conditionPart = `${functionLabel} ${thresholdFormatted}`
  } else if (operatorSymbol && thresholdFormatted) {
    conditionPart = `${operatorSymbol} ${thresholdFormatted}`
  } else if (functionLabel) {
    conditionPart = functionLabel
  } else if (operatorSymbol) {
    conditionPart = operatorSymbol
  } else if (thresholdFormatted) {
    conditionPart = thresholdFormatted
  }

  if (metricLabel && conditionPart) {
    return `${metricLabel} - ${conditionPart}`
  }
  if (metricLabel) {
    return metricLabel
  }
  return conditionPart
}
