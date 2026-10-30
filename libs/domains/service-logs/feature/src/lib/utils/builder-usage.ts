import { type BuilderUsage } from 'qovery-typescript-axios'
import { pluralize } from '@qovery/shared/util-js'

// Share of the build memory limit from which the builder is close to running out of memory
const MEMORY_WARNING_RATIO = 0.9

export type BuilderMemoryLevel = 'OK' | 'WARNING' | 'OOM'

export interface BuilderUsageLimits {
  cpuMilli?: number
  memoryGib?: number
}

export interface BuilderUsageSummary {
  cpu: { average: string; peak: string }
  memory: { peak: string; level: BuilderMemoryLevel }
}

// One decimal at most: `1.2`, `8`
function formatAmount(value: number) {
  return Number(value.toFixed(1)).toString()
}

// `1.2 / 8 cores`, or `1.2 cores` when the limit is unknown
function formatUsage(value: number, limit: number | undefined, singularUnit: string, pluralUnit: string) {
  const unit = pluralize(limit ?? value, singularUnit, pluralUnit)
  return limit ? `${formatAmount(value)} / ${formatAmount(limit)} ${unit}` : `${formatAmount(value)} ${unit}`
}

/**
 * Summarizes what the builder used against the build limits of the service.
 * Returns nothing when the builder wasn't sampled.
 */
export function getBuilderUsageSummary(
  usage: BuilderUsage | undefined,
  { cpuMilli, memoryGib }: BuilderUsageLimits
): BuilderUsageSummary | undefined {
  if (usage?.cpu_milli_avg === undefined || usage.cpu_milli_max === undefined || usage.memory_mib_max === undefined) {
    return undefined
  }

  const cpuLimitCores = cpuMilli ? cpuMilli / 1000 : undefined
  const memoryPeakGib = usage.memory_mib_max / 1024
  const memoryRatio = memoryGib ? memoryPeakGib / memoryGib : undefined

  const memoryLevel: BuilderMemoryLevel = usage.oom_killed
    ? 'OOM'
    : memoryRatio !== undefined && memoryRatio >= MEMORY_WARNING_RATIO
      ? 'WARNING'
      : 'OK'

  return {
    cpu: {
      average: formatUsage(usage.cpu_milli_avg / 1000, cpuLimitCores, 'core', 'cores'),
      peak: formatUsage(usage.cpu_milli_max / 1000, cpuLimitCores, 'core', 'cores'),
    },
    memory: {
      peak: `${formatUsage(memoryPeakGib, memoryGib, 'GiB', 'GiB')}${
        memoryRatio !== undefined ? ` (${Math.round(memoryRatio * 100)}%)` : ''
      }`,
      level: memoryLevel,
    },
  }
}
