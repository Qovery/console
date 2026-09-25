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
  MenuManageDeployment: () => <button type="button">Manage deployment menu</button>,
  MenuOtherActions: () => <button type="button">Delete environment</button>,
}))

const overview: EnvironmentOverviewResponse = {
  id: 'env-1',
  name: 'My environment',
  mode: EnvironmentModeEnum.DEVELOPMENT,
  services_overview: {
    service_count: 2,
    managed_by: 'QOVERY',
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
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
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

  it('should select an environment row without navigating', async () => {
    const onEnvironmentSelectionChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <EnvironmentSection
        type={EnvironmentModeEnum.DEVELOPMENT}
        items={[overview]}
        onEnvironmentSelectionChange={onEnvironmentSelectionChange}
      />
    )

    await userEvent.click(screen.getAllByRole('checkbox')[1])

    expect(onEnvironmentSelectionChange).toHaveBeenCalledWith('env-1', true)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should select all environments in a section', async () => {
    const onSectionSelectionChange = jest.fn()
    const { userEvent } = renderWithProviders(
      <EnvironmentSection
        type={EnvironmentModeEnum.DEVELOPMENT}
        items={[overview]}
        onSectionSelectionChange={onSectionSelectionChange}
      />
    )

    await userEvent.click(screen.getAllByRole('checkbox')[0])

    expect(onSectionSelectionChange).toHaveBeenCalledWith(['env-1'], true)
  })

  it('should display both action buttons when there are no services', async () => {
    const noServiceOverview = {
      ...overview,
      services_overview: {
        service_count: 0,
      },
      deployment_status: undefined,
    } as EnvironmentOverviewResponse

    const { userEvent } = renderWithProviders(
      <EnvironmentSection type={EnvironmentModeEnum.DEVELOPMENT} items={[noServiceOverview]} />
    )

    const manageDeploymentButton = screen.getByRole('button', { name: /manage deployment/i })
    expect(manageDeploymentButton).toBeDisabled()

    await userEvent.hover(manageDeploymentButton.parentElement as HTMLElement)
    expect(
      await screen.findByRole('tooltip', { name: 'Add at least one service to deploy this environment' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete environment/i })).toBeInTheDocument()
  })

  it('should display no operation detected when services exist without deployment status', () => {
    renderWithProviders(
      <EnvironmentSection
        type={EnvironmentModeEnum.DEVELOPMENT}
        items={[
          {
            ...overview,
            deployment_status: undefined,
          },
        ]}
      />
    )

    expect(screen.getByText('No operation detected')).toBeInTheDocument()
    expect(screen.queryByText(/0 seconds ago/i)).not.toBeInTheDocument()
  })

  it('sorts environments on click and restores the default order after the third click', async () => {
    const environments = [
      { ...overview, id: 'env-b', name: 'Beta' },
      { ...overview, id: 'env-a', name: 'Alpha' },
    ] as EnvironmentOverviewResponse[]

    const { userEvent } = renderWithProviders(
      <EnvironmentSection type={EnvironmentModeEnum.DEVELOPMENT} items={environments} />
    )

    const getEnvironmentNames = () =>
      screen
        .getAllByRole('checkbox', { name: /^Select (Alpha|Beta)$/i })
        .map((checkbox) => checkbox.getAttribute('aria-label')?.replace('Select ', ''))

    expect(getEnvironmentNames()).toEqual(['Alpha', 'Beta'])

    await userEvent.click(screen.getByRole('button', { name: /sort by environment/i }))

    expect(getEnvironmentNames()).toEqual(['Alpha', 'Beta'])

    await userEvent.click(screen.getByRole('button', { name: /sort by environment/i }))

    expect(getEnvironmentNames()).toEqual(['Beta', 'Alpha'])

    await userEvent.click(screen.getByRole('button', { name: /sort by environment/i }))

    expect(getEnvironmentNames()).toEqual(['Alpha', 'Beta'])
  })

  it('sorts a missing last update as just now, as displayed in its row', async () => {
    jest.setSystemTime(new Date('2026-03-18T12:00:00.000Z'))
    const environments = [
      { ...overview, id: 'env-a', name: 'Alpha' },
      { ...overview, id: 'env-b', name: 'Beta', updated_at: undefined },
    ] as EnvironmentOverviewResponse[]

    const { userEvent } = renderWithProviders(
      <EnvironmentSection type={EnvironmentModeEnum.DEVELOPMENT} items={environments} />
    )

    await userEvent.click(screen.getByRole('button', { name: /sort by last update/i }))
    const getEnvironmentNames = () =>
      screen
        .getAllByRole('checkbox', { name: /^Select (Alpha|Beta)$/i })
        .map((checkbox) => checkbox.getAttribute('aria-label')?.replace('Select ', ''))

    expect(getEnvironmentNames()).toEqual(['Alpha', 'Beta'])

    await userEvent.click(screen.getByRole('button', { name: /sort by last update/i }))
    expect(getEnvironmentNames()).toEqual(['Beta', 'Alpha'])
  })

  it('should reflect the current sort state through aria-sort on the column headers', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentSection type={EnvironmentModeEnum.DEVELOPMENT} items={[overview]} />
    )

    const environmentHeader = screen.getByRole('columnheader', { name: 'Environment' })
    const clusterHeader = screen.getByRole('columnheader', { name: 'Cluster' })

    expect(environmentHeader).toHaveAttribute('aria-sort', 'none')
    expect(clusterHeader).toHaveAttribute('aria-sort', 'none')
    expect(environmentHeader.querySelector('.fa-arrow-down')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /sort by environment/i }))
    expect(environmentHeader).toHaveAttribute('aria-sort', 'ascending')
    expect(environmentHeader.querySelector('.fa-arrow-down')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /sort by environment/i }))
    expect(environmentHeader).toHaveAttribute('aria-sort', 'descending')
    expect(environmentHeader.querySelector('.fa-arrow-up')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /sort by cluster/i }))
    expect(clusterHeader).toHaveAttribute('aria-sort', 'ascending')
    expect(environmentHeader).toHaveAttribute('aria-sort', 'none')
    expect(clusterHeader.querySelector('.fa-arrow-down')).toBeInTheDocument()
    expect(environmentHeader.querySelector('.fa-arrow-up')).not.toBeInTheDocument()
  })

  it('keeps the ephemeral default sort without showing an arrow initially', () => {
    renderWithProviders(<EnvironmentSection type={EnvironmentModeEnum.PREVIEW} items={[overview]} />)

    const lastOperationHeader = screen.getByRole('columnheader', { name: 'Last operation' })
    expect(lastOperationHeader).toHaveAttribute('aria-sort', 'none')
    expect(lastOperationHeader.querySelector('.fa-arrow-up')).not.toBeInTheDocument()
  })

  it('should disable the deploy button when the environment is managed by ArgoCD', async () => {
    const { userEvent } = renderWithProviders(
      <EnvironmentSection
        type={EnvironmentModeEnum.DEVELOPMENT}
        items={[
          {
            ...overview,
            services_overview: {
              service_count: 2,
              managed_by: 'ARGOCD',
            },
          },
        ]}
      />
    )

    expect(screen.getByText('ArgoCD')).toBeInTheDocument()
    const manageDeploymentButton = screen.getByRole('button', { name: /manage deployment/i })
    expect(manageDeploymentButton).toBeDisabled()
    expect(screen.queryByRole('button', { name: /manage deployment menu/i })).not.toBeInTheDocument()

    await userEvent.hover(manageDeploymentButton.parentElement as HTMLElement)
    expect(
      await screen.findByRole('tooltip', { name: 'ArgoCD environments can only be deployed from ArgoCD' })
    ).toBeInTheDocument()
  })
})
