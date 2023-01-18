import { JobResponseAllOfSchedule } from 'qovery-typescript-axios/api'
import { Controller, useFormContext } from 'react-hook-form'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { InputRadioBox, ModalCrud } from '@qovery/shared/ui'

export interface ForceRunModalProps {
  application: ApplicationEntity | undefined
  closeModal: () => void
  onSubmit: () => void
  isCronJob?: boolean
}

export function ForceRunModal(props: ForceRunModalProps) {
  const { control, setValue, watch } = useFormContext()

  watch((data) => {
    console.log(data)
  })

  const description = (key: keyof JobResponseAllOfSchedule, schedule: JobResponseAllOfSchedule) => {
    return (
      <>
        {schedule['on_start']?.entrypoint && (
          <p>
            Entry: <strong className="font-normal text-text-600">{schedule['on_start']?.entrypoint?.toString()}</strong>
          </p>
        )}
        {schedule['on_start']?.arguments && (
          <p>
            CMD: <strong className="font-normal text-text-600">{schedule['on_start']?.arguments?.toString()}</strong>
          </p>
        )}
      </>
    )
  }

  return (
    <ModalCrud
      title="Force Run"
      description="Select the event you want to run for the following Job"
      onClose={props.closeModal}
      onSubmit={props.onSubmit}
      forService={props.application}
      submitLabel="Force Run"
    >
      {props.isCronJob ? (
        <div></div>
      ) : (
        <Controller
          name="selected"
          rules={{ required: true }}
          control={control}
          render={({ field }) => (
            <>
              <InputRadioBox
                field={field}
                name="Start"
                value="start"
                onClick={setValue}
                description={props.application?.schedule && description('on_start', props.application.schedule)}
              />
              <InputRadioBox
                field={field}
                name="Stop"
                value="stop"
                onClick={setValue}
                description={props.application?.schedule && description('on_stop', props.application.schedule)}
              />
              <InputRadioBox
                field={field}
                name="Delete"
                value="delete"
                onClick={setValue}
                description={props.application?.schedule && description('on_delete', props.application.schedule)}
              />
            </>
          )}
        />
      )}
    </ModalCrud>
  )
}

export default ForceRunModal
