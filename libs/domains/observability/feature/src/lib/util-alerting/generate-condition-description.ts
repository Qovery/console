import { type AlertRuleConditionFunction, type AlertRuleConditionOperator } from 'qovery-typescript-axios'
import { pluralize, upperCaseFirstLetter } from '@qovery/shared/util-js'
import { type MetricCategory } from '../alerting/alerting-creation-flow/alerting-creation-flow.types'

const METRIC_LABEL_OVERRIDES: Record<string, string> = {
  cpu: 'CPU',
  memory: 'Memory',
  http_error: 'HTTP error',
  http_latency: 'HTTP latency',
  missing_instance: 'Missing instance',
  instance_restart: 'Instance restart',
}

const OPERATOR_SYMBOLS: Record<AlertRuleConditionOperator, string> = {
  ABOVE: '>',
  BELOW: '<',
  EQUAL: '=',
  ABOVE_OR_EQUAL: '>=',
  BELOW_OR_EQUAL: '<=',
  NONE: 'None',
}

const OPERATOR_LABELS: Record<AlertRuleConditionOperator, string> = {
  ABOVE: 'Above',
  BELOW: 'Below',
  EQUAL: 'Equal to',
  ABOVE_OR_EQUAL: 'At or above',
  BELOW_OR_EQUAL: 'At or below',
  NONE: 'None',
}

const FUNCTION_LABELS: Record<AlertRuleConditionFunction, string> = {
  MAX: 'Maximum',
  AVG: 'Average',
  MIN: 'Minimum',
  COUNT: 'Count',
  SUM: 'Sum',
  NONE: 'None',
}

export function formatMetricLabel(tag?: string) {
  if (!tag) return undefined
  if (METRIC_LABEL_OVERRIDES[tag]) {
    return METRIC_LABEL_OVERRIDES[tag]
  }
  return upperCaseFirstLetter(tag)
}

export function formatOperator(operator?: AlertRuleConditionOperator) {
  if (!operator) return undefined
  return OPERATOR_SYMBOLS[operator] ?? operator
}

export function formatOperatorLabel(operator?: AlertRuleConditionOperator) {
  if (!operator) return undefined
  return OPERATOR_LABELS[operator] ?? operator
}

export function formatThreshold(metric?: MetricCategory, threshold?: number, unit = '%') {
  if (threshold === undefined || threshold === null) return undefined
  if (unit !== '%') {
    return `${threshold}${unit}`
  }
  const normalized = threshold <= 1 ? threshold * 100 : threshold
  const formatted = Number.isInteger(normalized) ? normalized.toString() : normalized.toFixed(1).replace(/\.0$/, '')
  return `${formatted}${unit}`
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

export function formatFunction(func?: AlertRuleConditionFunction) {
  if (!func) return undefined
  return FUNCTION_LABELS[func] ?? func
}

export function generateConditionDescription(
  func?: AlertRuleConditionFunction,
  operator?: AlertRuleConditionOperator,
  threshold?: number,
  unit = '%',
  duration?: string
): string {
  const functionLabel = formatFunction(func)
  const operatorSymbol = formatOperator(operator)
  const operatorLabel = formatOperatorLabel(operator)
  const thresholdFormatted = formatThreshold(undefined, threshold, unit)
  const durationFormatted = formatDuration(duration)

  const shouldIncludeFunction = functionLabel && functionLabel !== 'None'

  let conditionPart = ''
  if (shouldIncludeFunction && operatorSymbol && thresholdFormatted) {
    conditionPart = `${functionLabel} ${operatorSymbol} ${thresholdFormatted}`
  } else if (shouldIncludeFunction && operatorSymbol) {
    conditionPart = `${functionLabel} ${operatorSymbol}`
  } else if (shouldIncludeFunction && thresholdFormatted) {
    conditionPart = `${functionLabel} ${thresholdFormatted}`
  } else if (operatorLabel && thresholdFormatted) {
    conditionPart = `${operatorLabel} ${thresholdFormatted}`
  } else if (shouldIncludeFunction) {
    conditionPart = functionLabel
  } else if (operatorLabel) {
    conditionPart = operatorLabel
  } else if (thresholdFormatted) {
    conditionPart = thresholdFormatted
  } else if (durationFormatted) {
    conditionPart = durationFormatted
  }

  if (durationFormatted && conditionPart && conditionPart !== durationFormatted) {
    if (durationFormatted === 'immediately') {
      conditionPart = `${conditionPart} ${durationFormatted}`
    } else {
      conditionPart = `${conditionPart} for ${durationFormatted}`
    }
  }

  return conditionPart
}
