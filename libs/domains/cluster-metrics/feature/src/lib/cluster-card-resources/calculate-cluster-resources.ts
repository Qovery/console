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
    if (node.metrics_usage.disk_mib_usage !== null) {
      usedDiskMib += node.metrics_usage.disk_mib_usage ?? 0
    }
  })

  // Convert to display units
  const cpuUsed = formatNumber(milliCoreToVCPU(usedCpuMilli))
  const cpuTotal = formatNumber(milliCoreToVCPU(totalCpuMilli))
  const cpuPercent = formatNumber(calculatePercentage(cpuUsed, cpuTotal))

  const memoryUsed = formatNumber(mibToGib(usedMemoryMib))
  const memoryTotal = formatNumber(mibToGib(totalMemoryMib))
  const memoryPercent = formatNumber(calculatePercentage(memoryUsed, memoryTotal))

  const diskUsed = formatNumber(mibToGib(usedDiskMib))
  const diskTotal = formatNumber(mibToGib(totalDiskMib))
  const diskPercent = formatNumber(calculatePercentage(diskUsed, diskTotal))

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
