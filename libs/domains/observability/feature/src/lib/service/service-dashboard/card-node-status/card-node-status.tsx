import { useState } from 'react'
import { Heading, Icon, Section, Tooltip } from '@qovery/shared/ui'
import { ModalChart } from '../../../modal-chart/modal-chart'
import { CardMetricButton } from '../card-metric/card-metric'
import { NodeStatusChart } from '../node-status-chart/node-status-chart'

const title = 'Node count'
const description = 'Number of ready and not-ready nodes in the cluster over time, with scale up/down events.'

export function CardNodeStatus({ clusterId, serviceId }: { clusterId: string; serviceId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Section className="w-full cursor-default rounded border border-neutral-250 bg-neutral-50">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex items-center gap-1.5">
            <Heading weight="medium">{title}</Heading>
            <Tooltip content={description}>
              <span>
                <Icon iconName="circle-info" iconStyle="regular" className="text-sm text-neutral-350" />
              </span>
            </Tooltip>
          </div>
          <CardMetricButton onClick={() => setIsModalOpen(true)} hasModalLink />
        </div>
        <div>
          <NodeStatusChart clusterId={clusterId} serviceId={serviceId} />
        </div>
      </Section>
      {isModalOpen && (
        <ModalChart title={title} description={description} open={isModalOpen} onOpenChange={setIsModalOpen}>
          <div className="grid h-full grid-cols-1">
            <NodeStatusChart clusterId={clusterId} serviceId={serviceId} isFullscreen />
          </div>
        </ModalChart>
      )}
    </>
  )
}

export default CardNodeStatus
