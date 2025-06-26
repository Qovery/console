import { type OrganizationEventResponse } from 'qovery-typescript-axios'
import { useMemo, useState } from 'react'
import { type Props as LabelProps } from 'recharts/types/component/Label'
import { ReferenceLine } from '../observability-overview/chart'
import { useObservabilityContext } from '../observability-overview/observability-context'

interface ReferenceLineEventsProps {
  events?: OrganizationEventResponse[]
}

export function ReferenceLineEvents({ events }: ReferenceLineEventsProps) {
  const { startTimestamp, endTimestamp } = useObservabilityContext()
  const [selectedDeployment, setSelectedDeployment] = useState<number | null>(null)

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
      {selectedDeployment !== null && (
        <ReferenceLine
          x={selectedDeployment}
          stroke="var(--color-brand-500)"
          strokeWidth={2}
          strokeOpacity={0.5}
          strokeDasharray="3 3"
        />
      )}

      {deploymentTimestamps.map((timestamp: number, index: number) => {
        const isInRange = timestamp >= Number(startTimestamp) * 1000 && timestamp <= Number(endTimestamp) * 1000
        if (!isInRange) return null

        return (
          <ReferenceLine
            key={`deployment-icon-${index}`}
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
                  <g className="cursor-pointer">
                    <rect
                      x={x - 80}
                      y={y - 20}
                      width="160"
                      height="50"
                      fill="transparent"
                      onClick={() => setSelectedDeployment(selectedDeployment === timestamp ? null : timestamp)}
                    />

                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      className="fill-brand-500 hover:fill-brand-600"
                      fill="currentColor"
                      onClick={() => setSelectedDeployment(selectedDeployment === timestamp ? null : timestamp)}
                    />
                    <g
                      transform={`translate(${x}, ${y})`}
                      onClick={() => setSelectedDeployment(selectedDeployment === timestamp ? null : timestamp)}
                    >
                      <path
                        d="M3.9375 1.875C3.62578 1.875 3.375 2.12578 3.375 2.4375V9.5625C3.375 9.7594 3.34219 9.9492 3.27891 10.125H10.3125C10.6242 10.125 10.875 9.8742 10.875 9.5625V2.4375C10.875 2.12578 10.6242 1.875 10.3125 1.875H3.9375ZM1.6875 11.25C0.75469 11.25 0 10.4953 0 9.5625V2.625C0 2.31328 0.25078 2.0625 0.5625 2.0625C0.87422 2.0625 1.125 2.31328 1.125 2.625V9.5625C1.125 9.8742 1.37578 10.125 1.6875 10.125C1.99922 10.125 2.25 9.8742 2.25 9.5625V2.4375C2.25 1.50469 3.00469 0.75 3.9375 0.75H10.3125C11.2453 0.75 12 1.50469 12 2.4375V9.5625C12 10.4953 11.2453 11.25 10.3125 11.25H1.6875ZM4.125 3.1875C4.125 2.87578 4.37578 2.625 4.6875 2.625H6.9375C7.2492 2.625 7.5 2.87578 7.5 3.1875V5.0625C7.5 5.37422 7.2492 5.625 6.9375 5.625H4.6875C4.37578 5.625 4.125 5.37422 4.125 5.0625V3.1875ZM8.8125 2.625H9.5625C9.8742 2.625 10.125 2.87578 10.125 3.1875C10.125 3.49922 9.8742 3.75 9.5625 3.75H8.8125C8.5008 3.75 8.25 3.49922 8.25 3.1875C8.25 2.87578 8.5008 2.625 8.8125 2.625ZM8.8125 4.5H9.5625C9.8742 4.5 10.125 4.75078 10.125 5.0625C10.125 5.37422 9.8742 5.625 9.5625 5.625H8.8125C8.5008 5.625 8.25 5.37422 8.25 5.0625C8.25 4.75078 8.5008 4.5 8.8125 4.5ZM4.6875 6.375H9.5625C9.8742 6.375 10.125 6.6258 10.125 6.9375C10.125 7.2492 9.8742 7.5 9.5625 7.5H4.6875C4.37578 7.5 4.125 7.2492 4.125 6.9375C4.125 6.6258 4.37578 6.375 4.6875 6.375ZM4.6875 8.25H9.5625C9.8742 8.25 10.125 8.5008 10.125 8.8125C10.125 9.1242 9.8742 9.375 9.5625 9.375H4.6875C4.37578 9.375 4.125 9.1242 4.125 8.8125C4.125 8.5008 4.37578 8.25 4.6875 8.25Z"
                        fill="white"
                        transform="scale(0.75) translate(-6, -5.625)"
                      />
                    </g>

                    {selectedDeployment === timestamp && (
                      <g className="cursor-default">
                        <rect x={x - 75} y={y - 10} width="65" height="20" rx="4" fill="rgba(0, 0, 0, 0.8)" />
                        <text x={x - 42} y={y + 3} textAnchor="middle" fill="white" fontSize="10">
                          Deployment
                        </text>
                      </g>
                    )}
                  </g>
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
