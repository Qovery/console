import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type Environment } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  AlertingCreationFlow,
  useAlertingCreationFlowContext as mockUseAlertingCreationFlowContext,
} from './alerting-creation-flow'
import { type AlertConfiguration, type MetricCategory } from './alerting-creation-flow.types'

const mockCreate = jest.fn()
const mockEdit = jest.fn()
const mockComplete = jest.fn()
let mockHpaName: string | undefined
const mockUseRdsAlertTarget = jest.fn()

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))
jest.mock('../../hooks/use-create-alert-rule/use-create-alert-rule', () => ({
  useCreateAlertRule: () => ({ mutateAsync: mockCreate }),
}))
jest.mock('../../hooks/use-edit-alert-rule/use-edit-alert-rule', () => ({
  useEditAlertRule: () => ({ mutateAsync: mockEdit }),
}))
jest.mock('../../hooks/use-container-name/use-container-name', () => ({ useContainerName: () => ({}) }))
jest.mock('../../hooks/use-ingress-name/use-ingress-name', () => ({ useIngressName: () => ({}) }))
jest.mock('../../hooks/use-http-route-name/use-http-route-name', () => ({ useHttpRouteName: () => ({}) }))
jest.mock('../../hooks/use-hpa-name/use-hpa-name', () => ({ useHpaName: () => ({ data: mockHpaName }) }))
jest.mock('../../hooks/use-rds-alert-target/use-rds-alert-target', () => ({
  useRdsAlertTarget: (params: unknown) => mockUseRdsAlertTarget(params),
}))
jest.mock('./metric-configuration-step/metric-configuration-step', () => ({
  MetricConfigurationStep: () => {
    const { alerts, onComplete } = mockUseAlertingCreationFlowContext()
    return <button onClick={() => onComplete(alerts)}>Save test alert</button>
  },
}))

const existingAlert: AlertConfiguration = {
  id: 'alert-1',
  name: 'HPA limit',
  tag: 'hpa_limit',
  for_duration: 'PT5M',
  severity: 'HIGH',
  condition: { kind: 'BUILT', operator: 'ABOVE', threshold: 1, promql: 'existing_hpa_query' },
  alert_receiver_ids: [],
  presentation: {},
}
function renderFlow(
  mode: 'create' | 'edit',
  alert = existingAlert,
  serviceType: AnyService['serviceType'] = 'APPLICATION'
) {
  return renderWithProviders(
    <AlertingCreationFlow
      organizationId="org-1"
      environment={{ cluster_id: 'cluster-1' } as Environment}
      service={
        {
          id: 'service-1',
          name: 'Service',
          serviceType,
          min_running_instances: 1,
          max_running_instances: 1,
        } as AnyService
      }
      selectedMetrics={[alert.tag as MetricCategory]}
      mode={mode}
      initialAlerts={[alert]}
      alertRuleId="alert-1"
      onClose={jest.fn()}
      onComplete={mockComplete}
    />
  )
}

describe('alert creation and editing guards', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockHpaName = undefined
    mockUseRdsAlertTarget.mockReturnValue({ isRds: false })
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('edits an existing HPA alert using its saved query when autoscaling is disabled', async () => {
    const { userEvent } = renderFlow('edit')
    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))
    await waitFor(() =>
      expect(mockEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          alertRuleId: 'alert-1',
          payload: expect.objectContaining({ condition: expect.objectContaining({ promql: 'existing_hpa_query' }) }),
        })
      )
    )
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('does not create an HPA alert without a discovered HPA', async () => {
    const { userEvent } = renderFlow('create')
    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockComplete).not.toHaveBeenCalled()
  })

  it('does not edit an HPA alert with neither a discovered HPA nor a saved query', async () => {
    const { userEvent } = renderFlow('edit', {
      ...existingAlert,
      condition: { ...existingAlert.condition, promql: '' },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))
    expect(mockEdit).not.toHaveBeenCalled()
  })

  it.each([false, undefined])('blocks certificate submission when the flag is %s', async (enabled) => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(enabled)
    const { userEvent } = renderFlow('create', { ...existingAlert, tag: 'certificate_renewal_failed' })
    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockComplete).not.toHaveBeenCalled()
  })

  it('blocks certificate creation for unsupported services', async () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
    const { userEvent } = renderFlow('create', { ...existingAlert, tag: 'certificate_renewal_failed' }, 'DATABASE')
    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates certificate alerts without container, ingress or HPA discovery when enabled', async () => {
    jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
    const { userEvent } = renderFlow('create', { ...existingAlert, tag: 'certificate_renewal_failed' })
    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))
    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            tag: 'certificate_renewal_failed',
            condition: expect.objectContaining({ threshold: 0, promql: expect.stringContaining('count(') }),
          }),
        })
      )
    )
  })

  it('keeps existing certificate alerts editable when the flag is disabled', async () => {
    const { userEvent } = renderFlow('edit', { ...existingAlert, tag: 'certificate_renewal_failed' })
    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))
    await waitFor(() => expect(mockEdit).toHaveBeenCalled())
  })

  it('creates a catalog RDS storage alert with a byte threshold', async () => {
    mockUseRdsAlertTarget.mockReturnValue({
      isRds: true,
      dbInstance: 'z04d06b19-postgresql',
      target: { target_id: 'service-1', target_type: 'TERRAFORM' },
      hasCloudWatchMetrics: true,
    })
    const { userEvent } = renderFlow(
      'create',
      {
        ...existingAlert,
        tag: 'rds_free_storage_space',
        condition: { kind: 'BUILT', function: 'NONE', operator: 'BELOW', threshold: 10, promql: '' },
      },
      'TERRAFORM'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            target: { target_id: 'service-1', target_type: 'TERRAFORM' },
            condition: expect.objectContaining({
              function: 'NONE',
              operator: 'BELOW',
              threshold: 10737418240,
              promql:
                'last_over_time(aws_rds_free_storage_space_average{dimension_DBInstanceIdentifier="z04d06b19-postgresql"}[10m])',
            }),
          }),
        })
      )
    )
  })

  it('creates a catalog RDS connections alert on the Terraform service', async () => {
    mockUseRdsAlertTarget.mockReturnValue({
      isRds: true,
      dbInstance: 'my-blueprint-db',
      target: { target_id: 'service-1', target_type: 'TERRAFORM' },
      hasCloudWatchMetrics: true,
    })
    const { userEvent } = renderFlow(
      'create',
      {
        ...existingAlert,
        tag: 'rds_connections',
        condition: { kind: 'BUILT', function: 'NONE', operator: 'ABOVE', threshold: 300, promql: '' },
      },
      'TERRAFORM'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            target: { target_id: 'service-1', target_type: 'TERRAFORM' },
            condition: expect.objectContaining({
              threshold: 300,
              promql:
                'last_over_time(aws_rds_database_connections_average{dimension_DBInstanceIdentifier="my-blueprint-db"}[10m])',
            }),
          }),
        })
      )
    )
  })

  it.each([
    ['rds_read_latency', 'aws_rds_read_latency_average'],
    ['rds_write_latency', 'aws_rds_write_latency_average'],
  ] as const)('creates a catalog %s alert with a millisecond threshold', async (category, metric) => {
    mockUseRdsAlertTarget.mockReturnValue({
      isRds: true,
      dbInstance: 'my-blueprint-db',
      target: { target_id: 'service-1', target_type: 'TERRAFORM' },
      hasCloudWatchMetrics: true,
    })
    const { userEvent } = renderFlow(
      'create',
      {
        ...existingAlert,
        tag: category,
        condition: { kind: 'BUILT', function: 'NONE', operator: 'ABOVE', threshold: 250, promql: '' },
      },
      'TERRAFORM'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            tag: category,
            target: { target_id: 'service-1', target_type: 'TERRAFORM' },
            description: 'Above 250ms for 5 minutes',
            condition: expect.objectContaining({
              function: 'NONE',
              operator: 'ABOVE',
              threshold: 0.25,
              promql: `last_over_time(${metric}{dimension_DBInstanceIdentifier="my-blueprint-db"}[10m])`,
            }),
          }),
        })
      )
    )
  })

  it('does not create an RDS alert before the database identifier is available', async () => {
    mockUseRdsAlertTarget.mockReturnValue({
      isRds: true,
      target: { target_id: 'service-1', target_type: 'TERRAFORM' },
      hasCloudWatchMetrics: true,
    })
    const { userEvent } = renderFlow('create', { ...existingAlert, tag: 'rds_cpu' }, 'TERRAFORM')

    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('edits a saved RDS alert with its saved query, without loading RDS metadata', async () => {
    mockUseRdsAlertTarget.mockReturnValue({ isRds: false, hasCloudWatchMetrics: false, isMetadataUnavailable: true })
    const { userEvent } = renderFlow(
      'edit',
      {
        ...existingAlert,
        tag: 'rds_cpu',
        condition: {
          kind: 'BUILT',
          function: 'NONE',
          operator: 'ABOVE',
          threshold: 0.5,
          promql: 'aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="z04d06b19-postgresql"}',
        },
      },
      'TERRAFORM'
    )

    expect(mockUseRdsAlertTarget).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))

    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))

    await waitFor(() =>
      expect(mockEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            description: 'Above 0.5% for 5 minutes',
            condition: expect.objectContaining({
              promql: 'aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="z04d06b19-postgresql"}',
              threshold: 0.5,
            }),
          }),
        })
      )
    )
  })

  it('does not create an RDS alert when CloudWatch metrics are disabled', async () => {
    mockUseRdsAlertTarget.mockReturnValue({
      isRds: true,
      dbInstance: 'z04d06b19-postgresql',
      target: { target_id: 'service-1', target_type: 'TERRAFORM' },
      hasCloudWatchMetrics: false,
    })
    const { userEvent } = renderFlow('create', { ...existingAlert, tag: 'rds_cpu' }, 'TERRAFORM')

    await userEvent.click(screen.getByRole('button', { name: 'Save test alert' }))

    expect(mockCreate).not.toHaveBeenCalled()
  })
})
