import { Controller, FormProvider, useForm } from 'react-hook-form'
import { InputText, ModalCrud } from '@qovery/shared/ui'

export interface EphemeralShellFormValues {
  cpu: string
  memory: string
}

export interface EphemeralShellModalProps {
  onClose: () => void
  onLaunch: (values: EphemeralShellFormValues) => void
  defaultValues?: EphemeralShellFormValues
}

export function EphemeralShellModal({ onClose, onLaunch, defaultValues }: EphemeralShellModalProps) {
  const methods = useForm<EphemeralShellFormValues>({
    mode: 'onChange',
    defaultValues: defaultValues ?? { cpu: '1', memory: '2048Mi' },
  })

  const onSubmit = methods.handleSubmit((values) => {
    onLaunch(values)
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Launch ephemeral pod"
        description="Spawns a one-shot clone pod for troubleshooting. It mirrors your service's image and configuration but runs in isolation — nothing you do affects the live pods. The pod is automatically terminated when the session ends."
        onClose={onClose}
        onSubmit={onSubmit}
        submitLabel="Launch"
      >
        <div className="flex flex-col gap-4">
          <Controller
            name="cpu"
            control={methods.control}
            rules={{ required: 'CPU is required.' }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="vCPU (milli)"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                hint="Minimum value is 10 milli vCPU."
                error={error?.message}
              />
            )}
          />
          <Controller
            name="memory"
            control={methods.control}
            rules={{ required: 'Memory is required.' }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="Memory (MiB)"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                hint="Minimum value is 1 MiB."
                error={error?.message}
              />
            )}
          />
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default EphemeralShellModal
