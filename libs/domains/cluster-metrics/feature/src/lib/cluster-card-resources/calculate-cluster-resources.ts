import { type ClusterNodeDto } from 'qovery-ws-typescript-axios'

// Converts MiB to GiB
export const mibToGib = (mib: number): number => {
  return mib / 1024
}

// Converts millicores to vCPU
export const milliCoreToVCPU = (milliCore: number): number => {
  return milliCore / 1000
}

// Format number to a specific precision and handle NaN
export const formatNumber = (num: number, precision = 2): number => {
  return isNaN(num) ? 0 : Number(num.toFixed(precision))
}

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
    usedCpuMilli += node.resources_allocated.request_cpu_milli

    // Memory
    totalMemoryMib += node.resources_capacity.memory_mib
    usedMemoryMib += node.resources_allocated.request_memory_mib

    // Disk
    totalDiskMib += node.resources_capacity.ephemeral_storage_mib
    if (node.metrics_usage.disk_mib_usage !== null) {
      usedDiskMib += node.metrics_usage.disk_mib_usage ?? 0
    }
  })

  // Convert to display units
  const cpuUsed = formatNumber(milliCoreToVCPU(usedCpuMilli))
  const cpuTotal = formatNumber(milliCoreToVCPU(totalCpuMilli))

  const cpuPercent = cpuTotal > 0 ? formatNumber((cpuUsed / cpuTotal) * 100) : 0

  const memoryUsed = formatNumber(mibToGib(usedMemoryMib))
  const memoryTotal = formatNumber(mibToGib(totalMemoryMib))
  const memoryPercent = memoryTotal > 0 ? formatNumber((memoryUsed / memoryTotal) * 100) : 0

  const diskUsed = formatNumber(mibToGib(usedDiskMib))
  const diskTotal = formatNumber(mibToGib(totalDiskMib))
  const diskPercent = diskTotal > 0 ? formatNumber((diskUsed / diskTotal) * 100) : 0

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
