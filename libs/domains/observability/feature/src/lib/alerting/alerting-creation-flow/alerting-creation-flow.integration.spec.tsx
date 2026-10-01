import { type AlertSeverity, type Environment } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { AlertingCreationFlow } from './alerting-creation-flow'
import { type AlertConfiguration } from './alerting-creation-flow.types'

const mockEdit = jest.fn()

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: () => false }))
jest.mock('../../hooks/use-create-alert-rule/use-create-alert-rule', () => ({
  useCreateAlertRule: () => ({ mutateAsync: jest.fn() }),
}))
jest.mock('../../hooks/use-edit-alert-rule/use-edit-alert-rule', () => ({
  useEditAlertRule: () => ({ mutateAsync: mockEdit }),
}))
jest.mock('../../hooks/use-container-name/use-container-name', () => ({ useContainerName: () => ({}) }))
jest.mock('../../hooks/use-ingress-name/use-ingress-name', () => ({ useIngressName: () => ({}) }))
jest.mock('../../hooks/use-http-route-name/use-http-route-name', () => ({ useHttpRouteName: () => ({}) }))
jest.mock('../../hooks/use-hpa-name/use-hpa-name', () => ({ useHpaName: () => ({}) }))
jest.mock('../../hooks/use-alert-receivers/use-alert-receivers', () => ({
  useAlertReceivers: () => ({ data: [{ id: 'receiver-1', name: 'Slack', type: 'SLACK' }] }),
}))
jest.mock('../use-rds-alert-target/use-rds-alert-target', () => ({
  useRdsAlertTarget: () => ({ isRds: false }),
}))

const savedRdsCpuAlert: AlertConfiguration = {
  id: 'alert-1',
  name: 'Alert RDS CPU utilization',
  tag: 'rds_cpu',
  for_duration: 'PT5M',
  severity: 'MEDIUM' as AlertSeverity,
  condition: {
    kind: 'BUILT',
    function: 'NONE',
    operator: 'ABOVE',
    threshold: 80,
    promql: 'aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="my-db"}',
  },
  alert_receiver_ids: ['receiver-1'],
  presentation: {},
}

describe('AlertingCreationFlow with the real configuration step', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEdit.mockResolvedValue({})
  })

  it('saves an RDS CPU threshold typed in the form', async () => {
    const { userEvent } = renderWithProviders(
      <AlertingCreationFlow
        organizationId="org-1"
        environment={{ cluster_id: 'cluster-1' } as Environment}
        service={{ id: 'service-1', name: 'My DB', serviceType: 'TERRAFORM' } as AnyService}
        selectedMetrics={['rds_cpu']}
        mode="edit"
        initialAlerts={[savedRdsCpuAlert]}
        alertRuleId="alert-1"
        onClose={jest.fn()}
        onComplete={jest.fn()}
      />
    )

    const thresholdInput = await screen.findByDisplayValue('80')
    await userEvent.clear(thresholdInput)
    await userEvent.type(thresholdInput, '85')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() =>
      expect(mockEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            description: 'Above 85% for 5 minutes',
            condition: expect.objectContaining({
              threshold: 85,
              promql: 'aws_rds_cpuutilization_average{dimension_DBInstanceIdentifier="my-db"}',
            }),
          }),
        })
      )
    )
  })
})
