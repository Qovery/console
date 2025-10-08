import { type Cluster } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import { KarpenterInstanceTypePreview } from '@qovery/domains/cloud-providers/feature'
import { KarpenterInstanceFilterModal } from '@qovery/domains/cloud-providers/feature'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { Button, Icon, Tooltip, useModal } from '@qovery/shared/ui'

export interface GpuResourcesSettingsProps {
  cluster?: Cluster
}

export const GpuResourcesSettings = ({ cluster }: GpuResourcesSettingsProps) => {
  const { openModal, closeModal } = useModal()
  const { watch, setValue } = useFormContext<ClusterResourcesData>()

  const watchKarpenter = watch('karpenter')
  const watchKarpenterEnabled = watch('karpenter.enabled')

  return (
    <div className="flex border-t border-neutral-250 p-4 text-sm font-medium text-neutral-400">
      <div className="w-full">
        <p className="mb-2">
          Instance types scope{' '}
          <Tooltip
            classNameContent="max-w-80"
            content="Karpenter will create nodes based on the specified list of instance types. By selecting specific instance types, you can control the performance, cost, and architecture of the nodes in your cluster."
          >
            <span className="text-neutral-400">
              <Icon iconName="info-circle" iconStyle="regular" />
            </span>
          </Tooltip>
        </p>
        <KarpenterInstanceTypePreview
          defaultServiceArchitecture={watchKarpenter?.default_service_architecture ?? 'AMD64'}
          requirements={watchKarpenter?.qovery_node_pools?.requirements}
        />
      </div>
      <Button
        type="button"
        color="neutral"
        variant="surface"
        size="md"
        className="gap-2"
        onClick={() => {
          openModal({
            options: {
              width: 840,
            },
            content: (
              <KarpenterInstanceFilterModal
                cluster={cluster}
                clusterRegion={cluster?.region ?? ''}
                defaultValues={watchKarpenter}
                onClose={closeModal}
                onChange={(values) => {
                  setValue('karpenter', {
                    enabled: watchKarpenterEnabled,
                    spot_enabled: watchKarpenter?.spot_enabled ?? false,
                    disk_size_in_gib: watchKarpenter?.disk_size_in_gib ?? 50,
                    ...values,
                  })
                }}
                gpuFilter="ONLY"
              />
            ),
          })
        }}
      >
        Edit <Icon iconName="pen" iconStyle="solid" />
      </Button>
    </div>
  )
}
