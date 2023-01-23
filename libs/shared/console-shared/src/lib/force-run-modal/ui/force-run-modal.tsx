import { JobRequestAllOfScheduleOnStart, JobResponseAllOfSchedule } from 'qovery-typescript-axios/api'
import { Controller, useFormContext } from 'react-hook-form'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import { InputRadioBox, ModalCrud } from '@qovery/shared/ui'

export interface ForceRunModalProps {
  application: ApplicationEntity | undefined
  closeModal: () => void
  onSubmit: () => void
  isCronJob?: boolean
  isLoading?: boolean
}

export function ForceRunModal(props: ForceRunModalProps) {
  const { control, setValue } = useFormContext()

  const description = (key: keyof JobResponseAllOfSchedule, schedule: JobResponseAllOfSchedule) => {
    const scheduleEvent: JobRequestAllOfScheduleOnStart = schedule[key] as JobRequestAllOfScheduleOnStart

    if (!scheduleEvent) return

    return (
      <>
        {scheduleEvent.entrypoint && (
          <p>
            Entrypoint: <strong className="font-normal text-text-600">{scheduleEvent.entrypoint?.toString()}</strong>
          </p>
        )}
        {scheduleEvent.arguments && scheduleEvent.arguments && scheduleEvent.arguments.length > 0 && (
          <p>
            CMD Arguments: <strong className="font-normal text-text-600">{scheduleEvent.arguments.toString()}</strong>
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
      loading={props.isLoading}
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
              {props.application?.schedule && props.application.schedule['on_start'] && (
                <InputRadioBox
                  field={field}
                  name="Start"
                  value="start"
                  onClick={setValue}
                  description={props.application?.schedule && description('on_start', props.application.schedule)}
                />
              )}
              {props.application?.schedule && props.application.schedule['on_stop'] && (
                <InputRadioBox
                  field={field}
                  name="Stop"
                  value="stop"
                  onClick={setValue}
                  description={props.application?.schedule && description('on_stop', props.application.schedule)}
                />
              )}
              {props.application?.schedule && props.application.schedule['on_delete'] && (
                <InputRadioBox
                  field={field}
                  name="Delete"
                  value="delete"
                  onClick={setValue}
                  description={props.application?.schedule && description('on_delete', props.application.schedule)}
                />
              )}
            </>
          )}
        />
      )}
    </ModalCrud>
  )
}

export default ForceRunModal
