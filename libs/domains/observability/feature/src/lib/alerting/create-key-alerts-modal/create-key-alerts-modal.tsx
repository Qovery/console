import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useNavigate } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Callout, Icon, InputTextSmall, ModalCrud } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useRdsAlertTarget } from '../../hooks/use-rds-alert-target/use-rds-alert-target'
import { type MetricCategory } from '../alerting-creation-flow/alerting-creation-flow.types'
import { canCreateCertificateRenewalAlert } from '../alerting-creation-flow/metric-availability'
import { RDS_METRICS, RDS_METRIC_CATEGORIES } from '../alerting-creation-flow/rds-alert-metrics'

interface CreateKeyAlertsModalProps {
  onClose: () => void
  service?: AnyService
  projectId: string
  organizationId: string
}

interface CreateKeyAlertsFormData {
  targetedService: string
  metrics: MetricCategory[]
}

interface Metric {
  id: MetricCategory
  label: string
  iconName: IconName
}

const METRICS: Metric[] = [
  { id: 'cpu', label: 'CPU', iconName: 'microchip' },
  { id: 'memory', label: 'Memory', iconName: 'server' },
  { id: 'http_error', label: 'HTTP error', iconName: 'globe' },
  { id: 'http_latency', label: 'HTTP latency', iconName: 'globe' },
  { id: 'missing_instance', label: 'Missing instance', iconName: 'server' },
  { id: 'instance_restart', label: 'Instance restart', iconName: 'cube' },
  { id: 'hpa_limit', label: 'Auto-scaling limit', iconName: 'up-right-and-down-left-from-center' },
  { id: 'certificate_renewal_failed', label: 'Certificate renewal failed', iconName: 'file-signature' },
]

const RDS_METRIC_OPTIONS: Metric[] = RDS_METRIC_CATEGORIES.map((id) => ({
  id,
  label: RDS_METRICS[id].label,
  iconName: 'database',
}))

export function CreateKeyAlertsModal({ onClose, service, organizationId, projectId }: CreateKeyAlertsModalProps) {
  const navigate = useNavigate()
  const isCertificateRenewalAlertEnabled = useFeatureFlagEnabled('certificate-renewal-alert') === true
  const rdsAlertTarget = useRdsAlertTarget({ organizationId, service })

  const hasPublicPort =
    (service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER') &&
    (service?.ports || []).length > 0 &&
    service?.ports?.some((p) => p.publicly_accessible)

  const hasAutoscaling =
    (service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER') &&
    service?.min_running_instances !== service?.max_running_instances

  const availableMetrics = (
    rdsAlertTarget.isResolving || rdsAlertTarget.isMetadataUnavailable
      ? []
      : rdsAlertTarget.isRds
        ? RDS_METRIC_OPTIONS
        : METRICS
  ).filter((metric) => {
    if (!hasPublicPort && (metric.id === 'http_error' || metric.id === 'http_latency')) {
      return false
    }
    if (!hasAutoscaling && metric.id === 'hpa_limit') {
      return false
    }
    if (
      metric.id === 'certificate_renewal_failed' &&
      !canCreateCertificateRenewalAlert(isCertificateRenewalAlertEnabled, service)
    ) {
      return false
    }
    return true
  })

  const methods = useForm<CreateKeyAlertsFormData>({
    mode: 'onChange',
    defaultValues: {
      targetedService: service?.id ?? undefined,
      metrics: [],
    },
    resolver: (values) => {
      const errors: Record<string, { type: string; message: string }> = {}
      if (!values.metrics || values.metrics.length === 0) {
        errors['metrics'] = {
          type: 'required',
          message: 'At least one category must be selected',
        }
      }
      return {
        values,
        errors,
      }
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    const environmentId = service?.environment?.id
    const serviceId = service?.id
    const metrics = data.metrics.filter((metric) => availableMetrics.some((available) => available.id === metric))
    const firstMetric = metrics[0]
    if (!environmentId || !serviceId || !firstMetric) return
    if (
      rdsAlertTarget.isMetadataUnavailable ||
      (rdsAlertTarget.isRds && (!rdsAlertTarget.dbInstance || !rdsAlertTarget.hasCloudWatchMetrics))
    )
      return

    const templatesParam = metrics.join(',')

    onClose()
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/monitoring/alerts/create/metric/$metric',
      params: {
        organizationId,
        projectId,
        environmentId,
        serviceId,
        metric: firstMetric,
      },
      search: {
        templates: templatesParam,
      },
    })
  })

  const watchMetrics = methods.watch('metrics')

  const toggleMetric = (metricId: MetricCategory) => {
    const currentMetrics = watchMetrics || []
    const newMetrics = currentMetrics.includes(metricId)
      ? currentMetrics.filter((m) => m !== metricId)
      : [...currentMetrics, metricId]

    methods.setValue('metrics', newMetrics, { shouldValidate: true })
  }

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Create new alert"
        description="Please select the type of alert want to add to your service."
        onClose={onClose}
        onSubmit={onSubmit}
        submitLabel="Configure alerts"
        submitDisabled={
          rdsAlertTarget.isResolving ||
          rdsAlertTarget.isMetadataUnavailable ||
          (rdsAlertTarget.isRds && (!rdsAlertTarget.dbInstance || !rdsAlertTarget.hasCloudWatchMetrics))
        }
      >
        {rdsAlertTarget.isMetadataUnavailable && (
          <Callout.Root role="alert" color="red" className="mb-4">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>Unable to load this database's alert target. Try again later.</Callout.Text>
          </Callout.Root>
        )}
        {rdsAlertTarget.isRds && !rdsAlertTarget.hasCloudWatchMetrics && (
          <Callout.Root role="alert" color="red" className="mb-4">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>Enable CloudWatch metrics on this cluster to create RDS alerts.</Callout.Text>
          </Callout.Root>
        )}
        {rdsAlertTarget.isRds && rdsAlertTarget.hasCloudWatchMetrics && !rdsAlertTarget.dbInstance && (
          <Callout.Root role="alert" color="red" className="mb-4">
            <Callout.Icon>
              <Icon iconName="circle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              Deploy this database to make its RDS instance identifier available before creating alerts.
            </Callout.Text>
          </Callout.Root>
        )}
        <div className="-mt-1 flex flex-col gap-5">
          <div className="relative">
            <Controller
              name="targetedService"
              control={methods.control}
              render={({ field }) => (
                <InputTextSmall
                  label="Targeted service"
                  name="targetedService"
                  inputClassName="pl-7 text-neutral-subtle"
                  value={service?.name ?? ''}
                  onChange={(value) => field.onChange(value)}
                  disabled={!!service}
                  placeholder="Search service"
                />
              )}
            />
            <Icon
              iconName="search"
              iconStyle="regular"
              className="absolute left-2 top-1/2 mt-[1px] -translate-y-1/2 text-sm text-neutral-subtle"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col text-sm">
              <h3 className="text-sm font-medium text-neutral">Metric categories</h3>
              <p className="text-neutral-subtle">Choose the metric categories you want to generate alerts for</p>
            </div>
            {/* This is a workaround to prevent the button from being focused when the user open the modal */}
            <button type="button" className="pointer-events-none absolute h-0 w-0 select-none"></button>
            <div className="mb-1 grid grid-cols-2 gap-2">
              {availableMetrics.map((metric) => {
                const isSelected = watchMetrics?.includes(metric.id)

                return (
                  <button
                    key={metric.id}
                    type="button"
                    onClick={() => toggleMetric(metric.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        event.stopPropagation()
                        toggleMetric(metric.id)
                      }
                    }}
                    className={twMerge(
                      'group flex items-center gap-2 rounded-lg border p-2 outline-none transition-colors hover:border-brand-strong focus:border-brand-strong',
                      isSelected ? 'border-brand-strong' : 'border-neutral bg-background'
                    )}
                  >
                    <div
                      className={twMerge(
                        'flex h-8 w-8 items-center justify-center rounded-lg bg-surface-neutral-subtle text-neutral-subtle transition-colors group-hover:bg-surface-brand-subtle group-hover:text-brand',
                        isSelected
                          ? 'bg-surface-brand-subtle text-brand'
                          : 'bg-surface-neutral-subtle text-neutral-subtle'
                      )}
                    >
                      <Icon iconName={metric.iconName} iconStyle="regular" className="text-base" />
                    </div>
                    <span className="text-sm font-medium text-neutral">{metric.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default CreateKeyAlertsModal
