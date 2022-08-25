export const convertCpuToVCpu = (cpu?: number): number => {
  if (cpu) return cpu / 1000
  return 0
}
