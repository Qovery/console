export const trimId = (id: string, type?: 'start' | 'end' | 'both') => {
  const start = id.slice(0, 5)
  const end = id.slice(id.length - 3, id.length)

  switch (type) {
    case 'start':
      return start
    case 'end':
      return end
    case 'both':
      return `${start}...${end}`
    default:
      return `${start}...${end}`
  }
}
