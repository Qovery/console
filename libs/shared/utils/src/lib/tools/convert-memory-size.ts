export const convertMemory = (memory?: number, size?: 'GB' | 'MB') => {
  if (!memory) return 0

  if (size === 'GB') {
    return memory * 1024
  } else {
    return memory / 1024
  }
}
