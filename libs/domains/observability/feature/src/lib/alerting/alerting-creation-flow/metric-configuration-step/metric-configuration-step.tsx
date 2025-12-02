import clsx from 'clsx'
import { AlertRuleConditionOperator, AlertSeverity } from 'qovery-typescript-axios'
import { AlertRuleConditionFunction } from 'qovery-typescript-axios'
import { useEffect, useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { v4 as uuid } from 'uuid'
import { type Value } from '@qovery/shared/interfaces'
import {
  Button,
  ExternalLink,
  FunnelFlowBody,
  Heading,
  Icon,
  InputSelect,
  InputSelectSmall,
  InputTextSmall,
  Section,
  useModal,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { useAlertReceivers } from '../../../hooks/use-alert-receivers/use-alert-receivers'
import {
  formatDuration,
  formatMetricLabel,
  formatOperator,
  formatThreshold,
} from '../../../util-alerting/generate-condition-description'
import { NotificationChannelModal } from '../../notification-channel-modal/notification-channel-modal'
import { useAlertingCreationFlowContext } from '../alerting-creation-flow'
import { type AlertConfiguration, type MetricCategory } from '../alerting-creation-flow.types'

const VALUES_OPTIONS = [
  { label: 'Maximum', value: AlertRuleConditionFunction.MAX },
  { label: 'Average', value: AlertRuleConditionFunction.AVG },
  { label: 'Minimum', value: AlertRuleConditionFunction.MIN },
]

const HTTP_ERROR_VALUES_OPTIONS = [{ label: 'Count', value: AlertRuleConditionFunction.COUNT }]
const REPLICAS_NUMBER_VALUES_OPTIONS = [{ label: 'Count', value: AlertRuleConditionFunction.COUNT }]

const METRIC_TYPE_OPTIONS: Record<MetricCategory, { label: string; value: AlertRuleConditionFunction }[]> = {
  cpu: VALUES_OPTIONS,
  memory: VALUES_OPTIONS,
  http_error: HTTP_ERROR_VALUES_OPTIONS,
  http_latency: VALUES_OPTIONS,
  missing_replicas: REPLICAS_NUMBER_VALUES_OPTIONS,
  instance_restart: VALUES_OPTIONS,
}

const DEFAULT_THRESHOLDS: Record<MetricCategory, number> = {
  cpu: 80,
  memory: 80,
  http_error: 5,
  http_latency: 0.25,
  missing_replicas: 0,
  instance_restart: 80,
}

const OPERATOR_OPTIONS: Value[] = [
  { label: 'Above', value: 'ABOVE' },
  { label: 'Below', value: 'BELOW' },
]

const DURATION_OPTIONS: Value[] = [
  { label: 'Immediate', value: 'PT0S' },
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

const METRICS_WITH_HIDDEN_CONDITIONS: MetricCategory[] = ['missing_replicas']

const shouldHideConditions = (category: MetricCategory): boolean => {
  return METRICS_WITH_HIDDEN_CONDITIONS.includes(category)
}

export function MetricConfigurationStep({
  isEdit,
}: {
  isEdit?: boolean
} = {}) {
  const { organizationId = '' } = useParams()
  const { openModal, closeModal } = useModal()
  const {
    selectedMetrics,
    serviceName,
    alerts,
    setAlerts,
    currentStepIndex,
    onNavigateToMetric,
    onComplete,
    isLoading,
  } = useAlertingCreationFlowContext()

  const { data: alertReceivers = [] } = useAlertReceivers({ organizationId })

  const index = currentStepIndex
  const metricCategory = (selectedMetrics[index] || 'cpu') as MetricCategory
  const currentAlert = isEdit ? alerts[0] : undefined
  const initialData = currentAlert ?? alerts[index]
  const isLastMetric = index === selectedMetrics.length - 1
  const includedAlertsCount = alerts.filter((alert, i) => i !== index && !alert.skipped).length

  const defaultValues = useMemo<AlertConfiguration>(() => {
    if (initialData) {
      const isHiddenConditionMetric = shouldHideConditions(metricCategory)
      if (isHiddenConditionMetric) {
        return {
          ...initialData,
          condition: {
            ...initialData.condition,
            operator: AlertRuleConditionOperator.BELOW,
            threshold: 1,
          },
        }
      }
      return initialData
    }

    const isHiddenConditionMetric = shouldHideConditions(metricCategory)
    const defaultThreshold = isHiddenConditionMetric ? 1 : DEFAULT_THRESHOLDS[metricCategory] ?? 80
    const defaultFunction = METRIC_TYPE_OPTIONS[metricCategory][0].value ?? AlertRuleConditionFunction.MAX
    const defaultOperator = isHiddenConditionMetric
      ? AlertRuleConditionOperator.BELOW
      : AlertRuleConditionOperator.ABOVE
    const defaultDuration = 'PT5M'

    return {
      id: uuid(),
      tag: metricCategory,
      condition: {
        kind: 'BUILT',
        function: defaultFunction,
        operator: defaultOperator,
        threshold: defaultThreshold,
        promql: '',
      },
      for_duration: defaultDuration,
      name: metricCategory ? `${metricCategory.replace(/_/g, ' ').toUpperCase()} alert` : '',
      severity: 'MEDIUM',
      alert_receiver_ids: [],
      presentation: { summary: undefined },
    }
  }, [initialData, metricCategory])

  const methods = useForm<AlertConfiguration>({
    mode: 'onChange',
    defaultValues: defaultValues as AlertConfiguration,
  })

  useEffect(() => {
    methods.reset(defaultValues)
    const isHiddenConditionMetric = shouldHideConditions(metricCategory)
    if (isHiddenConditionMetric) {
      methods.setValue('condition.operator', AlertRuleConditionOperator.BELOW)
      methods.setValue('condition.threshold', 1)
    }
  }, [methods, defaultValues, metricCategory])

  const watchTag = methods.watch('tag')
  const watchCondition = methods.watch('condition')
  const watchForDuration = methods.watch('for_duration')

  // Auto-generate alert name from conditions
  useEffect(() => {
    const isHiddenConditionMetric = shouldHideConditions(watchTag as MetricCategory)

    if (isHiddenConditionMetric) {
      const metric = formatMetricLabel(watchTag)
      if (metric) {
        methods.setValue('name', `${metric} Alert`)
      }
      return
    }

    const metric = formatMetricLabel(watchTag)
    const functionLabel = METRIC_TYPE_OPTIONS[watchTag as MetricCategory]?.find(
      (option) => option.value === watchCondition?.function
    )?.label
    const operator = formatOperator(watchCondition?.operator)
    const threshold = formatThreshold(
      watchTag as MetricCategory,
      parseFloat(watchCondition?.threshold?.toString() ?? '0')
    )
    const duration = formatDuration(watchForDuration)

    if (metric && operator && threshold && duration && functionLabel) {
      methods.setValue(
        'name',
        `${functionLabel} ${metric} ${operator} ${threshold} ${duration === 'immediately' ? 'immediately' : `for ${duration}`}`
      )
    }
  }, [
    watchTag,
    watchCondition?.function,
    watchCondition?.operator,
    watchCondition?.threshold,
    watchForDuration,
    methods,
  ])

  const handleNext = async (data: AlertConfiguration) => {
    const isHiddenConditionMetric = shouldHideConditions(metricCategory)
    const processedData = isHiddenConditionMetric
      ? {
          ...data,
          condition: {
            ...data.condition,
            operator: AlertRuleConditionOperator.BELOW,
            threshold: 1,
          },
          for_duration: 'PT0S',
        }
      : data
    const newAlerts = [...alerts]
    newAlerts[index] = { ...processedData, skipped: false }
    setAlerts(newAlerts)

    if (isEdit) {
      await onComplete(newAlerts)
    } else if (isLastMetric) {
      await onComplete(newAlerts)
    } else {
      onNavigateToMetric(index + 1)
    }
  }

  const handleSkip = async () => {
    const currentFormValues = methods.getValues()
    const isHiddenConditionMetric = shouldHideConditions(metricCategory)
    const processedValues = isHiddenConditionMetric
      ? {
          ...currentFormValues,
          condition: {
            ...currentFormValues.condition,
            operator: AlertRuleConditionOperator.BELOW,
            threshold: 1,
          },
          for_duration: 'PT0S',
        }
      : currentFormValues
    const newAlerts = [...alerts]
    newAlerts[index] = {
      ...processedValues,
      skipped: true,
    }
    setAlerts(newAlerts)

    if (isLastMetric) {
      await onComplete(newAlerts)
    } else {
      onNavigateToMetric(index + 1)
    }
  }

  const handlePrevious = () => {
    if (isEdit || index <= 0) {
      return
    }

    onNavigateToMetric(index - 1)
  }

  const handleAddNotificationChannel = () => {
    openModal({
      content: <NotificationChannelModal organizationId={organizationId} onClose={closeModal} />,
    })
  }

  const onSubmit = methods.handleSubmit((data) => {
    const isHiddenConditionMetric = shouldHideConditions(metricCategory)
    const processedData = isHiddenConditionMetric
      ? {
          ...data,
          condition: {
            ...data.condition,
            operator: AlertRuleConditionOperator.BELOW,
            threshold: 1,
          },
          for_duration: 'PT0S',
        }
      : data
    handleNext(processedData)
  })

  const functionLabel = METRIC_TYPE_OPTIONS[metricCategory]?.find(
    (option: Value) => option.value === watchCondition?.function
  )?.label

  const unit = match(watchTag)
    .with('http_latency', () => 'secs')
    .otherwise(() => '%')

  return (
    <FunnelFlowBody key={index} customContentWidth="max-w-[52rem]">
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
                    href="https://www.qovery.com/docs/configuration/integrations/observability/qovery-observe"
                    size="sm"
                  >
                    Conditions guide
                  </ExternalLink>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm">Metric</p>
                  <div className="flex gap-2">
                    <Controller
                      name="tag"
                      control={methods.control}
                      render={({ field }) => (
                        <InputTextSmall
                          label="Metric"
                          className="w-full"
                          name={field.name}
                          inputClassName="text-neutral-350"
                          value={field.value.replace(/_/g, ' ').toUpperCase()}
                          disabled
                        />
                      )}
                    />
                    {!shouldHideConditions(metricCategory) && (
                      <Controller
                        name="condition.function"
                        control={methods.control}
                        render={({ field }) => (
                          <InputSelectSmall
                            name={field.name}
                            items={METRIC_TYPE_OPTIONS[metricCategory] || []}
                            defaultValue={field.value}
                            onChange={(value) => field.onChange(value)}
                            className="w-40"
                            inputClassName="bg-transparent"
                          />
                        )}
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm">Target service</p>
                  <div className="relative">
                    <InputTextSmall
                      label="Target service"
                      name="service"
                      inputClassName="pl-7 text-neutral-350"
                      value={serviceName}
                      placeholder="Search service"
                      disabled
                    />
                    <Icon
                      iconName="search"
                      iconStyle="regular"
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-neutral-350"
                    />
                  </div>
                </div>

                {!shouldHideConditions(metricCategory) && (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">Trigger condition</p>
                    <div className="flex items-center gap-2">
                      <Controller
                        name="condition.operator"
                        control={methods.control}
                        render={({ field }) => (
                          <InputSelectSmall
                            name={field.name}
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
                          validate: (v) => {
                            const value = v?.toString()
                            if (value === '') {
                              return 'Threshold is required'
                            }
                            if (watchTag !== 'http_latency' && (Number(value) < 0 || Number(value) > 100)) {
                              return 'Threshold must be between 0 and 100'
                            }
                            return true
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <div className="relative w-40">
                            <InputTextSmall
                              label="Threshold"
                              name={field.name}
                              type="number"
                              placeholder="00"
                              value={field.value?.toString()}
                              onChange={field.onChange}
                              className={clsx('w-full', error ? 'border-red-500' : '')}
                              inputClassName="bg-transparent pr-6"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 flex h-8 -translate-y-1/2 items-center text-xs text-neutral-350">
                              {unit}
                            </span>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <p className="text-sm">Duration</p>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="for_duration"
                      control={methods.control}
                      render={({ field }) => (
                        <InputSelectSmall
                          name={field.name}
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
                  {metricCategory === 'missing_replicas' ? (
                    <p className="text-xs uppercase text-blue-500">
                      SEND A NOTIFICATION WHEN <span className="text-neutral-900">{serviceName}</span> HAS MISSING
                      REPLICAS
                    </p>
                  ) : (
                    <p className="flex flex-col gap-1 text-xs uppercase text-blue-500">
                      <span>
                        SEND A NOTIFICATION WHEN THE <span className="text-neutral-900">{functionLabel}</span> OF{' '}
                        <span className="text-neutral-900">{formatMetricLabel(metricCategory)}</span> FOR{' '}
                        <span className="text-neutral-900">{serviceName}</span>
                      </span>
                      <span>
                        IS <span className="text-neutral-900">{watchCondition.operator}</span>{' '}
                        <span className="text-red-600">
                          {watchCondition.threshold} {unit}
                        </span>{' '}
                        {watchForDuration === 'PT0S' ? (
                          'IMMEDIATELY'
                        ) : (
                          <>
                            DURING THE{' '}
                            <span className="text-neutral-900">
                              {DURATION_OPTIONS.find((option) => option.value === watchForDuration)?.label}
                            </span>
                          </>
                        )}
                      </span>
                    </p>
                  )}
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
                    name={field.name}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm">Notification text</p>
              <div className="flex flex-col gap-1">
                <Controller
                  name="presentation.summary"
                  control={methods.control}
                  render={({ field }) => (
                    <InputTextSmall
                      label="Notification text"
                      placeholder="Your notification text (optional)"
                      name={field.name}
                      value={field.value ?? undefined}
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
                <p className="pl-2 text-xs text-neutral-350">This message will be displayed in your notification.</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm">Severity</p>
              <Controller
                name="severity"
                control={methods.control}
                render={({ field }) => (
                  <InputSelectSmall
                    name={field.name}
                    items={SEVERITY_OPTIONS}
                    defaultValue={field.value}
                    onChange={(value) => field.onChange(value)}
                    inputClassName="bg-transparent"
                  />
                )}
              />
            </div>

            <div className="flex flex-col">
              <Controller
                name="alert_receiver_ids"
                control={methods.control}
                rules={{ required: 'Notification channels are required' }}
                render={({ field, fieldState }) => (
                  <InputSelect
                    options={alertReceivers?.map((receiver) => ({
                      label: (
                        <span className="flex items-center gap-1">
                          {match(receiver.type)
                            .with('SLACK', (v) => <Icon name={v} iconStyle="regular" width={14} height={14} />)
                            .otherwise(() => (
                              <Icon iconName="webhook" iconStyle="regular" className="text-xs" />
                            ))}
                          {receiver.name}
                        </span>
                      ),
                      value: receiver.id,
                    }))}
                    menuListButton={{
                      title: 'Select notification channel',
                      label: 'New notification channel',
                      onClick: () => handleAddNotificationChannel(),
                    }}
                    value={field.value}
                    onChange={field.onChange}
                    label="Notification channels"
                    className="w-full"
                    error={fieldState?.error?.message}
                    isMulti
                  />
                )}
              />
            </div>
          </Section>

          <div className="sticky bottom-0 left-0 right-0 flex items-center justify-between gap-4 border-t border-neutral-250 bg-white py-4">
            {!isEdit && (
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <Button type="button" variant="plain" color="neutral" size="lg" onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
                {!isLastMetric && (
                  <Button type="button" variant="plain" color="neutral" size="lg" onClick={handleSkip}>
                    Skip this alert
                  </Button>
                )}
              </div>
            )}
            <div className={clsx('flex items-center gap-2', isEdit ? 'w-full' : '')}>
              {!isEdit && isLastMetric && includedAlertsCount > 0 && (
                <Button type="button" variant="outline" size="lg" onClick={handleSkip} loading={isLoading}>
                  Skip and create others
                </Button>
              )}
              <Button
                size="lg"
                onClick={onSubmit}
                disabled={!methods.formState.isValid}
                className={isEdit ? 'ml-auto' : ''}
                loading={isLoading}
              >
                {isEdit ? 'Save' : isLastMetric ? 'Create' : 'Include'}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default MetricConfigurationStep
