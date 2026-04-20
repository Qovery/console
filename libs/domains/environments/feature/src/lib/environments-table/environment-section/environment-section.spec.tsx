import { EnvironmentModeEnum, type EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import type { ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentSection } from './environment-section'

const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ organizationId: 'org-1', projectId: 'project-1' }),
  Link: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))

jest.mock('../../hooks/use-environments/use-environments', () => ({
  __esModule: true,
  default: () => ({
    data: [
      {
        id: 'env-1',
        name: 'My environment',
        mode: 'DEVELOPMENT',
        cluster_id: 'cluster-1',
        organization: { id: 'org-1' },
        project: { id: 'project-1' },
      },
    ],
  }),
}))

jest.mock('../../environment-action-toolbar/environment-action-toolbar', () => ({
  MenuManageDeployment: () => <button type="button">Manage deployment</button>,
  MenuOtherActions: () => <button type="button">Delete environment</button>,
}))

const overview: EnvironmentOverviewResponse = {
  id: 'env-1',
  name: 'My environment',
  mode: EnvironmentModeEnum.DEVELOPMENT,
  services_overview: {
    service_count: 2,
  },
  updated_at: '2026-03-18T10:00:00.000Z',
  deployment_status: {
    last_deployment_date: '2026-03-18T09:00:00.000Z',
    last_deployment_state: 'DEPLOYED',
  },
  cluster: {
    id: 'cluster-1',
    name: 'Cluster 1',
  },
} as EnvironmentOverviewResponse

describe('EnvironmentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should navigate to the environment when clicking the row', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentSection type={EnvironmentModeEnum.DEVELOPMENT} items={[overview]} />
    )

    await userEvent.click(screen.getByRole('link', { name: /my environment/i }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId',
      params: { organizationId: 'org-1', projectId: 'project-1', environmentId: 'env-1' },
    })
  })

  it('should not navigate when clicking an action inside the row', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentSection type={EnvironmentModeEnum.DEVELOPMENT} items={[overview]} />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Delete environment' }))

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
