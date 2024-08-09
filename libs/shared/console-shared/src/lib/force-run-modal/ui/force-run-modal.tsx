import { type LifecycleJobResponseAllOfSchedule } from 'qovery-typescript-axios'
import { type JobRequestAllOfScheduleOnStart } from 'qovery-typescript-axios/api'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type Job } from '@qovery/domains/services/data-access'
import { InputRadioBox, ModalCrud } from '@qovery/shared/ui'

export interface ForceRunModalProps {
  service: Job
  closeModal: () => void
  onSubmit: () => void
  isCronJob?: boolean
  isLoading?: boolean
}

export function ForceRunModal(props: ForceRunModalProps) {
  const { control } = useFormContext()

  const description = (key: keyof LifecycleJobResponseAllOfSchedule, schedule: LifecycleJobResponseAllOfSchedule) => {
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
            <strong className="font-normal text-neutral-400">
              {match(scheduleEvent.arguments.join(' '))
                .with('start', () => 'deploy')
                .otherwise((v) => v)}
            </strong>
          </p>
        )}
      </>
    )
  }

  return (
    <ModalCrud
      title="Force Run"
      description="Select the event you want to force trigger."
      onClose={props.closeModal}
      onSubmit={props.onSubmit}
      forServiceName={props.service.name}
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
              {props.service.job_type === 'LIFECYCLE' && props.service.schedule['on_start'] && (
                <InputRadioBox
                  fieldValue={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Deploy"
                  value="start"
                  description={props.service.schedule && description('on_start', props.service.schedule)}
                />
              )}
              {props.service.job_type === 'LIFECYCLE' && props.service.schedule['on_stop'] && (
                <InputRadioBox
                  fieldValue={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Stop"
                  value="stop"
                  description={props.service.schedule && description('on_stop', props.service.schedule)}
                />
              )}
              {props.service.job_type === 'LIFECYCLE' && props.service.schedule['on_delete'] && (
                <InputRadioBox
                  fieldValue={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Delete"
                  value="delete"
                  description={props.service.schedule && description('on_delete', props.service.schedule)}
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
