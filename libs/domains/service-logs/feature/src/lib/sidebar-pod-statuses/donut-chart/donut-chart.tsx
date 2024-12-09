import { useMemo } from 'react'

interface ChartItem {
  value: number
  color: string
}

interface DonutChartProps {
  width: number
  height: number
  items: ChartItem[]
  innerRadius: number
  outerRadius: number
}

interface Segment extends ChartItem {
  path: string
}

const getCirclePath = (innerRadius: number, outerRadius: number): string => {
  // Draw a complete circle for single value at 100%
  return `
    M ${0},${-innerRadius}
    L ${0},${-outerRadius}
    A ${outerRadius} ${outerRadius} 0 1 1 ${0},${outerRadius}
    A ${outerRadius} ${outerRadius} 0 1 1 ${0},${-outerRadius}
    L ${0},${-innerRadius}
    A ${innerRadius} ${innerRadius} 0 1 0 ${0},${innerRadius}
    A ${innerRadius} ${innerRadius} 0 1 0 ${0},${-innerRadius}
    Z
  `
}

const getArcPath = (start: number, end: number, innerRadius: number, outerRadius: number): string => {
  // Handle edge case where start and end are the same
  if (Math.abs(end - start) < 0.001) return ''

  const startAngle = start * Math.PI * 2
  const endAngle = end * Math.PI * 2

  const x1 = innerRadius * Math.sin(startAngle)
  const y1 = innerRadius * -Math.cos(startAngle)
  const x2 = outerRadius * Math.sin(startAngle)
  const y2 = outerRadius * -Math.cos(startAngle)
  const x3 = outerRadius * Math.sin(endAngle)
  const y3 = outerRadius * -Math.cos(endAngle)
  const x4 = innerRadius * Math.sin(endAngle)
  const y4 = innerRadius * -Math.cos(endAngle)

  const bigArc = end - start >= 0.5
  const outerFlags = bigArc ? '1 1 1' : '0 0 1'
  const innerFlags = bigArc ? '1 1 0' : '1 0 0'

  return `M ${x1},${y1} L ${x2},${y2} A ${outerRadius} ${outerRadius} ${outerFlags} ${x3},${y3} 
        L ${x4},${y4} A ${innerRadius} ${innerRadius} ${innerFlags} ${x1},${y1} Z`
}

// Inspired by https://medium.com/@mrovinsky/pure-react-donut-chart-component-9272cb8e1cc1
export function DonutChart({ width, height, items, innerRadius, outerRadius }: DonutChartProps) {
  const segments = useMemo<Segment[]>(() => {
    // Handle empty items array
    if (items.length === 0) {
      return [
        {
          value: 100,
          color: '#67778E',
          path: getCirclePath(innerRadius, outerRadius),
        },
      ]
    }

    const sum = items.reduce((acc, item) => acc + item.value, 0)
    if (sum === 0) return []

    // Special case for single item
    if (items.length === 1) {
      return [
        {
          ...items[0],
          path: getCirclePath(innerRadius, outerRadius),
        },
      ]
    }

    let start = 0
    return items.map((item) => {
      const delta = item.value / sum
      const path = getArcPath(start, start + delta, innerRadius, outerRadius)
      start += delta
      return { ...item, path }
    })
  }, [items, innerRadius, outerRadius])

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {segments.map((segment) => (
          <path key={segment.color} stroke={segment.color} fill={segment.color} d={segment.path} />
        ))}
      </g>
    </svg>
  )
}

export default DonutChart
