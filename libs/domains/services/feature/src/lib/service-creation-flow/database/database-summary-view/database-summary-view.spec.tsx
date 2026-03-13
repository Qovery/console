import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DatabaseSummaryView } from './database-summary-view'

const defaultProps = {
  generalData: {
    name: 'postgres',
    accessibility: DatabaseAccessibilityEnum.PRIVATE,
    mode: DatabaseModeEnum.CONTAINER,
    type: DatabaseTypeEnum.POSTGRESQL,
    version: '16',
  },
  resourcesData: {
    cpu: 500,
    memory: 512,
    storage: 20,
  },
  labelsGroup: [],
  annotationsGroup: [],
  onEditGeneral: jest.fn(),
  onEditResources: jest.fn(),
  onBack: jest.fn(),
  onSubmit: jest.fn(),
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
}

describe('DatabaseSummaryView', () => {
  it('renders summary cards and actions', () => {
    renderWithProviders(<DatabaseSummaryView {...defaultProps} />)

    expect(screen.getByRole('heading', { name: 'Ready to create your Database' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'General information' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByTestId('button-create')).toBeInTheDocument()
    expect(screen.getByTestId('button-create-deploy')).toBeInTheDocument()
    expect(screen.getByText('Postgresql')).toBeInTheDocument()
  })

  it('shows the managed callout and instance type for managed databases', () => {
    renderWithProviders(
      <DatabaseSummaryView
        {...defaultProps}
        generalData={{
          ...defaultProps.generalData,
          mode: DatabaseModeEnum.MANAGED,
          type: DatabaseTypeEnum.REDIS,
        }}
        resourcesData={{
          ...defaultProps.resourcesData,
          instance_type: 'cache.t3.small',
        }}
      />
    )

    expect(screen.getByText('Qovery manages this resource for you')).toBeInTheDocument()
    expect(screen.getByText(/cache.t3.small/)).toBeInTheDocument()
  })

  it('keeps MYSQL and DB acronyms uppercase in database type labels', () => {
    renderWithProviders(
      <DatabaseSummaryView
        {...defaultProps}
        generalData={{
          ...defaultProps.generalData,
          type: DatabaseTypeEnum.MONGODB,
        }}
      />
    )

    expect(screen.getByText('MongoDB')).toBeInTheDocument()
  })
})
