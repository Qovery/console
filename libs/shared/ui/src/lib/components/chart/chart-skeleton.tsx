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
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 336 216">
            <path
              fill="#C7D3E4"
              d="m-275.208 11.077-26.792 24V216h940V79.846l-2.28-16.615L626.029 66l-9.121-13.385L596.387 66V43.846l-22.802 28.616-31.352 37.846V82.615l-20.522 27.693-6.27-7.385-9.121-30.461-22.801 20.307-22.802-32.308-5.131 27.231-9.12-29.077-7.411 13.846-33.062 15.231H368.94L350.129 66l-17.672 56.308-11.971-19.385-27.362 19.385-7.98-39.693-14.251 14.308-17.672-4.154-16.531-40.154-17.671 64.616-16.531-34.616-11.401 34.616-47.314 17.538-8.299-17.538-10.512 17.538-9.121-7.384-26.222 7.384V96.923L71.378 92.77l-5.022-40.154-7.52 50.308-12.402-44.308-12.679 68.77-15.391-39.693-21.662 39.693-14.913-24.462-14.159 14.308-6.983-24.462-7.268 17.539-14.821-27.693V35.077L-96.215 66V43.846L-111.036 66l-18.241-30.923-16.531 17.538-6.271-22.153-13.681 22.153-10.261-8.769-6.27 14.77-6.271 7.384-9.69 6.462L-206.803 0l-13.681 27.692-15.391 54.923L-242.716 0l-10.26 30.462L-258.107 0l-5.13 43.846-6.841-38.77-2.85 28.616z"
              opacity="0.35"
            ></path>
          </svg>
          <XAxis type="number" dataKey="x" domain={[0, 100]} hide={true} />
          <YAxis type="number" domain={[0, 100]} hide={true} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ChartSkeleton
