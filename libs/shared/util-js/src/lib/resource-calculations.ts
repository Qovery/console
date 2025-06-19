export const mibToGib = (mib: number): number => {
  return mib / 1024
}

export const milliCoreToVCPU = (milliCore: number): number => {
  return milliCore / 1000
}

export const formatNumber = (num: number, precision = 0): number => {
  return isNaN(num) ? 0 : Number(num.toFixed(precision))
}

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return formatNumber((value / total) * 100)
}
