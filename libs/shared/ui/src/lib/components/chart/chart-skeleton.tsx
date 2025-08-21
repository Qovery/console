import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { twMerge } from '@qovery/shared/util-js'

interface ChartSkeletonProps {
  className?: string
}

export const ChartSkeleton = ({ className }: ChartSkeletonProps) => {
  // Dummy data to ensure proper Y-axis tick generation
  const skeletonData = [
    { foo: 0, bar: 0 },
    { foo: 100, bar: 100 },
  ]

  return (
    <div className={twMerge('h-full w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={skeletonData} margin={{ top: 14, bottom: 0, left: 0, right: 0 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-200)" strokeDasharray="2 4" />
          <XAxis type="number" dataKey="foo" domain={[0, 100]} hide={true} />
          <YAxis type="number" domain={[0, 100]} hide={true} tickCount={5} orientation="right" />
          {/* Invisible line to force Y-axis calculation */}
          <Line
            type="linear"
            dataKey="bar"
            stroke="transparent"
            strokeWidth={0}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ChartSkeleton
