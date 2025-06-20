import { type ComponentPropsWithoutRef, type ElementRef, createContext, forwardRef, useContext } from 'react'
import {
  CartesianGrid,
  type CartesianGridProps,
  Legend,
  type LegendProps,
  Line,
  LineChart,
  type LineProps,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  type XAxisProps,
  YAxis,
  type YAxisProps,
} from 'recharts'
import { twMerge } from '@qovery/shared/util-js'
import LoaderSpinner from '../loader-spinner/loader-spinner'

type ChartDataPoint = Record<string, string | number | Date | null | undefined>

interface ChartContextValue<T extends ChartDataPoint = ChartDataPoint> {
  data: T[]
  isLoading?: boolean
  height?: string | number
}

const ChartContext = createContext<ChartContextValue>({ data: [] })

interface ChartRootProps<T extends ChartDataPoint = ChartDataPoint>
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  data: T[]
  isLoading?: boolean
  height?: string | number
  title?: string
  subtitle?: string
  children?: React.ReactNode
}

const ChartRoot = forwardRef<ElementRef<'div'>, ChartRootProps>(function ChartRoot(
  { className, children, data, isLoading = false, height = 320, title, subtitle, ...props },
  ref
) {
  if (isLoading) {
    return (
      <div
        ref={ref}
        className={twMerge(
          'flex items-center justify-center rounded border border-neutral-250 bg-neutral-50',
          className
        )}
        style={{ height }}
        {...props}
      >
        <div className="text-neutral-400">
          <LoaderSpinner />
        </div>
      </div>
    )
  }

  if (!data || !data.length) {
    return (
      <div
        ref={ref}
        className={twMerge(
          'flex items-center justify-center rounded-lg border border-neutral-250 bg-neutral-50',
          className
        )}
        style={{ height }}
        {...props}
      >
        <div className="text-neutral-400">No data available</div>
      </div>
    )
  }

  return (
    <ChartContext.Provider value={{ data, isLoading, height }}>
      <div ref={ref} className={twMerge('rounded-lg border border-neutral-250 bg-white p-4', className)} {...props}>
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>}
            {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
          </div>
        )}

        <div style={{ height }}>{children}</div>
      </div>
    </ChartContext.Provider>
  )
})

interface ChartContainerProps {
  children: React.ReactNode
  margin?: {
    top?: number
    right?: number
    left?: number
    bottom?: number
  }
}

const ChartContainer = function ChartContainer({
  children,
  margin = { top: 10, right: 30, left: 20, bottom: 0 },
}: ChartContainerProps) {
  const { data } = useContext(ChartContext)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={margin}>
        {children}
      </LineChart>
    </ResponsiveContainer>
  )
}

interface ChartXAxisProps extends XAxisProps {}

const ChartXAxis = function ChartXAxis({
  tick = { fontSize: 12, fill: '#6b7280' },
  tickLine = { stroke: '#e5e7eb' },
  axisLine = { stroke: '#e5e7eb' },
  ...props
}: ChartXAxisProps) {
  return <XAxis tick={tick} tickLine={tickLine} axisLine={axisLine} {...props} />
}

interface ChartYAxisProps extends YAxisProps {}

const ChartYAxis = function ChartYAxis({
  tick = { fontSize: 12, fill: '#6b7280' },
  tickLine = { stroke: '#e5e7eb' },
  axisLine = { stroke: '#e5e7eb' },
  ...props
}: ChartYAxisProps) {
  return <YAxis tick={tick} tickLine={tickLine} axisLine={axisLine} {...props} />
}

interface ChartGridProps extends CartesianGridProps {}

const ChartGrid = function ChartGrid({ strokeDasharray = '3 3', stroke = '#f3f4f6', ...props }: ChartGridProps) {
  return <CartesianGrid strokeDasharray={strokeDasharray} stroke={stroke} {...props} />
}

interface ChartTooltipProps extends TooltipProps<string | number, string | number> {}

const ChartTooltip = function ChartTooltip({
  contentStyle = {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    color: '#374151',
  },
  labelStyle = { color: '#374151' },
  ...props
}: ChartTooltipProps) {
  return <Tooltip contentStyle={contentStyle} labelStyle={labelStyle} {...props} />
}

type LinePropsWithoutRef = Omit<LineProps, 'ref'>

interface ChartLineProps extends LinePropsWithoutRef {}

const ChartLine = function ChartLine({
  type = 'monotone',
  stroke = 'var(--color-brand-500)',
  strokeWidth = 2,
  dot = false,
  activeDot = { r: 4, fill: 'var(--color-brand-500)' },
  ...props
}: ChartLineProps) {
  return <Line type={type} stroke={stroke} strokeWidth={strokeWidth} dot={dot} activeDot={activeDot} {...props} />
}

type LegendPropsWithoutRef = Omit<LegendProps, 'ref'>

interface ChartLegendProps extends LegendPropsWithoutRef {}

const ChartLegend = function ChartLegend({
  wrapperStyle = { fontSize: '12px', color: '#6b7280' },
  iconType = 'line',
  ...props
}: ChartLegendProps) {
  return <Legend wrapperStyle={wrapperStyle} iconType={iconType} {...props} />
}

const Chart = Object.assign(
  {},
  {
    Root: ChartRoot,
    Container: ChartContainer,
    XAxis: ChartXAxis,
    YAxis: ChartYAxis,
    Grid: ChartGrid,
    Tooltip: ChartTooltip,
    Line: ChartLine,
    Legend: ChartLegend,
  }
)

export { Chart, ChartRoot, ChartContainer, ChartXAxis, ChartYAxis, ChartGrid, ChartTooltip, ChartLine, ChartLegend }

export type {
  ChartRootProps,
  ChartContainerProps,
  ChartXAxisProps,
  ChartYAxisProps,
  ChartGridProps,
  ChartTooltipProps,
  ChartLineProps,
  ChartLegendProps,
  ChartDataPoint,
}
