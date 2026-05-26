import { type Environment } from 'qovery-typescript-axios'
import { type AnyService } from '@qovery/domains/services/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useServiceDeploymentAndRunningStatuses } from '../../hooks/use-service-deployment-and-running-statuses/use-service-deployment-and-running-statuses'
import { ServiceLastDeploymentCell } from './service-last-deployment-cell'

jest.mock('@qovery/shared/devops-copilot/feature', () => ({
  DevopsCopilotTroubleshootTrigger: () => <button type="button">Launch diagnostic</button>,
}))

jest.mock(
  '../../hooks/use-service-deployment-and-running-statuses/use-service-deployment-and-running-statuses',
  () => ({
    useServiceDeploymentAndRunningStatuses: jest.fn(),
  })
)

const mockUseServiceDeploymentAndRunningStatuses = useServiceDeploymentAndRunningStatuses as jest.Mock

const environment = {
  id: 'environment-id',
  organization: {
    id: 'organization-id',
  },
  project: {
    id: 'project-id',
  },
} as Environment

const service = {
  id: 'service-id',
  name: 'Admin API',
  serviceType: 'CONTAINER',
} as AnyService

describe('ServiceLastDeploymentCell', () => {
  it('keeps the deployment action icon neutral for failed deployments', () => {
    mockUseServiceDeploymentAndRunningStatuses.mockReturnValue({
      data: {
        deploymentStatus: {
          execution_id: 'execution-id',
          last_deployment_date: '2026-05-25T07:00:00Z',
          state: 'DEPLOYMENT_ERROR',
          status_details: {
            action: 'DEPLOY',
            status: 'ERROR',
            sub_action: 'NONE',
          },
        },
      },
    })

    renderWithProviders(<ServiceLastDeploymentCell environment={environment} service={service} />)

    expect(screen.getByText('Launch diagnostic')).toBeInTheDocument()
    expect(screen.getByText('Deploy').previousElementSibling).toHaveClass('text-neutral-subtle')
    expect(screen.getByText('Deploy').previousElementSibling).not.toHaveClass('text-negative')
  })

  it('keeps successful deployment indicators monochrome', () => {
    mockUseServiceDeploymentAndRunningStatuses.mockReturnValue({
      data: {
        deploymentStatus: {
          execution_id: 'execution-id',
          last_deployment_date: '2026-05-25T07:00:00Z',
          state: 'DEPLOYED',
          status_details: {
            action: 'DEPLOY',
            status: 'SUCCESS',
            sub_action: 'NONE',
          },
        },
      },
    })

    renderWithProviders(<ServiceLastDeploymentCell environment={environment} service={service} />)

    expect(screen.queryByText('Launch diagnostic')).not.toBeInTheDocument()
    expect(screen.getByText('Deploy').previousElementSibling).toHaveClass('text-neutral-subtle')
  })
})
