import { EnvironmentModeEnum, type EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import type { ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { EnvironmentsTable } from './environments-table'

const mockUseProject = jest.fn()
const mockUseEnvironmentsOverview = jest.fn()
const mockNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  Link: ({ children }: { children?: ReactNode }) => <a href="/">{children}</a>,
  useNavigate: () => mockNavigate,
  useParams: () => ({ organizationId: 'org-1', projectId: 'project-1' }),
}))

jest.mock('@qovery/domains/projects/feature', () => ({
  __esModule: true,
  useProject: (props: unknown) => mockUseProject(props),
  useEnvironmentsOverview: (props: unknown) => mockUseEnvironmentsOverview(props),
}))

jest.mock('../environment-action-toolbar/environment-action-toolbar', () => ({
  MenuManageDeployment: () => <button type="button">Manage deployment</button>,
  MenuOtherActions: () => <button type="button">Other actions</button>,
}))

jest.mock('../environment-state-chip/environment-state-chip', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('../hooks/use-environments/use-environments', () => ({
  __esModule: true,
  default: () => ({ data: [] }),
}))

jest.mock('./environments-table-action-bar', () => ({
  EnvironmentsTableActionBar: () => <div data-testid="environments-table-action-bar" />,
}))

function environmentOverview(
  id: string,
  mode: EnvironmentModeEnum,
  name: string,
  lastDeploymentDate?: string
): EnvironmentOverviewResponse {
  return {
    id,
    mode,
    name,
    services_overview: {
      service_count: 0,
      managed_by: 'QOVERY',
    },
    ...(lastDeploymentDate ? { deployment_status: { last_deployment_date: lastDeploymentDate } } : {}),
  } as EnvironmentOverviewResponse
}

describe('EnvironmentsTable', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockUseProject.mockReset()
    mockUseEnvironmentsOverview.mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render project name and environment sections', () => {
    mockUseProject.mockReturnValue({
      data: {
        name: 'Project Alpha',
      },
    })
    mockUseEnvironmentsOverview.mockReturnValue({
      data: [
        environmentOverview('env-1', EnvironmentModeEnum.PRODUCTION, 'Zulu'),
        environmentOverview('env-2', EnvironmentModeEnum.PRODUCTION, 'Alpha'),
        environmentOverview('env-3', EnvironmentModeEnum.DEVELOPMENT, 'Beta'),
      ],
    })

    renderWithProviders(<EnvironmentsTable />)

    expect(screen.getByRole('heading', { name: 'Project Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New Environment' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
      'Project Alpha',
      'Production',
      'Development',
      'Staging',
      'Ephemeral',
    ])
    expect(screen.getAllByRole('link', { name: /^(Alpha|Zulu|Beta)$/ }).map((link) => link.textContent)).toEqual([
      'Alpha',
      'Zulu',
      'Beta',
    ])
  })

  it('should sort ephemeral environments by last operation with newer environments first', () => {
    mockUseProject.mockReturnValue({ data: { name: 'Project Alpha' } })
    mockUseEnvironmentsOverview.mockReturnValue({
      data: [
        environmentOverview('env-1', EnvironmentModeEnum.PREVIEW, 'Bravo', '2024-03-01T00:00:00Z'),
        environmentOverview('env-2', EnvironmentModeEnum.PREVIEW, 'Alpha', '2024-01-01T00:00:00Z'),
        environmentOverview('env-3', EnvironmentModeEnum.PREVIEW, 'Charlie', '2024-02-01T00:00:00Z'),
      ],
    })

    renderWithProviders(<EnvironmentsTable />)

    expect(screen.getAllByRole('link', { name: /^(Alpha|Bravo|Charlie)$/ }).map((link) => link.textContent)).toEqual([
      'Bravo',
      'Charlie',
      'Alpha',
    ])
  })

  it('should preserve checkbox focus when selecting an environment', async () => {
    mockUseProject.mockReturnValue({ data: { name: 'Project Alpha' } })
    mockUseEnvironmentsOverview.mockReturnValue({
      data: [environmentOverview('env-1', EnvironmentModeEnum.PRODUCTION, 'Production environment')],
    })
    const { userEvent } = renderWithProviders(<EnvironmentsTable />)
    const checkbox = screen.getByRole('checkbox', { name: 'Select Production environment' })

    await userEvent.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(checkbox).toHaveFocus()
  })
})
