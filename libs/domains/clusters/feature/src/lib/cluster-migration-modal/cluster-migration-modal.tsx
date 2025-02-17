import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Checkbox, ExternalLink, ModalCrud } from '@qovery/shared/ui'

export interface ClusterMigrationModalProps {
  onClose: () => void
  onSubmit: () => void
}

export function ClusterMigrationModal({ onClose, onSubmit }: ClusterMigrationModalProps) {
  const methods = useForm({
    mode: 'onChange',
  })

  const onLocalSubmit = methods.handleSubmit(() => {
    onSubmit()
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud title="Cluster update" onClose={onClose} onSubmit={onLocalSubmit} submitLabel="Confirm">
        <div className="flex flex-col gap-4">
          <Controller
            name="activation"
            rules={{
              required: true,
            }}
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
                  <span className="font-medium text-neutral-400">Karpenter activation is irreversible</span>
                  <span className="text-neutral-350">
                    To switch back to EKS auto-scaling, you will need to recreate your cluster and migrate your
                    environment to the new cluster.
                  </span>
                </label>
              </div>
            )}
          />
          <Controller
            name="downtime"
            rules={{
              required: true,
            }}
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
                  <span className="font-medium text-neutral-400">Downtime may occur</span>
                  <span className="text-neutral-350">
                    Durring the migration, you may experience some downtime on your services.
                  </span>
                </label>
              </div>
            )}
          />
          <Controller
            name="environments"
            rules={{
              required: true,
            }}
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
                  <span className="font-medium text-neutral-400">Redeploying all environments</span>
                  <span className="text-neutral-350">
                    After the migration, we recommend redeploying all environments operating on this cluster.
                  </span>
                </label>
              </div>
            )}
          />
          <Controller
            name="compatibility"
            rules={{
              required: true,
            }}
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
                <div className="flex flex-col gap-1">
                  <label className="relative -top-1 flex flex-col gap-1 text-sm" htmlFor={field.name}>
                    <span className="font-medium text-neutral-400">Daemonset compatibility check</span>
                    <span className="text-neutral-350">
                      If you have Daemonsets deployed via Helm, follow our guide before enabling Karpenter migration.
                    </span>
                  </label>
                  <ExternalLink href="https://hub.qovery.com/guides/advanced/deploy-daemonset-with-karpenter/">
                    Documentation link
                  </ExternalLink>
                </div>
              </div>
            )}
          />
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default ClusterMigrationModal
