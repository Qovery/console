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

                // const event = eventsDeployed?.find((event) => {
                //   const eventTimestamp = event.timestamp ? new Date(event.timestamp).getTime() : null
                //   return eventTimestamp === timestamp
                // })

                return (
                  <foreignObject x={x - 8} y={y - 50} width={16} height={16}>
                    <div className="flex cursor-pointer justify-center text-center">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 20 20">
                          <path
                            fill="var(--color-brand-500)"
                            d="M0 10C0 4.477 4.477 0 10 0s10 4.477 10 10-4.477 10-10 10S0 15.523 0 10"
                          ></path>
                          <g clipPath="url(#clip0_30854_9562)">
                            <path
                              fill="var(--color-neutral-50)"
                              d="M7.938 5.875a.56.56 0 0 0-.563.563v7.125c0 .196-.033.386-.096.562h7.034c.311 0 .562-.25.562-.562V6.437a.56.56 0 0 0-.562-.562zm-2.25 9.375A1.686 1.686 0 0 1 4 13.563V6.625c0-.312.25-.562.563-.562.311 0 .562.25.562.562v6.938c0 .311.25.562.563.562.311 0 .562-.25.562-.562V6.437c0-.932.755-1.687 1.688-1.687h6.375c.932 0 1.687.755 1.687 1.688v7.125c0 .932-.755 1.687-1.687 1.687zm2.437-8.062c0-.312.25-.563.563-.563h2.25c.311 0 .562.25.562.563v1.875c0 .311-.25.562-.562.562h-2.25a.56.56 0 0 1-.563-.562zm4.688-.563h.75c.311 0 .562.25.562.563 0 .311-.25.562-.562.562h-.75a.56.56 0 0 1-.563-.562c0-.312.25-.563.563-.563m0 1.875h.75c.311 0 .562.25.562.563 0 .311-.25.562-.562.562h-.75a.56.56 0 0 1-.563-.562c0-.312.25-.563.563-.563m-4.126 1.875h4.876c.311 0 .562.25.562.563 0 .311-.25.562-.562.562H8.686a.56.56 0 0 1-.562-.562c0-.312.25-.563.563-.563m0 1.875h4.876c.311 0 .562.25.562.563 0 .311-.25.562-.562.562H8.686a.56.56 0 0 1-.562-.562c0-.312.25-.563.563-.563"
                            ></path>
                          </g>
                          <defs>
                            <clipPath id="clip0_30854_9562">
                              <path fill="var(--color-neutral-50)" d="M4 4h12v12H4z"></path>
                            </clipPath>
                          </defs>
                        </svg>
                      </span>
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
