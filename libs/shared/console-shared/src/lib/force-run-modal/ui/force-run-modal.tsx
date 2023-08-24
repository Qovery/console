import { type JobRequestAllOfScheduleOnStart, type JobResponseAllOfSchedule } from 'qovery-typescript-axios/api'
import { Controller, useFormContext } from 'react-hook-form'
import { type ApplicationEntity } from '@qovery/shared/interfaces'
import { InputRadioBox, ModalCrud } from '@qovery/shared/ui'

export interface ForceRunModalProps {
  application: ApplicationEntity | undefined
  closeModal: () => void
  onSubmit: () => void
  isCronJob?: boolean
  isLoading?: boolean
}

export function ForceRunModal(props: ForceRunModalProps) {
  const { control } = useFormContext()

  const description = (key: keyof JobResponseAllOfSchedule, schedule: JobResponseAllOfSchedule) => {
    const scheduleEvent: JobRequestAllOfScheduleOnStart = schedule[key] as JobRequestAllOfScheduleOnStart

    if (!scheduleEvent) return

    return (
      <>
        {scheduleEvent.entrypoint && (
          <p>
            Entrypoint: <strong className="font-normal text-neutral-400">{scheduleEvent.entrypoint?.toString()}</strong>
          </p>
        )}
        {scheduleEvent.arguments && scheduleEvent.arguments && scheduleEvent.arguments.length > 0 && (
          <p>
            CMD Arguments:{' '}
            <strong className="font-normal text-neutral-400">{scheduleEvent.arguments.toString()}</strong>
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
                  fieldValue={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Start"
                  value="start"
                  description={props.application?.schedule && description('on_start', props.application.schedule)}
                />
              )}
              {props.application?.schedule && props.application.schedule['on_stop'] && (
                <InputRadioBox
                  fieldValue={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Stop"
                  value="stop"
                  description={props.application?.schedule && description('on_stop', props.application.schedule)}
                />
              )}
              {props.application?.schedule && props.application.schedule['on_delete'] && (
                <InputRadioBox
                  fieldValue={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Delete"
                  value="delete"
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
