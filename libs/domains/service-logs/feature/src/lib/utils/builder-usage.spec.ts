import { getBuilderUsageSummary } from './builder-usage'

describe('getBuilderUsageSummary', () => {
  const usage = { cpu_milli_avg: 1200, cpu_milli_max: 3800, memory_mib_max: 6144, samples: 30 }

  it('compares the usage with the build limits', () => {
    expect(getBuilderUsageSummary(usage, { cpuMilli: 8000, memoryGib: 16 })).toEqual({
      cpu: { average: '1.2 / 8 cores', peak: '3.8 / 8 cores' },
      memory: { peak: '6 / 16 GiB (38%)', level: 'OK' },
    })
  })

  it('shows the usage alone when the limits are unknown', () => {
    expect(getBuilderUsageSummary(usage, {})).toEqual({
      cpu: { average: '1.2 cores', peak: '3.8 cores' },
      memory: { peak: '6 GiB', level: 'OK' },
    })
  })

  it('warns when the memory peak gets close to the limit', () => {
    const summary = getBuilderUsageSummary({ ...usage, memory_mib_max: 15155 }, { memoryGib: 16 })

    expect(summary?.memory).toEqual({ peak: '14.8 / 16 GiB (92%)', level: 'WARNING' })
  })

  it('flags a builder killed for running out of memory', () => {
    const summary = getBuilderUsageSummary({ ...usage, memory_mib_max: 16384, oom_killed: true }, { memoryGib: 16 })

    expect(summary?.memory).toEqual({ peak: '16 / 16 GiB (100%)', level: 'OOM' })
  })

  it('returns nothing when the builder was not sampled', () => {
    expect(getBuilderUsageSummary(undefined, {})).toBeUndefined()
    expect(getBuilderUsageSummary({ samples: 0 }, {})).toBeUndefined()
  })
})
