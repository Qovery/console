import { AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { twMerge } from '@qovery/shared/util-js'

interface ChartSkeletonProps {
  className?: string
}

export const ChartSkeleton = ({ className }: ChartSkeletonProps) => {
  // We keep recharts components to maintain proper aspect ratio calculation with CartesianGrid
  return (
    <div className={twMerge('h-full w-full', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-200)" strokeDasharray="2 4" />
          <XAxis type="number" dataKey="x" domain={[0, 100]} hide={true} />
          <YAxis type="number" domain={[0, 100]} hide={true} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ChartSkeleton
