import { type Cluster } from 'qovery-typescript-axios'
import { BlockContent, Button, Icon, Tooltip, useModal } from '@qovery/shared/ui'
import NodepoolModal from './nodepool-modal/nodepool-modal'

export interface NodepoolsResourcesSettingsProps {
  cluster: Cluster
}

export function NodepoolsResourcesSettings({ cluster }: NodepoolsResourcesSettingsProps) {
  const { openModal } = useModal()

  return (
    <BlockContent
      title="Nodepools configuration"
      classNameContent="p-0"
      headRight={
        <Tooltip
          classNameContent="w-80"
          content="A NodePool is a group of nodes within a cluster that share the same configuration and characteristics. It allows you to manage resources efficiently by defining specific limits and settings for the group."
        >
          <span className="text-sm">
            <Icon iconName="circle-info" iconStyle="regular" />
          </span>
        </Tooltip>
      }
    >
      <div className="flex gap-4 border-b border-neutral-250 px-4 py-3 text-sm">
        <div className="w-1/2">
          <p className="mb-1 font-medium text-neutral-400">Stable nodepool</p>
          <span className="text-neutral-350">
            Used for single instances and internal Qovery applications, such as containerized databases, to maintain
            stability.
          </span>
        </div>
        <div className="flex w-1/2 justify-end">
          <Button
            type="button"
            variant="surface"
            color="neutral"
            onClick={() =>
              openModal({
                content: <NodepoolModal type="stable" cluster={cluster} />,
              })
            }
          >
            <Icon iconName="pen" iconStyle="solid" />
          </Button>
        </div>
      </div>
      <div className="flex gap-4 px-4 py-3 text-sm">
        <div className="w-1/2">
          <p className="mb-1 font-medium text-neutral-400">Default nodepool</p>
          <span className="text-neutral-350">
            Designed to handle general workloads and serves as the foundation for deploying most applications.
          </span>
        </div>
        <div className="flex w-1/2 justify-end">
          <Button
            type="button"
            variant="surface"
            color="neutral"
            onClick={() =>
              openModal({
                content: <NodepoolModal type="default" cluster={cluster} />,
              })
            }
          >
            <Icon iconName="pen" iconStyle="solid" />
          </Button>
        </div>
      </div>
    </BlockContent>
  )
}

export default NodepoolsResourcesSettings
