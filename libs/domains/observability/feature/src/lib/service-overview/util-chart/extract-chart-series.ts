/**
 * Utility function to extract chart series information from React children
 */
export function extractChartSeriesFromChildren(
  children: React.ReactNode
): Array<{ key: string; label: string; color: string }> {
  const series: Array<{ key: string; label: string; color: string }> = []

  const processChild = (child: React.ReactNode): void => {
    if (!child) return

    if (Array.isArray(child)) {
      child.forEach(processChild)
      return
    }

    if (typeof child === 'object' && 'props' in child) {
      const element = child as React.ReactElement

      // Check if this is a chart series component (Line, Area, Bar, etc.)
      if (element.props?.dataKey && (element.props?.stroke || element.props?.fill)) {
        const dataKey = String(element.props.dataKey)
        const color = element.props.stroke || element.props.fill || 'var(--color-brand-500)'
        const label = element.props.name || dataKey

        if (!series.some((s) => s.key === dataKey)) {
          series.push({ key: dataKey, label, color })
        }
      }

      // Recursively process children
      if (element.props?.children) {
        processChild(element.props.children)
      }
    }
  }

  processChild(children)
  return series
}
