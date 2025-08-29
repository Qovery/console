import React from 'react'
import { addSeriesClassesToChildren, extractChartSeriesFromChildren } from './chart-series-utils'

describe('extractChartSeriesFromChildren', () => {
  it('should return empty array for null children', () => {
    const result = extractChartSeriesFromChildren(null)
    expect(result).toEqual([])
  })

  it('should return empty array for undefined children', () => {
    const result = extractChartSeriesFromChildren(undefined)
    expect(result).toEqual([])
  })

  it('should extract series from single child with dataKey and stroke', () => {
    const child = React.createElement('Line', {
      dataKey: 'cpu',
      stroke: '#ff0000',
      name: 'CPU Usage',
    })

    const result = extractChartSeriesFromChildren(child)
    expect(result).toEqual([
      {
        key: 'cpu',
        label: 'CPU Usage',
        color: '#ff0000',
      },
    ])
  })

  it('should extract series from child with dataKey and fill', () => {
    const child = React.createElement('Area', {
      dataKey: 'memory',
      fill: '#00ff00',
    })

    const result = extractChartSeriesFromChildren(child)
    expect(result).toEqual([
      {
        key: 'memory',
        label: 'memory',
        color: '#00ff00',
      },
    ])
  })

  it('should ignore elements with dataKey but no stroke or fill', () => {
    const child = React.createElement('Bar', {
      dataKey: 'disk',
    })

    const result = extractChartSeriesFromChildren(child)
    expect(result).toEqual([])
  })

  it('should prefer stroke over fill for color', () => {
    const child = React.createElement('Bar', {
      dataKey: 'disk',
      stroke: '#ff0000',
      fill: '#00ff00',
    })

    const result = extractChartSeriesFromChildren(child)
    expect(result).toEqual([
      {
        key: 'disk',
        label: 'disk',
        color: '#ff0000',
      },
    ])
  })

  it('should use default color when stroke and fill are empty strings', () => {
    const child = React.createElement('Bar', {
      dataKey: 'disk',
      stroke: '',
      fill: '0',
    })

    const result = extractChartSeriesFromChildren(child)
    expect(result).toEqual([
      {
        key: 'disk',
        label: 'disk',
        color: '0',
      },
    ])
  })

  it('should extract series from array of children', () => {
    const children = [
      React.createElement('Line', {
        dataKey: 'cpu',
        stroke: '#ff0000',
      }),
      React.createElement('Area', {
        dataKey: 'memory',
        fill: '#00ff00',
      }),
    ]

    const result = extractChartSeriesFromChildren(children)
    expect(result).toHaveLength(2)
    expect(result[0].key).toBe('cpu')
    expect(result[1].key).toBe('memory')
  })

  it('should deduplicate series with same dataKey', () => {
    const children = [
      React.createElement('Line', {
        dataKey: 'cpu',
        stroke: '#ff0000',
      }),
      React.createElement('Line', {
        dataKey: 'cpu',
        stroke: '#0000ff',
      }),
    ]

    const result = extractChartSeriesFromChildren(children)
    expect(result).toHaveLength(1)
    expect(result[0].color).toBe('#ff0000')
  })

  it('should process nested children recursively', () => {
    const parent = React.createElement(
      'div',
      {},
      React.createElement('Line', {
        dataKey: 'cpu',
        stroke: '#ff0000',
      })
    )

    const result = extractChartSeriesFromChildren(parent)
    expect(result).toEqual([
      {
        key: 'cpu',
        label: 'cpu',
        color: '#ff0000',
      },
    ])
  })

  it('should ignore children without dataKey', () => {
    const children = [
      React.createElement('div', { className: 'chart-container' }),
      React.createElement('Line', {
        dataKey: 'cpu',
        stroke: '#ff0000',
      }),
    ]

    const result = extractChartSeriesFromChildren(children)
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('cpu')
  })
})

describe('addSeriesClassesToChildren', () => {
  const mockSanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9]/g, '-')

  it('should filter out null and undefined children', () => {
    const children = ['text', 123, null, undefined]
    const result = addSeriesClassesToChildren(children, mockSanitizeKey)
    expect(result).toEqual(['text', 123])
  })

  it('should add series classes to elements with dataKey', () => {
    const child = React.createElement('Line', {
      dataKey: 'cpu-usage',
      stroke: '#ff0000',
    })

    const result = addSeriesClassesToChildren(child, mockSanitizeKey)
    const resultArray = React.Children.toArray(result)
    const firstChild = resultArray[0] as React.ReactElement

    expect(firstChild.props.className).toBe('series series--cpu-usage')
  })

  it('should append to existing className', () => {
    const child = React.createElement('Line', {
      dataKey: 'memory',
      className: 'existing-class',
    })

    const result = addSeriesClassesToChildren(child, mockSanitizeKey)
    const resultArray = React.Children.toArray(result)
    const firstChild = resultArray[0] as React.ReactElement

    expect(firstChild.props.className).toBe('existing-class series series--memory')
  })

  it('should not modify elements without dataKey', () => {
    const child = React.createElement('div', {
      className: 'container',
    })

    const result = addSeriesClassesToChildren(child, mockSanitizeKey)
    const resultArray = React.Children.toArray(result)
    const firstChild = resultArray[0] as React.ReactElement

    expect(firstChild.props.className).toBe('container')
  })

  it('should handle multiple children', () => {
    const children = [
      React.createElement('Line', {
        dataKey: 'cpu',
      }),
      React.createElement('Area', {
        dataKey: 'memory',
      }),
      React.createElement('div', {
        className: 'container',
      }),
    ]

    const result = addSeriesClassesToChildren(children, mockSanitizeKey)
    const resultArray = React.Children.toArray(result)

    expect((resultArray[0] as React.ReactElement).props.className).toBe('series series--cpu')
    expect((resultArray[1] as React.ReactElement).props.className).toBe('series series--memory')
    expect((resultArray[2] as React.ReactElement).props.className).toBe('container')
  })

  it('should use sanitizeKey function properly', () => {
    const child = React.createElement('Line', {
      dataKey: 'cpu.usage%data',
    })

    const result = addSeriesClassesToChildren(child, mockSanitizeKey)
    const resultArray = React.Children.toArray(result)
    const firstChild = resultArray[0] as React.ReactElement

    expect(firstChild.props.className).toBe('series series--cpu-usage-data')
  })
})
