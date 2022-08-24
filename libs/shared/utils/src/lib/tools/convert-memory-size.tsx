export const convertMemory = (memory?: any, size?: 'GB' | 'MB') => {
  if (!memory) return

  if (size === 'GB') {
    return parseInt(memory, 10) * 1024
  } else {
    return memory
  }
}
