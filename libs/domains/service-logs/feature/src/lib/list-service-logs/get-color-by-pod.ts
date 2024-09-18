export const COLORS = [
  '#B160F0',
  '#D940FF',
  '#009EDD',
  '#F4C004',
  '#00FF66',
  '#FF5733',
  '#33CCCC',
  '#FF3399',
  '#FFCC00',
  '#66FF33',
  '#FF66CC',
  '#FF9900',
  '#00FFFF',
  '#FF00FF',
  '#8B4513',
  '#1E90FF',
  '#32CD32',
  '#FF1493',
  '#00CED1',
]

export function getColorByPod(pod: string) {
  if (!pod) return COLORS[0]

  const hashString = (string: string) => {
    let hash = 0
    if (string.length === 0) return hash
    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  const stringToColor = (string: string) => COLORS[Math.abs(hashString(string) % COLORS.length)]

  return stringToColor(pod)
}
