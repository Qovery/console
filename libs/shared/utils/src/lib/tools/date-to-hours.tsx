export const dateToHours = (date: string) => {
  const d = new Date(date)
  const hours = d.getHours() - 1 < 10 ? '0' + (d.getHours() - 1) : d.getHours() - 1
  const minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()
  return `${hours}:${minutes}`
}
