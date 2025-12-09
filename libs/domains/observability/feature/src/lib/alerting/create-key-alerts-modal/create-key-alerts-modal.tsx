import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  APPLICATION_MONITORING_ALERTS_CREATION_URL,
  APPLICATION_MONITORING_ALERT_METRIC_URL,
  APPLICATION_MONITORING_URL,
  APPLICATION_URL,
} from '@qovery/shared/routes'
import { Icon, InputTextSmall, ModalCrud } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { type MetricCategory } from '../alerting-creation-flow/alerting-creation-flow.types'

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
]

export function CreateKeyAlertsModal({ onClose, service, organizationId, projectId }: CreateKeyAlertsModalProps) {
  const navigate = useNavigate()

  const hasPublicPort =
    (service?.serviceType === 'APPLICATION' || service?.serviceType === 'CONTAINER') &&
    (service?.ports || []).length > 0 &&
    service?.ports?.some((p) => p.publicly_accessible)

  const availableMetrics = METRICS.filter((metric) => {
    if (!hasPublicPort && (metric.id === 'http_error' || metric.id === 'http_latency')) {
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
    const templatesParam = data.metrics.join(',')
    const basePath =
      APPLICATION_URL(organizationId, projectId, service?.environment?.id, service?.id) +
      APPLICATION_MONITORING_URL +
      APPLICATION_MONITORING_ALERTS_CREATION_URL

    onClose()
    navigate(`${basePath}${APPLICATION_MONITORING_ALERT_METRIC_URL(data.metrics[0])}?templates=${templatesParam}`)
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
        title="Create key alerts"
        description="Please select the type of alert want to add to your service."
        onClose={onClose}
        onSubmit={onSubmit}
        submitLabel="Configure alerts"
      >
        <div className="-mt-1 flex flex-col gap-5">
          <div className="relative">
            <Controller
              name="targetedService"
              control={methods.control}
              render={({ field }) => (
                <InputTextSmall
                  label="Targeted service"
                  name="targetedService"
                  inputClassName="pl-7 text-neutral-350"
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
              className="absolute left-2 top-1/2 mt-[1px] -translate-y-1/2 text-sm text-neutral-350"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col text-sm">
              <h3 className="text-sm font-medium text-neutral-400">Metric categories</h3>
              <p className="text-neutral-350">Choose the metric categories you want to generate alerts for</p>
            </div>

            <div className="mb-1 grid grid-cols-3 gap-2">
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
                      'group flex flex-col items-center justify-center gap-2 rounded-lg border p-4 outline-none transition-colors hover:border-brand-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-100',
                      isSelected ? 'border-brand-500' : 'border-neutral-200 bg-white'
                    )}
                  >
                    <div
                      className={twMerge(
                        'flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-150 text-neutral-400 transition-colors group-hover:bg-brand-50 group-hover:text-brand-500',
                        isSelected ? 'bg-brand-50 text-brand-500' : 'bg-neutral-150 text-neutral-400'
                      )}
                    >
                      <Icon iconName={metric.iconName} iconStyle="regular" className="text-base" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">{metric.label}</span>
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
