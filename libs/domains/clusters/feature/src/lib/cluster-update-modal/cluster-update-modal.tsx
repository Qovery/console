import { type Cluster } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Checkbox, Icon, InputTextSmall, ModalCrud, Tooltip, useModal } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { useDeployCluster } from '../hooks/use-deploy-cluster/use-deploy-cluster'

export interface ClusterUpdateModalProps {
  cluster: Cluster
}

export function ClusterUpdateModal({ cluster }: ClusterUpdateModalProps) {
  const { closeModal } = useModal()
  const { mutateAsync: deployCluster, isLoading } = useDeployCluster()
  const [, copyToClipboard] = useCopyToClipboard()

  const methods = useForm<{ name: string; dryRun: boolean }>({
    mode: 'onChange',
    defaultValues: {
      dryRun: false,
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await deployCluster({
        organizationId: cluster.organization.id,
        clusterId: cluster.id,
        dryRun: data['dryRun'],
      })
      closeModal()
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Confirm update"
        description={
          <p className="mb-6 text-sm text-neutral-350 dark:text-neutral-50">
            To confirm the update of your cluster, please type the name:
            <Tooltip content="Copy">
              <span
                onClick={() => copyToClipboard(cluster.name)}
                className="link relative -top-0.5 ml-1 inline max-w-[250px] cursor-pointer truncate text-sm text-sky-500"
              >
                {cluster.name} <Icon iconName="copy" />
              </span>
            </Tooltip>
          </p>
        }
        onClose={closeModal}
        onSubmit={onSubmit}
        submitLabel="Confirm"
        loading={isLoading}
      >
        <Controller
          name="name"
          control={methods.control}
          rules={{
            required: 'Please enter a name.',
            validate: (value) => value === cluster.name || 'Please enter the right name.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputTextSmall
              className="mb-6"
              placeholder="Enter the current name"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
        <Controller
          name="dryRun"
          control={methods.control}
          render={({ field }) => (
            <div className="flex gap-3">
              <Checkbox
                id={field.name}
                className="h-4 w-4 min-w-4"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label className="relative -top-1 flex flex-col gap-1 text-sm" htmlFor={field.name}>
                <span className="font-medium text-neutral-400">Dry-run</span>
                <span className="text-neutral-350">Preview changes without applying them</span>
              </label>
            </div>
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default ClusterUpdateModal
