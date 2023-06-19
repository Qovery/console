import { ProbeTypeEnum } from '@qovery/shared/enums'
import { probeFormatted } from './probe-formatted'

const defaultPort = 80

describe('Probe Formatted', () => {
  it('should return undefined if current_type is not defined', () => {
    const result = probeFormatted({}, null)
    expect(result).toBeUndefined()
  })

  it('should format HTTP type correctly', () => {
    const currentData = {
      current_type: ProbeTypeEnum.HTTP,
      type: {
        http: {
          port: '8080',
          path: '/healthcheck',
        },
      },
      initial_delay_seconds: '5',
      period_seconds: '10',
      timeout_seconds: '3',
      success_threshold: '1',
      failure_threshold: '3',
    }

    const expectedOutput = {
      type: {
        http: {
          port: 8080,
          path: '/healthcheck',
          scheme: 'HTTP',
        },
      },
      initial_delay_seconds: 5,
      period_seconds: 10,
      timeout_seconds: 3,
      success_threshold: 1,
      failure_threshold: 3,
    }

    const result = probeFormatted(currentData, defaultPort)

    expect(result).toEqual(expectedOutput)
  })

  it('should format TCP type correctly', () => {
    const currentData = {
      current_type: ProbeTypeEnum.TCP,
      type: {
        tcp: { port: '6379' },
      },
      initial_delay_seconds: '60',
      period_seconds: '30',
      timeout_seconds: '20',
      success_threshold: '2',
      failure_threshold: '6',
    }

    const expectedOutput = {
      type: {
        tcp: { port: 6379 },
      },
      initial_delay_seconds: 60,
      period_seconds: 30,
      timeout_seconds: 20,
      success_threshold: 2,
      failure_threshold: 6,
    }

    const result = probeFormatted(currentData, defaultPort)

    expect(result).toEqual(expectedOutput)
  })

  it('should format GRPC type correctly', () => {
    const currentData = {
      current_type: ProbeTypeEnum.GRPC,
      type: {
        grpc: { port: '8080', service: 'myservice' },
      },
      initial_delay_seconds: '30',
      period_seconds: '15',
      timeout_seconds: '5',
      success_threshold: '3',
      failure_threshold: '2',
    }

    const expectedOutput = {
      type: {
        grpc: { port: 8080, service: 'myservice' },
      },
      initial_delay_seconds: 30,
      period_seconds: 15,
      timeout_seconds: 5,
      success_threshold: 3,
      failure_threshold: 2,
    }

    const result = probeFormatted(currentData, defaultPort)

    expect(result).toEqual(expectedOutput)
  })

  it('should format EXEC type correctly', () => {
    const currentData = {
      current_type: ProbeTypeEnum.EXEC,
      type: {
        exec: { command: '["test","test"]' },
        grpc: { port: '8080', service: 'myservice' },
      },
      initial_delay_seconds: '30',
      period_seconds: '15',
      timeout_seconds: '5',
      success_threshold: '3',
      failure_threshold: '2',
    }

    const expectedOutput = {
      type: {
        exec: { command: ['test', 'test'] },
      },
      initial_delay_seconds: 30,
      period_seconds: 15,
      timeout_seconds: 5,
      success_threshold: 3,
      failure_threshold: 2,
    }

    const result = probeFormatted(currentData, defaultPort)

    expect(result).toEqual(expectedOutput)
  })

  it('should format NONE type correctly', () => {
    const currentData = {
      currentType: ProbeTypeEnum.NONE,
      type: {
        command: { command: 'hello,world' },
      },
      initial_delay_seconds: '10',
      period_seconds: '20',
      timeout_seconds: '8',
      success_threshold: '1',

      failure_threshold: '4',
    }

    const defaultPort = null

    const expectedOutput = undefined

    const result = probeFormatted(currentData, defaultPort)

    expect(result).toEqual(expectedOutput)
  })
})
