export const convertMemory = (memory?: number, size?: 'GB' | 'MB') => {
  if (!memory) return

  if (size === 'GB') {
    return memory * 1024
  } else {
    return memory / 1024
  }
}
