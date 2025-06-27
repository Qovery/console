import { type ClusterNodeDto } from 'qovery-ws-typescript-axios'
import { calculatePercentage, formatNumber, mibToGib, milliCoreToVCPU } from '@qovery/shared/util-js'

export interface ResourcesProps {
  used: number
  total: number
  percent: number
  unit: string
}

export const calculateClusterResources = (nodes?: ClusterNodeDto[]) => {
  let totalCpuMilli = 0
  let usedCpuMilli = 0
  let totalMemoryMib = 0
  let usedMemoryMib = 0
  let totalDiskMib = 0
  let usedDiskMib = 0

  nodes?.forEach((node) => {
    // CPU
    totalCpuMilli += node.resources_capacity.cpu_milli
    usedCpuMilli += node.resources_allocated.request_cpu_milli || 0

    // Memory
    totalMemoryMib += node.resources_capacity.memory_mib
    usedMemoryMib += node.resources_allocated.request_memory_mib || 0

    // Disk
    totalDiskMib += node.resources_capacity.ephemeral_storage_mib
    if (node.metrics_usage.ephemeral_storage_usage !== null) {
      usedDiskMib += node.metrics_usage.ephemeral_storage_usage ?? 0
    }
  })

  // Convert to display units
  const cpuUsed = formatNumber(milliCoreToVCPU(usedCpuMilli), 0)
  const cpuTotal = formatNumber(milliCoreToVCPU(totalCpuMilli), 0)
  const cpuPercent = formatNumber(calculatePercentage(usedCpuMilli, totalCpuMilli), 0)

  const memoryUsed = formatNumber(mibToGib(usedMemoryMib), 0)
  const memoryTotal = formatNumber(mibToGib(totalMemoryMib), 0)
  const memoryPercent = formatNumber(calculatePercentage(usedMemoryMib, totalMemoryMib), 0)

  const diskUsed = formatNumber(mibToGib(usedDiskMib), 0)
  const diskTotal = formatNumber(mibToGib(totalDiskMib), 0)
  const diskPercent = formatNumber(calculatePercentage(usedDiskMib, totalDiskMib), 0)

  return {
    cpu: {
      used: cpuUsed,
      total: cpuTotal,
      percent: cpuPercent,
      unit: 'vCPU',
    },
    memory: {
      used: memoryUsed,
      total: memoryTotal,
      percent: memoryPercent,
      unit: 'GB',
    },
    disk: {
      used: diskUsed,
      total: diskTotal,
      percent: diskPercent,
      unit: 'GB',
    },
  }
}
