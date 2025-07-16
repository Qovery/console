import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { ReferenceLine } from 'recharts'
import { type Props as LabelProps } from 'recharts/types/component/Label'
import { useServiceOverviewContext } from '../util-filter/service-overview-context'

interface ReferenceLineEventsProps {
  events?: OrganizationEventResponse[]
}

export function ReferenceLineEvents({ events }: ReferenceLineEventsProps) {
  const { startTimestamp, endTimestamp } = useServiceOverviewContext()

  const eventsDeployed = events?.filter((event) => event.event_type === 'DEPLOYED')

  const deploymentTimestamps = useMemo(() => {
    return (
      eventsDeployed
        ?.map((event) => {
          const timestamp = event.timestamp ? new Date(event.timestamp).getTime() : null
          return timestamp
        })
        .filter((timestamp): timestamp is number => timestamp !== null) || []
    )
  }, [eventsDeployed])

  return (
    <>
      {deploymentTimestamps.map((timestamp: number) => {
        const isInRange = timestamp >= Number(startTimestamp) * 1000 && timestamp <= Number(endTimestamp) * 1000
        if (!isInRange) return null

        return (
          <ReferenceLine
            key={timestamp}
            x={timestamp}
            stroke="transparent"
            label={{
              content: (props: LabelProps) => {
                const { viewBox } = props
                if (
                  !viewBox ||
                  !('x' in viewBox) ||
                  !('y' in viewBox) ||
                  !('width' in viewBox) ||
                  !('height' in viewBox)
                )
                  return null

                const x = (viewBox.x || 0) + (viewBox.width || 0) / 2
                const y = (viewBox.height || 0) + 30

                return (
                  <foreignObject x={x - 10} y={y - 54} width={20} height={20}>
                    <div className="flex cursor-pointer justify-center text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                        <path
                          fill="#5B50D6"
                          d="M0 10C0 4.477 4.477 0 10 0s10 4.477 10 10-4.477 10-10 10S0 15.523 0 10"
                        ></path>
                        <g clipPath="url(#clip0_25056_143195)">
                          <path
                            fill="#fff"
                            d="M7.46 4.915a1.127 1.127 0 0 0-1.71.96v8.25a1.127 1.127 0 0 0 1.71.96l6.75-4.124a1.125 1.125 0 0 0 0-1.922z"
                          ></path>
                        </g>
                        <defs>
                          <clipPath id="clip0_25056_143195">
                            <path fill="#fff" d="M4 4h12v12H4z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                  </foreignObject>
                )
              },
            }}
          />
        )
      })}
    </>
  )
}

export default ReferenceLineEvents
