import {
  JobForceEvent,
  type JobRequestAllOfScheduleOnStart,
  type LifecycleJobResponseAllOfSchedule,
} from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type Job } from '@qovery/domains/services/data-access'
import { InputRadioBox, ModalCrud, useModal } from '@qovery/shared/ui'
import { useDeployService } from '../hooks/use-deploy-service/use-deploy-service'

export interface ForceRunModalProps {
  organizationId: string
  projectId: string
  service: Job
}

function ForceRunModalForm({
  service,
  closeModal,
  onSubmit,
  isCronJob,
  isLoading,
}: {
  service: Job
  closeModal: () => void
  onSubmit: () => void
  isCronJob?: boolean
  isLoading?: boolean
}) {
  const { control } = useFormContext()

  const description = (key: keyof LifecycleJobResponseAllOfSchedule, schedule: LifecycleJobResponseAllOfSchedule) => {
    const scheduleEvent: JobRequestAllOfScheduleOnStart = schedule[key] as JobRequestAllOfScheduleOnStart
    if (!scheduleEvent) return

    return (
      <>
        {scheduleEvent.entrypoint && (
          <p>
            Entrypoint: <strong className="font-normal text-neutral">{scheduleEvent.entrypoint?.toString()}</strong>
          </p>
        )}
        {scheduleEvent.arguments && scheduleEvent.arguments && scheduleEvent.arguments.length > 0 && (
          <p>
            CMD Arguments:{' '}
            <strong className="font-normal text-neutral">
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
      onClose={closeModal}
      onSubmit={onSubmit}
      forServiceName={service.name}
      submitLabel="Force Run"
      loading={isLoading}
    >
      {isCronJob ? (
        <div></div>
      ) : (
        <Controller
          name="selected"
          rules={{ required: true }}
          control={control}
          render={({ field }) => (
            <>
              {service.job_type === 'LIFECYCLE' && service.schedule['on_start'] && (
                <InputRadioBox
                  fieldValue={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Deploy"
                  value="start"
                  description={service.schedule && description('on_start', service.schedule)}
                />
              )}
              {service.job_type === 'LIFECYCLE' && service.schedule['on_stop'] && (
                <InputRadioBox
                  fieldValue={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Stop"
                  value="stop"
                  description={service.schedule && description('on_stop', service.schedule)}
                />
              )}
              {service.job_type === 'LIFECYCLE' && service.schedule['on_delete'] && (
                <InputRadioBox
                  fieldValue={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  label="Delete"
                  value="delete"
                  description={service.schedule && description('on_delete', service.schedule)}
                />
              )}
            </>
          )}
        />
      )}
    </ModalCrud>
  )
}

export function ForceRunModal({ organizationId, projectId, service }: ForceRunModalProps) {
  const { mutateAsync: deployService, isLoading: isLoadingEditService } = useDeployService({
    organizationId,
    projectId,
    environmentId: service.environment.id,
  })
  const { closeModal } = useModal()

  const methods = useForm({
    mode: 'all',
    defaultValues: {
      selected: service.job_type === 'CRON' ? 'cron' : '',
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    let event: JobForceEvent
    switch (data.selected) {
      case 'start':
        event = JobForceEvent.START
        break
      case 'stop':
        event = JobForceEvent.STOP
        break
      case 'delete':
        event = JobForceEvent.DELETE
        break
      default:
        event = JobForceEvent.CRON
    }

    if (data.selected) {
      try {
        await deployService({
          serviceId: service.id,
          serviceType: 'JOB',
          forceEvent: event,
        })
        closeModal()
      } catch (error) {
        console.error(error)
      }
    }
  })

  return (
    <FormProvider {...methods}>
      <ForceRunModalForm
        service={service}
        closeModal={closeModal}
        onSubmit={onSubmit}
        isCronJob={service.job_type === 'CRON'}
        isLoading={isLoadingEditService}
      />
    </FormProvider>
  )
}

export default ForceRunModal
