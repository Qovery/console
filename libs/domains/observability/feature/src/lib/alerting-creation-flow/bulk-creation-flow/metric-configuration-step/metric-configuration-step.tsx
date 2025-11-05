import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { type Value } from '@qovery/shared/interfaces'
import { Button, ExternalLink, Heading, Icon, InputSelectSmall, InputTextSmall, Section } from '@qovery/shared/ui'
import { useAlertingCreationFlowContext } from '../alerting-creation-flow'
import { type AlertConfiguration } from '../bulk-creation-flow.types'

const METRIC_TYPE_OPTIONS: Record<string, Value[]> = {
  cpu: [
    { label: 'AVERAGE', value: 'avg' },
    { label: 'MAXIMUM', value: 'max' },
    { label: 'MINIMUM', value: 'min' },
  ],
  memory: [
    { label: 'AVERAGE', value: 'avg' },
    { label: 'MAXIMUM', value: 'max' },
    { label: 'MINIMUM', value: 'min' },
  ],
  instances: [{ label: 'COUNT', value: 'count' }],
  k8s_event: [{ label: 'COUNT', value: 'count' }],
  network: [
    { label: 'THROUGHPUT', value: 'throughput' },
    { label: 'LATENCY', value: 'latency' },
  ],
  logs: [
    { label: 'ERROR RATE', value: 'error_rate' },
    { label: 'COUNT', value: 'count' },
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

export function MetricConfigurationStep() {
  const navigate = useNavigate()
  const location = useLocation()
  const { metricIndex } = useParams<{ metricIndex: string }>()
  const { selectedMetrics, serviceName, setCurrentStepIndex, alerts, setAlerts } = useAlertingCreationFlowContext()

  const metricCategory = metricIndex || selectedMetrics[0]
  const index = selectedMetrics.indexOf(metricCategory)
  const initialData = alerts[index]

  const basePathMatch = location.pathname.match(/(.+)\/metric\/[^/]+$/)
  const basePath = basePathMatch ? basePathMatch[1] : ''

  useEffect(() => {
    setCurrentStepIndex(index)
  }, [index, setCurrentStepIndex])

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

  const handleNext = (data: AlertConfiguration) => {
    const newAlerts = [...alerts]
    newAlerts[index] = { ...data, skipped: false }
    setAlerts(newAlerts)

    const isLastMetric = index === selectedMetrics.length - 1
    if (isLastMetric) {
      navigate(`${basePath}/summary`)
    } else {
      navigate(`${basePath}/metric/${selectedMetrics[index + 1]}`)
    }
  }

  const handleSkip = () => {
    const newAlerts = [...alerts]
    newAlerts[index] = {
      metricCategory: selectedMetrics[index],
      metricType: '',
      condition: { operator: '', threshold: '', duration: '' },
      autoResolve: { operator: '', threshold: '', duration: '' },
      name: '',
      severity: '',
      notificationChannels: [],
      skipped: true,
    }
    setAlerts(newAlerts)

    const isLastMetric = index === selectedMetrics.length - 1
    if (isLastMetric) {
      navigate(`${basePath}/summary`)
    } else {
      navigate(`${basePath}/metric/${selectedMetrics[index + 1]}`)
    }
  }

  const onSubmit = methods.handleSubmit((data) => {
    handleNext(data)
  })

  if (index === -1 || index >= selectedMetrics.length) {
    return null
  }

  const watchCondition = methods.watch('condition')
  const watchMetricType = methods.watch('metricType')

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="container mx-auto mt-6 flex min-h-0 flex-1 justify-center gap-6">
        <div className="flex w-1/2 flex-col gap-6">
          <Section className="flex flex-col gap-4 rounded-lg border border-neutral-250 p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col ">
                  <Heading>Alert conditions</Heading>
                  <p className="text-sm text-neutral-350">Set the metric and condition that will trigger this alert</p>
                </div>
                <ExternalLink
                  className="shrink-0"
                  href="https://hub.qovery.com/docs/using-qovery/configuration/observability/alerting/#alert-conditions"
                  size="sm"
                >
                  Conditions guide
                </ExternalLink>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm">Main condition</p>
                <div className="rounded-md border border-neutral-250 bg-neutral-100 p-3 text-sm">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-code text-xs text-blue-500">IF</span>
                      <span className="text-sm font-medium uppercase">{metricCategory}</span>
                      <Controller
                        name="metricType"
                        control={methods.control}
                        render={({ field }) => (
                          <InputSelectSmall
                            name="metricType"
                            items={METRIC_TYPE_OPTIONS[metricCategory] || []}
                            defaultValue={field.value}
                            onChange={(value) => field.onChange(value)}
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
                      <span className="font-code text-xs text-blue-500">OF</span>
                      <Controller
                        name="condition.operator"
                        control={methods.control}
                        render={({ field }) => (
                          <InputSelectSmall
                            name="operator"
                            items={OPERATOR_OPTIONS}
                            defaultValue={field.value}
                            onChange={(value) => field.onChange(value)}
                            className="w-32"
                          />
                        )}
                      />
                      <Controller
                        name="condition.threshold"
                        control={methods.control}
                        render={({ field }) => (
                          <InputTextSmall
                            label="Threshold"
                            name="threshold"
                            value={field.value}
                            onChange={(value) => field.onChange(value)}
                            inputClassName="w-6"
                          />
                        )}
                      />
                      <span className="font-code text-xs text-blue-500">DURING THE LAST</span>
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
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm">Auto resolve condition</p>
                <div className="rounded-md border border-neutral-250 bg-neutral-100 p-3 text-sm">
                  <p className="text-xs text-neutral-350">
                    SEND A NOTIFICATION WHEN {metricCategory?.toUpperCase()} {watchMetricType?.toUpperCase()} IS BELOW{' '}
                    <span className="font-medium text-brand-500">{watchCondition.threshold}%</span> DURING THE LAST{' '}
                    <span className="font-medium text-brand-500">{watchCondition.duration}</span>
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Section>
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
          </Section>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-neutral-250 bg-white px-10 py-4">
          <Button type="submit" size="lg">
            Next alert
          </Button>
          <button
            type="button"
            onClick={handleSkip}
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
