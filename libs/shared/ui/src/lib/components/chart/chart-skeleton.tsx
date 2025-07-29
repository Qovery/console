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
        <AreaChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={true} vertical={false} stroke="var(--color-neutral-200)" />
          <XAxis type="number" dataKey="x" domain={[0, 100]} hide={true} />
          <YAxis type="number" domain={[0, 100]} hide={true} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ChartSkeleton
