import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type Value } from '@qovery/shared/interfaces'
import { Button, Icon, InputSelectSmall, InputTextSmall } from '@qovery/shared/ui'
import { type AlertConfiguration } from './bulk-creation-flow.types'

interface MetricConfigurationStepProps {
  metricCategory: string
  serviceName: string
  initialData?: AlertConfiguration
  onNext: (data: AlertConfiguration) => void
  onSkip: () => void
}

const METRIC_TYPE_OPTIONS: Record<string, Value[]> = {
  cpu: [
    { label: 'Average', value: 'avg' },
    { label: 'Maximum', value: 'max' },
    { label: 'Minimum', value: 'min' },
  ],
  memory: [
    { label: 'Average', value: 'avg' },
    { label: 'Maximum', value: 'max' },
    { label: 'Minimum', value: 'min' },
  ],
  instances: [{ label: 'Count', value: 'count' }],
  k8s_event: [{ label: 'Count', value: 'count' }],
  network: [
    { label: 'Throughput', value: 'throughput' },
    { label: 'Latency', value: 'latency' },
  ],
  logs: [
    { label: 'Error rate', value: 'error_rate' },
    { label: 'Count', value: 'count' },
  ],
}

const OPERATOR_OPTIONS: Value[] = [
  { label: 'Above', value: 'above' },
  { label: 'Below', value: 'below' },
]

const DURATION_OPTIONS: Value[] = [
  { label: '1 minute', value: '1m' },
  { label: '5 minutes', value: '5m' },
  { label: '10 minutes', value: '10m' },
  { label: '15 minutes', value: '15m' },
  { label: '30 minutes', value: '30m' },
]

const SEVERITY_OPTIONS: Value[] = [
  { label: 'Warning', value: 'warning' },
  { label: 'Critical', value: 'critical' },
]

export function MetricConfigurationStep({
  metricCategory,
  serviceName,
  initialData,
  onNext,
  onSkip,
}: MetricConfigurationStepProps) {
  const methods = useForm<AlertConfiguration>({
    mode: 'onChange',
    defaultValues: initialData || {
      metricCategory,
      metricType: 'avg',
      condition: {
        operator: 'above',
        threshold: '80',
        duration: '5m',
      },
      autoResolve: {
        operator: 'below',
        threshold: '80',
        duration: '5m',
      },
      name: '',
      severity: 'warning',
      notificationChannels: [],
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    onNext(data)
  })

  const watchCondition = methods.watch('condition')
  const watchMetricType = methods.watch('metricType')

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto bg-white px-10 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium text-neutral-400">Alert conditions</h2>
                <a
                  href="#"
                  className="flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Conditions guide
                  <Icon iconName="arrow-up-right-from-square" iconStyle="regular" className="text-xs" />
                </a>
              </div>
              <p className="text-sm text-neutral-350">Set the metric and condition that will trigger this alert</p>

              <div className="mt-2 flex flex-col gap-4 rounded-lg border border-neutral-250 bg-neutral-100 p-5">
                <div>
                  <p className="mb-3 text-xs font-medium uppercase text-neutral-350">Main condition</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-350">IF</span>
                      <span className="rounded bg-brand-50 px-2 py-1 text-sm font-medium uppercase text-brand-500">
                        {metricCategory}
                      </span>
                      <Controller
                        name="metricType"
                        control={methods.control}
                        render={({ field }) => (
                          <InputSelectSmall
                            name="metricType"
                            items={METRIC_TYPE_OPTIONS[metricCategory] || []}
                            defaultValue={field.value}
                            onChange={(value) => field.onChange(value)}
                            inputClassName="h-8 uppercase"
                          />
                        )}
                      />
                    </div>

                    <div className="relative">
                      <Controller
                        name="condition.operator"
                        control={methods.control}
                        render={({ field }) => (
                          <InputTextSmall
                            label=""
                            name="service"
                            inputClassName="pl-7 text-neutral-350"
                            value={serviceName}
                            disabled
                            placeholder="Search service"
                          />
                        )}
                      />
                      <Icon
                        iconName="search"
                        iconStyle="regular"
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-neutral-350"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-350">IS</span>
                      <Controller
                        name="condition.operator"
                        control={methods.control}
                        render={({ field }) => (
                          <InputSelectSmall
                            name="operator"
                            items={OPERATOR_OPTIONS}
                            defaultValue={field.value}
                            onChange={(value) => field.onChange(value)}
                            inputClassName="h-8 uppercase"
                          />
                        )}
                      />
                      <Controller
                        name="condition.threshold"
                        control={methods.control}
                        render={({ field }) => (
                          <InputTextSmall
                            label=""
                            name="threshold"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            inputClassName="h-8 w-24"
                          />
                        )}
                      />
                      <span className="text-sm text-neutral-350">DURING THE LAST</span>
                      <Controller
                        name="condition.duration"
                        control={methods.control}
                        render={({ field }) => (
                          <InputSelectSmall
                            name="duration"
                            items={DURATION_OPTIONS}
                            defaultValue={field.value}
                            onChange={(value) => field.onChange(value)}
                            inputClassName="h-8"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium uppercase text-neutral-350">Auto resolve condition</p>
                  <p className="text-sm text-neutral-350">
                    SEND A NOTIFICATION WHEN {metricCategory.toUpperCase()} {watchMetricType.toUpperCase()} IS BELOW{' '}
                    <span className="font-medium text-brand-500">{watchCondition.threshold}%</span> DURING THE LAST{' '}
                    <span className="font-medium text-brand-500">{watchCondition.duration}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-base font-medium text-neutral-400">Configuration</h2>

              <Controller
                name="name"
                control={methods.control}
                rules={{ required: 'Alert name is required' }}
                render={({ field, fieldState }) => (
                  <InputTextSmall
                    label="Alert name"
                    name="name"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="severity"
                control={methods.control}
                render={({ field }) => (
                  <InputSelectSmall
                    label="Severity"
                    name="severity"
                    items={SEVERITY_OPTIONS}
                    defaultValue={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-400">Notification channels</label>
                <div className="flex h-9 items-center rounded border border-neutral-250 bg-neutral-100 px-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded bg-neutral-200 px-2 py-1 text-xs font-medium text-neutral-400">
                      Interrupt slack channel
                      <Icon iconName="xmark" iconStyle="regular" className="cursor-pointer text-xs" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[400px] shrink-0 border-l border-neutral-250 bg-white">
          <div className="flex h-full flex-col p-6">
            <h3 className="mb-4 text-base font-medium text-neutral-400">Preview</h3>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-neutral-250 bg-neutral-100">
              <p className="text-sm text-neutral-350">Preview placeholder</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-neutral-250 bg-white px-10 py-4">
          <Button type="submit" size="lg">
            Next alert
          </Button>
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-neutral-350 hover:text-neutral-400"
          >
            Skip this alert
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

export default MetricConfigurationStep
