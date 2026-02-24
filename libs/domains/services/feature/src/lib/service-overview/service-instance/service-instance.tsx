import { ServiceTypeEnum } from 'qovery-typescript-axios'
import { type ReactNode, useMemo } from 'react'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { ExternalLink, Icon } from '@qovery/shared/ui'
import { formatCronExpression, formatMetric } from '@qovery/shared/util-js'
import { InstanceMetrics } from '../instance-metrics/instance-metrics'
import { GitRepository } from '../service-header/service-header'

function LabelValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-sm text-neutral">
      <span className="text-neutral-subtle">{label}:</span> {children}
    </span>
  )
}

export function ServiceInstance({ service }: { service: AnyService }) {
  const isCronJob = useMemo(() => service?.serviceType === 'JOB' && service.job_type === 'CRON', [service])

  const resources = match(service)
    .with({ serviceType: ServiceTypeEnum.CONTAINER }, { serviceType: ServiceTypeEnum.APPLICATION }, (s) => {
      const { cpu, memory, min_running_instances, max_running_instances, gpu } = s

      // Determine autoscaling mode using the same logic as other parts of the app
      let autoscalingMode = 'Fixed'
      if (s.autoscaling?.mode === 'KEDA') {
        autoscalingMode = 'KEDA'
      } else if (min_running_instances !== max_running_instances) {
        autoscalingMode = 'HPA'
      }

      return (
        <>
          <LabelValue label="Scaling method">{autoscalingMode}</LabelValue>
          <LabelValue label="Instances min/max">
            {min_running_instances}/{max_running_instances}
          </LabelValue>
          <LabelValue label="vCPU limit">{cpu && formatMetric({ current: cpu, unit: 'mCPU' })}</LabelValue>
          <LabelValue label="Memory limit">{memory && formatMetric({ current: memory, unit: 'MiB' })}</LabelValue>
          {!gpu || gpu === 0 ? null : (
            <LabelValue label="GPU limit">{gpu && formatMetric({ current: gpu, unit: 'GPU' })}</LabelValue>
          )}
        </>
      )
    })
    .with({ serviceType: ServiceTypeEnum.DATABASE }, ({ cpu, memory, storage, instance_type, mode }) => (
      <>
        {mode !== 'MANAGED' && (
          <>
            <LabelValue label="vCPU limit">{cpu && formatMetric({ current: cpu, unit: 'mCPU' })}</LabelValue>
            <LabelValue label="Memory limit">{memory && formatMetric({ current: memory, unit: 'MiB' })}</LabelValue>
          </>
        )}
        <LabelValue label="Storage limit">{storage && formatMetric({ current: storage, unit: 'GiB' })}</LabelValue>
        {mode !== 'CONTAINER' && <LabelValue label="Instance type">{instance_type}</LabelValue>}
      </>
    ))
    .with({ serviceType: ServiceTypeEnum.JOB }, (job) => {
      const { cpu, memory, max_duration_seconds, max_nb_restart, port, gpu } = job
      return (
        <>
          {match(job)
            .with({ job_type: 'LIFECYCLE' }, ({ schedule }) => (
              <LabelValue label="Triggered on">
                {[schedule.on_start && 'Deploy', schedule.on_stop && 'Stop', schedule.on_delete && 'Delete']
                  .filter(Boolean)
                  .join(' - ') || undefined}
              </LabelValue>
            ))
            .with({ job_type: 'CRON' }, ({ schedule }) => (
              <LabelValue label={`Scheduling (${schedule.cronjob?.timezone})`}>
                {formatCronExpression(schedule.cronjob?.scheduled_at)}
              </LabelValue>
            ))
            .exhaustive()}
          <LabelValue label="Restart (max)">{max_nb_restart}</LabelValue>
          <LabelValue label="Duration (max)">
            {max_duration_seconds ? `${max_duration_seconds} s` : undefined}
          </LabelValue>
          <LabelValue label="vCPU (max)">{cpu && formatMetric({ current: cpu, unit: 'mCPU' })}</LabelValue>
          <LabelValue label="Memory (max)">{memory && formatMetric({ current: memory, unit: 'MiB' })}</LabelValue>
          {!gpu || gpu === 0 ? null : (
            <LabelValue label="GPU (max)">{gpu && formatMetric({ current: gpu, unit: 'GPU' })}</LabelValue>
          )}
          {port && <LabelValue label="Port">{port}</LabelValue>}
        </>
      )
    })
    .otherwise(() => null)

  const valuesOverride = match(service)
    .with({ serviceType: 'HELM' }, (service) => {
      const {
        values_override: { file, set, set_json, set_string },
      } = service
      const overrideWithArguments = (
        <LabelValue label="Override with arguments">
          {set?.length || set_json?.length || set_string?.length ? 'Yes' : 'No'}
        </LabelValue>
      )

      if (file?.git?.git_repository) {
        return (
          <>
            <LabelValue label="Type">
              Git repository
              <GitRepository gitRepository={file.git.git_repository} />
            </LabelValue>
            {overrideWithArguments}
          </>
        )
      } else if (file?.raw) {
        return (
          <>
            <LabelValue label="Type">Raw YAML</LabelValue>
            {overrideWithArguments}
          </>
        )
      } else {
        return overrideWithArguments
      }
    })
    .otherwise(() => null)

  return (
    <div>
      <div className="overflow-hidden rounded-t-lg border-x border-t border-neutral bg-surface-neutral-subtle">
        <div className="no-scrollbar overflow-x-auto px-4 pb-4 pt-3.5">
          <div className="flex min-w-[960px] justify-end gap-6">
            {resources && resources}
            {valuesOverride && valuesOverride}
          </div>
        </div>
      </div>
      <div className="relative -top-1.5 rounded-lg bg-surface-neutral">
        <InstanceMetrics environmentId={service.environment.id} serviceId={service.id}>
          {isCronJob && (
            <div className="mt-3 grid grid-cols-[min-content_1fr] gap-x-3 gap-y-1 rounded-lg border border-neutral bg-surface-neutral-component p-3 text-xs text-neutral">
              <Icon className="row-span-2" iconName="circle-info" iconStyle="regular" />
              <p>
                The number of past Completed or Failed job execution retained in the history and their TTL can be
                customized in the advanced settings.
              </p>
              <ExternalLink
                className="text-xs"
                href="https://www.qovery.com/docs/configuration/service-advanced-settings#cronjob-failed-jobs-history-limit"
              >
                See documentation
              </ExternalLink>
            </div>
          )}
        </InstanceMetrics>
      </div>
    </div>
  )
}

export default ServiceInstance
