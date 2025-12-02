import {
  formatDuration,
  formatFunction,
  formatMetricLabel,
  formatOperator,
  formatThreshold,
  generateConditionDescription,
} from './generate-condition-description'

describe('formatMetricLabel', () => {
  it('should return override value for known metric tags', () => {
    expect(formatMetricLabel('cpu')).toBe('CPU')
    expect(formatMetricLabel('memory')).toBe('Memory')
    expect(formatMetricLabel('instances')).toBe('Instances')
    expect(formatMetricLabel('k8s_event')).toBe('K8s events')
    expect(formatMetricLabel('network')).toBe('Network')
    expect(formatMetricLabel('logs')).toBe('Logs')
  })

  it('should format single word tags with short words (<=3 chars) as uppercase', () => {
    expect(formatMetricLabel('api')).toBe('API')
    expect(formatMetricLabel('id')).toBe('ID')
    expect(formatMetricLabel('url')).toBe('URL')
  })

  it('should format single word tags with long words (>3 chars) with capitalized first letter', () => {
    expect(formatMetricLabel('database')).toBe('Database')
    expect(formatMetricLabel('application')).toBe('Application')
  })

  it('should format multi-word tags separated by underscores', () => {
    expect(formatMetricLabel('http_request')).toBe('HTTP Request')
    expect(formatMetricLabel('cpu_usage')).toBe('CPU Usage')
    expect(formatMetricLabel('memory_consumption')).toBe('Memory Consumption')
  })

  it('should handle "http" as special case and return "HTTP"', () => {
    expect(formatMetricLabel('http')).toBe('HTTP')
    expect(formatMetricLabel('http_request')).toBe('HTTP Request')
    expect(formatMetricLabel('http_latency')).toBe('HTTP Latency')
  })
})

describe('formatOperator', () => {
  it('should return symbol for known operators', () => {
    expect(formatOperator('ABOVE')).toBe('>')
    expect(formatOperator('BELOW')).toBe('<')
  })

  it('should return original value for unknown operators', () => {
    expect(formatOperator('EQUAL')).toBe('EQUAL')
    expect(formatOperator('unknown')).toBe('unknown')
  })
})

describe('formatThreshold', () => {
  it('should format threshold as percentage for normal metrics', () => {
    expect(formatThreshold(undefined, 80)).toBe('80%')
    expect(formatThreshold(undefined, 0.855)).toBe('85.5%')
    expect(formatThreshold(undefined, 0.85)).toBe('85%')
  })

  it('should format threshold as milliseconds for http_latency', () => {
    expect(formatThreshold('http_latency', 100)).toBe('100ms')
    expect(formatThreshold('http_latency', 50)).toBe('50ms')
  })
})

describe('formatDuration', () => {
  it('should return undefined for invalid duration format', () => {
    expect(formatDuration('invalid')).toBeUndefined()
    expect(formatDuration('P1D')).toBeUndefined()
  })

  it('should format seconds correctly', () => {
    expect(formatDuration('PT5S')).toBe('5 seconds')
    expect(formatDuration('PT1S')).toBe('immediately')
  })

  it('should format minutes correctly', () => {
    expect(formatDuration('PT5M')).toBe('5 minutes')
    expect(formatDuration('PT1M')).toBe('1 minute')
  })

  it('should format hours correctly', () => {
    expect(formatDuration('PT2H')).toBe('2 hours')
    expect(formatDuration('PT1H')).toBe('1 hour')
  })

  it('should format combined duration', () => {
    expect(formatDuration('PT1H30M')).toBe('1 hour 30 minutes')
    expect(formatDuration('PT2H15M30S')).toBe('2 hours 15 minutes 30 seconds')
  })
})

describe('formatFunction', () => {
  it('should return label for known functions', () => {
    expect(formatFunction('MAX')).toBe('Maximum')
    expect(formatFunction('AVG')).toBe('Average')
    expect(formatFunction('MIN')).toBe('Minimum')
    expect(formatFunction('COUNT')).toBe('Count')
    expect(formatFunction('NONE')).toBe('')
  })
})

describe('generateConditionDescription', () => {
  it('should generate full condition description', () => {
    expect(generateConditionDescription('AVG', 'ABOVE', 80, 'cpu')).toBe('CPU - Average > 80%')
  })

  it('should handle http_latency metric', () => {
    expect(generateConditionDescription('AVG', 'ABOVE', 100, 'http_latency')).toBe('HTTP Latency - Average > 100ms')
  })

  it('should handle missing parts', () => {
    expect(generateConditionDescription('AVG', undefined, 80, 'cpu')).toBe('CPU - Average 80%')
    expect(generateConditionDescription(undefined, 'ABOVE', 80, 'cpu')).toBe('CPU - > 80%')
    expect(generateConditionDescription('AVG', 'ABOVE', undefined, 'cpu')).toBe('CPU - Average >')
  })

  it('should return only metric when no condition parts', () => {
    expect(generateConditionDescription(undefined, undefined, undefined, 'cpu')).toBe('CPU')
  })

  it('should return only condition part when no metric', () => {
    expect(generateConditionDescription('AVG', 'ABOVE', 80)).toBe('Average > 80%')
  })
})
