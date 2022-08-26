export const convertCpuToVCpu = (cpu?: number, inverse?: boolean): number => {
  if (cpu && inverse) return cpu * 1000
  if (cpu) return cpu / 1000
  return 0
}
