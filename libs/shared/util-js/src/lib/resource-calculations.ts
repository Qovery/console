/**
 * Converts MiB to GiB
 * @param mib - Value in MiB
 * @returns Value in GiB
 */
export const mibToGib = (mib: number): number => {
  return mib / 1024
}

/**
 * Converts millicores to vCPU
 * @param milliCore - Value in millicores
 * @returns Value in vCPU
 */
export const milliCoreToVCPU = (milliCore: number): number => {
  return milliCore / 1000
}

/**
 * Format number to a specific precision and handle NaN
 * @param num - Number to format
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted number
 */
export const formatNumber = (num: number, precision = 2): number => {
  return isNaN(num) ? 0 : Number(num.toFixed(precision))
}

/**
 * Calculate percentage between two numbers
 * @param value - Current value
 * @param total - Total value
 * @returns Percentage value
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return formatNumber((value / total) * 100)
}
