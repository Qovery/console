import clsx from 'clsx'
import { AlertSeverity } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { type Value } from '@qovery/shared/interfaces'
import {
  Button,
  ExternalLink,
  FunnelFlowBody,
  Heading,
  Icon,
  InputSelectSmall,
  InputTextSmall,
  Section,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useAlertingCreationFlowContext } from '../alerting-creation-flow'
import { type AlertConfiguration } from '../bulk-creation-flow.types'
import { ALERTING_CREATION_METRIC, ALERTING_CREATION_SUMMARY } from '../router'

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
  { label: 'Last 1 minute', value: 'PT1M' },
  { label: 'Last 5 minutes', value: 'PT5M' },
  { label: 'Last 10 minutes', value: 'PT10M' },
  { label: 'Last 15 minutes', value: 'PT15M' },
  { label: 'Last 30 minutes', value: 'PT30M' },
]

const SEVERITY_OPTIONS: Value[] = Object.values(AlertSeverity).map((severity) => ({
  label: upperCaseFirstLetter(severity),
  value: severity,
}))

export function MetricConfigurationStep({
  isEdit,
  isLoadingEditAlertRule,
}: {
  isEdit?: boolean
  isLoadingEditAlertRule?: boolean
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { metricIndex, alertId } = useParams<{ metricIndex?: string; alertId?: string }>()
  const { selectedMetrics, serviceName, setCurrentStepIndex, alerts, setAlerts, onComplete } =
    useAlertingCreationFlowContext()

  const metricCategory = isEdit ? alerts[0]?.metricCategory || '' : metricIndex || selectedMetrics[0] || ''
  const index = isEdit ? alerts.findIndex((alert) => alert.id === alertId) : selectedMetrics.indexOf(metricCategory)

  const initialData = alerts[index]

  const basePathMatch = location.pathname.match(/(.+)\/(metric|edit)\/[^/]+$/)
  const basePath = basePathMatch ? basePathMatch[1] : ''
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : ''

  const defaultValues = useMemo<AlertConfiguration>(() => {
    if (initialData) {
      return {
        ...initialData,
        notificationChannels: initialData.notificationChannels ?? [],
      }
    }

    return {
      id: uuid(),
      metricCategory,
      metricType: 'avg',
      condition: {
        operator: 'above',
        threshold: '80',
      },
      autoResolve: {
        operator: 'below',
        threshold: '80',
      },
      forDuration: 'PT5M',
      name: metricCategory ? `${metricCategory.replace(/_/g, ' ').toUpperCase()} alert` : '',
      severity: 'MEDIUM',
      notificationChannels: [],
    }
  }, [initialData, metricCategory])

  const methods = useForm<AlertConfiguration>({
    mode: 'onChange',
    defaultValues: defaultValues as AlertConfiguration,
  })

  useEffect(() => {
    if (isEdit) {
      setCurrentStepIndex(selectedMetrics.length)
    } else {
      setCurrentStepIndex(index)
    }
  }, [isEdit, index, selectedMetrics.length, setCurrentStepIndex])

  useEffect(() => {
    methods.reset(defaultValues)
  }, [methods, defaultValues])

  const handleNext = (data: AlertConfiguration) => {
    const newAlerts = [...alerts]
    newAlerts[index] = { ...data, skipped: false }
    setAlerts(newAlerts)

    if (isEdit) {
      onComplete(newAlerts)
    } else {
      const isLastMetric = index === selectedMetrics.length - 1
      if (isLastMetric) {
        navigate(`${basePath}${ALERTING_CREATION_SUMMARY}${queryString}`)
      } else {
        navigate(`${basePath}${ALERTING_CREATION_METRIC(selectedMetrics[index + 1])}${queryString}`)
      }
    }
  }

  const handleSkip = () => {
    const currentFormValues = methods.getValues()
    const newAlerts = [...alerts]
    newAlerts[index] = {
      ...currentFormValues,
      skipped: true,
    }
    setAlerts(newAlerts)

    const isLastMetric = index === selectedMetrics.length - 1
    if (isLastMetric) {
      navigate(`${basePath}${ALERTING_CREATION_SUMMARY}${queryString}`)
    } else {
      navigate(`${basePath}${ALERTING_CREATION_METRIC(selectedMetrics[index + 1])}${queryString}`)
    }
  }

  const handlePrevious = () => {
    if (isEdit || index <= 0) {
      return
    }

    navigate(`${basePath}${ALERTING_CREATION_METRIC(selectedMetrics[index - 1])}${queryString}`)
  }

  const onSubmit = methods.handleSubmit((data) => {
    handleNext(data)
  })

  if (index === -1 || index >= selectedMetrics.length) {
    return null
  }

  const watchCondition = methods.watch('condition')
  const watchForDuration = methods.watch('forDuration')

  return (
    <FunnelFlowBody>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="flex w-full flex-1 flex-col gap-6">
          <Section className="flex flex-col rounded-lg border border-neutral-250">
            <div className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col ">
                    <Heading>Alert conditions</Heading>
                    <p className="text-sm text-neutral-350">
                      Set the metric and condition that will trigger this alert
                    </p>
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
                  <p className="text-sm">Metric</p>
                  <div className="flex gap-2">
                    <Controller
                      name="metricCategory"
                      control={methods.control}
                      render={({ field }) => (
                        <InputSelectSmall
                          name="metricCategory"
                          items={Object.keys(METRIC_TYPE_OPTIONS).map((key) => ({
                            label: key.replace(/_/g, ' ').toUpperCase(),
                            value: key,
                          }))}
                          defaultValue={field.value}
                          onChange={(value) => field.onChange(value)}
                          className="w-full"
                          inputClassName="bg-transparent"
                        />
                      )}
                    />
                    <Controller
                      name="metricType"
                      control={methods.control}
                      render={({ field }) => (
                        <InputSelectSmall
                          name="metricType"
                          items={METRIC_TYPE_OPTIONS[metricCategory] || []}
                          defaultValue={field.value}
                          onChange={(value) => field.onChange(value)}
                          className="w-40"
                          inputClassName="bg-transparent"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm">Target service</p>
                  <div className="relative">
                    <Controller
                      name="condition.operator"
                      control={methods.control}
                      render={() => (
                        <InputTextSmall
                          label="Target service"
                          name="service"
                          inputClassName="pl-7 text-neutral-350"
                          value={serviceName}
                          placeholder="Search service"
                          disabled
                        />
                      )}
                    />
                    <Icon
                      iconName="search"
                      iconStyle="regular"
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-neutral-350"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm">Trigger condition</p>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="condition.operator"
                      control={methods.control}
                      render={({ field }) => (
                        <InputSelectSmall
                          name="operator"
                          items={OPERATOR_OPTIONS}
                          defaultValue={field.value}
                          onChange={(value) => field.onChange(value)}
                          className="w-full"
                          inputClassName="bg-transparent"
                        />
                      )}
                    />
                    <Controller
                      name="condition.threshold"
                      control={methods.control}
                      rules={{
                        validate: (value) => {
                          if (value === '') {
                            return 'Threshold is required'
                          }
                          if (Number(value) < 0 || Number(value) > 100) {
                            return 'Threshold must be between 0 and 100'
                          }
                          return true
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <div className="relative w-40">
                          <InputTextSmall
                            label="Threshold"
                            name="threshold"
                            type="number"
                            placeholder="00"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className={clsx('w-full', error ? 'border-red-500' : '')}
                            inputClassName="bg-transparent pr-6"
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-350">
                            %
                          </span>
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm">Duration</p>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="forDuration"
                      control={methods.control}
                      render={({ field }) => (
                        <InputSelectSmall
                          name="forDuration"
                          items={DURATION_OPTIONS}
                          defaultValue={field.value}
                          onChange={(value) => field.onChange(value)}
                          className="w-full"
                          inputClassName="bg-transparent"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 border-t border-neutral-250 p-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm">Main condition query</p>
                <div className="rounded border border-neutral-250 bg-neutral-100 p-3 font-code text-sm">
                  <p className="flex flex-col gap-1 text-xs uppercase text-blue-500">
                    <span>
                      SEND A NOTIFICATION WHEN <span className="text-neutral-400">{metricCategory}</span>{' '}
                    </span>
                    <span>
                      OF <span className="text-neutral-900">{serviceName}</span>
                    </span>
                    <span>
                      IS <span className="text-neutral-900">{watchCondition.operator}</span>{' '}
                      <span className="text-red-600">{watchCondition.threshold}%</span> DURING THE{' '}
                      <span className="text-neutral-900">
                        {DURATION_OPTIONS.find((option) => option.value === watchForDuration)?.label}
                      </span>
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm">Auto resolve condition</p>
                <div className="rounded border border-neutral-250 bg-neutral-100 p-3 font-code text-sm">
                  <p className="gap-1 text-xs uppercase text-blue-500">
                    <span>
                      SEND A NOTIFICATION WHEN <span className="text-neutral-400">{metricCategory}</span>{' '}
                    </span>
                    <span>
                      IS <span className="text-neutral-900">{watchCondition.operator}</span>{' '}
                      <span className="text-red-600">{watchCondition.threshold}%</span> DURING THE{' '}
                      <span className="text-neutral-900">
                        {DURATION_OPTIONS.find((option) => option.value === watchForDuration)?.label}
                      </span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Section className="flex flex-col gap-4 rounded-lg border border-neutral-250 p-4">
            <Heading>Configuration</Heading>

            <div className="flex flex-col gap-1">
              <p className="text-sm">Alert name</p>
              <Controller
                name="name"
                control={methods.control}
                rules={{ required: 'Alert name is required' }}
                render={({ field, fieldState }) => (
                  <InputTextSmall
                    label="Alert name"
                    placeholder="Your alert name"
                    name="name"
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm">Severity</p>
              <Controller
                name="severity"
                control={methods.control}
                render={({ field }) => (
                  <InputSelectSmall
                    name="severity"
                    items={SEVERITY_OPTIONS}
                    defaultValue={field.value}
                    onChange={(value) => field.onChange(value)}
                    inputClassName="bg-transparent"
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm">Notification channels</p>
              <span className="text-xs text-neutral-350">Search for a notification channel</span>
            </div>
          </Section>

          <div className="sticky bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-4 border-t border-neutral-250 bg-white py-4">
            {!isEdit && (
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <Button type="button" variant="plain" color="neutral" size="lg" onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
                <Button type="button" variant="plain" color="neutral" size="lg" onClick={handleSkip}>
                  Skip this alert
                </Button>
              </div>
            )}
            <Button
              size="lg"
              onClick={onSubmit}
              disabled={!methods.formState.isValid}
              className={isEdit ? 'ml-auto' : ''}
              loading={isEdit && isLoadingEditAlertRule}
            >
              {isEdit ? 'Save' : 'Continue'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default MetricConfigurationStep
