import { Controller, useFormContext } from 'react-hook-form'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { InputRadio, ModalCrud } from '@qovery/shared/ui'

export interface ForceRunModalProps {
  application: ApplicationEntity | undefined
  closeModal: () => void
  onSubmit: () => void
}

export function ForceRunModal(props: ForceRunModalProps) {
  const { control } = useFormContext()
  return (
    <ModalCrud
      title="Force Run"
      description="Select the event you want to run for the following Job"
      onClose={props.closeModal}
      onSubmit={props.onSubmit}
      forService={props.application}
    >
      <Controller
        name="selected"
        rules={{ required: true }}
        control={control}
        render={({ field }) => (
          <>
            <InputRadio
              name={field.name}
              value="start"
              label="Start"
              onChange={field.onChange}
              formValue={field.value}
              description={
                props.application?.schedule?.on_start?.arguments || props.application?.schedule?.on_start?.entrypoint
                  ? `Entry: ${props.application?.schedule?.on_start?.arguments?.toString()} – CMD: ${props.application?.schedule?.on_start?.entrypoint?.toString()}`
                  : undefined
              }
            />
            <InputRadio
              name={field.name}
              value="stop"
              label="Stop"
              onChange={field.onChange}
              formValue={field.value}
              description={
                props.application?.schedule?.on_stop?.arguments || props.application?.schedule?.on_stop?.entrypoint
                  ? `Entry: ${props.application?.schedule?.on_stop?.arguments?.toString()} – CMD: ${props.application?.schedule?.on_stop?.entrypoint?.toString()}`
                  : undefined
              }
            />
            <InputRadio
              name={field.name}
              value="delete"
              label="Delete"
              onChange={field.onChange}
              formValue={field.value}
              description={
                props.application?.schedule?.on_delete?.arguments || props.application?.schedule?.on_delete?.entrypoint
                  ? `Entry: ${props.application?.schedule?.on_delete?.arguments?.toString()} – CMD: ${props.application?.schedule?.on_delete?.entrypoint?.toString()}`
                  : undefined
              }
            />
          </>
        )}
      />
    </ModalCrud>
  )
}

export default ForceRunModal
