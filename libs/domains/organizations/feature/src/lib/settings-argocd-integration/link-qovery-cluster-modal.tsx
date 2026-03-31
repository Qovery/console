import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useClusters } from '@qovery/domains/clusters/feature'
import { Button, InputSelect } from '@qovery/shared/ui'

export interface LinkQoveryClusterModalProps {
  organizationId: string
  argoCdClusterName: string
  environmentsDetected: number
  servicesDetected: number
  linkedClusterIds?: string[]
  onClose: (response?: LinkQoveryClusterModalResponse) => void
}

interface LinkQoveryClusterFormValues {
  qoveryClusterId: string
}

export interface LinkQoveryClusterModalResponse {
  clusterId: string
  clusterName: string
  clusterCloudProvider?: string
  clusterType: 'Qovery managed' | 'Self managed'
}

export function LinkQoveryClusterModal({
  organizationId,
  argoCdClusterName,
  environmentsDetected,
  servicesDetected,
  linkedClusterIds = [],
  onClose,
}: LinkQoveryClusterModalProps) {
  const methods = useForm<LinkQoveryClusterFormValues>({
    mode: 'onChange',
    defaultValues: {
      qoveryClusterId: '',
    },
  })
  const { control, formState } = methods

  const { data: clusters = [], isLoading: isLoadingClusters } = useClusters({
    organizationId,
    enabled: !!organizationId,
  })

  const linkedClusterIdSet = useMemo(() => new Set(linkedClusterIds), [linkedClusterIds])

  const availableClusters = useMemo(
    () => clusters.filter((cluster) => !linkedClusterIdSet.has(cluster.id)),
    [clusters, linkedClusterIdSet]
  )

  const clusterOptions = useMemo(
    () =>
      availableClusters.map((cluster) => ({
        label: cluster.name,
        value: cluster.id,
      })),
    [availableClusters]
  )

  const onSubmit = methods.handleSubmit(({ qoveryClusterId }) => {
    const selectedCluster = availableClusters.find((cluster) => cluster.id === qoveryClusterId)

    if (!selectedCluster) {
      onClose()
      return
    }

    onClose({
      clusterId: selectedCluster.id,
      clusterName: selectedCluster.name,
      clusterCloudProvider: selectedCluster.cloud_provider,
      clusterType: selectedCluster.kubernetes === 'SELF_MANAGED' ? 'Self managed' : 'Qovery managed',
    })
  })

  return (
    <div className="p-6">
      <h2 className="h4 mb-2 max-w-sm text-neutral">Link to Qovery cluster</h2>
      <p className="mb-6 text-sm text-neutral-subtle">
        Select the Qovery cluster that corresponds to <span className="text-neutral">{argoCdClusterName}</span>. Qovery
        will display the <span className="text-neutral">{servicesDetected} detected services</span> across{' '}
        <span className="text-neutral">{environmentsDetected} environments</span>.
      </p>

      <form onSubmit={onSubmit}>
        <Controller
          name="qoveryClusterId"
          control={control}
          rules={{
            required: 'Please select a Qovery cluster.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              label="Qovery cluster"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={clusterOptions}
              error={error?.message}
              isLoading={isLoadingClusters}
              isSearchable
              portal
            />
          )}
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="plain" color="neutral" size="lg" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button type="submit" color="brand" size="lg" disabled={!formState.isValid}>
            Link cluster
          </Button>
        </div>
      </form>
    </div>
  )
}
