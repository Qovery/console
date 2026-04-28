import { useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useClusters } from '@qovery/domains/clusters/feature'
import { InputSelect, ModalCrud } from '@qovery/shared/ui'

export interface LinkClusterModalProps {
  organizationId: string
  argoCdClusterName: string
  linkedClusterIds?: string[]
  onClose: (response?: LinkClusterModalResponse) => void
}

interface LinkClusterFormValues {
  qoveryClusterId: string
}

export interface LinkClusterModalResponse {
  clusterId: string
  clusterName: string
  clusterCloudProvider?: string
  clusterType: 'Qovery managed' | 'Self managed'
}

export function LinkClusterModal({
  organizationId,
  argoCdClusterName,
  linkedClusterIds = [],
  onClose,
}: LinkClusterModalProps) {
  const methods = useForm<LinkClusterFormValues>({
    mode: 'onChange',
    defaultValues: {
      qoveryClusterId: '',
    },
  })

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
    <FormProvider {...methods}>
      <ModalCrud
        title="Link cluster"
        description={
          <>
            Select the Qovery cluster that corresponds to <span className="text-neutral">{argoCdClusterName}</span>.
          </>
        }
        onClose={() => onClose()}
        onSubmit={onSubmit}
        submitLabel="Link cluster"
      >
        <Controller
          name="qoveryClusterId"
          control={methods.control}
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
      </ModalCrud>
    </FormProvider>
  )
}
