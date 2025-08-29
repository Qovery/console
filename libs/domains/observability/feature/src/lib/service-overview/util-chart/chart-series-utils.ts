import { Children, type ReactElement, type ReactNode, cloneElement, isValidElement } from 'react'

/**
 * Utility function to extract chart series information from React children
 */
export function extractChartSeriesFromChildren(
  children: ReactNode
): Array<{ key: string; label: string; color: string }> {
  const series: Array<{ key: string; label: string; color: string }> = []

  const processChild = (child: ReactNode): void => {
    if (!child) return

    if (Array.isArray(child)) {
      child.forEach(processChild)
      return
    }

    if (typeof child === 'object' && 'props' in child) {
      const element = child as ReactElement

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

/**
 * Utility function to add CSS classes to chart series children for highlighting
 * This adds the required 'series series--{sanitizedKey}' classes that the highlighting hook expects
 */
export function addSeriesClassesToChildren(children: ReactNode, sanitizeKey: (key: string) => string): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child

    // Check if this is a chart series component (has dataKey)
    if (child.props?.dataKey) {
      const dataKey = String(child.props.dataKey)
      const seriesClass = `series series--${sanitizeKey(dataKey)}`

      // Clone the element and add the CSS class
      const existingClassName = child.props.className || ''
      const newClassName = existingClassName ? `${existingClassName} ${seriesClass}` : seriesClass

      return cloneElement(child, {
        ...child.props,
        className: newClassName,
      })
    }

    return child
  })
}
