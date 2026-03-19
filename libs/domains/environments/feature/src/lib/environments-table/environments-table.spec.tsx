import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'

const mockUseProject = jest.fn()
const mockUseEnvironmentsOverview = jest.fn()

interface EnvironmentSectionMockProps {
  type: string
  items: unknown[]
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
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

jest.mock('./environment-section/environment-section', () => ({
  __esModule: true,
  EnvironmentSection: ({ type, items }: EnvironmentSectionMockProps) => (
    <div data-testid="environment-section">{`section:${type}:${items.length}`}</div>
  ),
}))

function renderEnvironmentsTable() {
  // Load the module after Jest has registered mocks for suspense children and data hooks.
  const { EnvironmentsTable } = require('./environments-table') as typeof import('./environments-table')
  return renderWithProviders(<EnvironmentsTable />)
}

describe('EnvironmentsTable', () => {
  beforeEach(() => {
    mockUseProject.mockReset()
    mockUseEnvironmentsOverview.mockReset()
  })

  it('should render project name and environment sections', () => {
    mockUseProject.mockReturnValue({
      data: {
        name: 'Project Alpha',
      },
    })
    mockUseEnvironmentsOverview.mockReturnValue({
      data: [
        { id: 'env-1', mode: EnvironmentModeEnum.PRODUCTION },
        { id: 'env-2', mode: EnvironmentModeEnum.PRODUCTION },
        { id: 'env-3', mode: EnvironmentModeEnum.DEVELOPMENT },
      ],
    })

    renderEnvironmentsTable()

    expect(screen.getByRole('heading', { name: 'Project Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New Environment' })).toBeInTheDocument()
    expect(screen.getAllByTestId('environment-section').map((section) => section.textContent)).toEqual([
      'section:PRODUCTION:2',
      'section:DEVELOPMENT:1',
      'section:STAGING:0',
      'section:PREVIEW:0',
    ])
  })
})
