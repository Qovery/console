import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { HelmSummaryView } from './helm-summary-view'

const defaultProps = {
  generalData: {
    name: 'helm-app',
    description: 'Helm service',
    source_provider: 'HELM_REPOSITORY' as const,
    repository: 'helm-repo-1',
    chart_name: 'nginx',
    chart_version: '1.2.3',
    arguments: '--wait',
    timeout_sec: '600',
    allow_cluster_wide_resources: true,
    auto_deploy: false,
    labels_groups: ['label-1'],
    annotations_groups: ['annotation-1'],
  },
  valuesOverrideFileData: {
    type: 'GIT_REPOSITORY' as const,
    provider: 'GITHUB',
    repository: 'https://github.com/Qovery/values',
    branch: 'main',
    paths: 'values.yaml',
    auto_deploy: true,
    git_repository: {
      id: 'repo-2',
      name: 'Qovery/values',
      url: 'https://github.com/Qovery/values',
      default_branch: 'main',
      is_private: true,
    },
  },
  valuesOverrideArgumentsData: {
    arguments: [{ type: '--set' as const, key: 'image.tag', value: 'v1' }],
  },
  helmRepositories: [{ id: 'helm-repo-1', name: 'Qovery Helm Repository' }],
  labelsGroup: [{ id: 'label-1', name: 'platform' }],
  annotationsGroup: [{ id: 'annotation-1', name: 'monitoring' }],
  onEditGeneral: jest.fn(),
  onEditValuesOverrideFile: jest.fn(),
  onEditValuesOverrideArguments: jest.fn(),
  onBack: jest.fn(),
  onSubmit: jest.fn(),
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
}

describe('HelmSummaryView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all summary sections', () => {
    renderWithProviders(<HelmSummaryView {...defaultProps} />)

    expect(screen.getByRole('heading', { name: 'Ready to create your Helm chart' })).toBeInTheDocument()
    expect(screen.getByText('General information')).toBeInTheDocument()
    expect(screen.getByText('Values override as file')).toBeInTheDocument()
    expect(screen.getByText('Values override as arguments')).toBeInTheDocument()
    expect(screen.getByText(/Qovery Helm Repository/)).toBeInTheDocument()
    expect(screen.getByText(/platform/)).toBeInTheDocument()
    expect(screen.getByText(/monitoring/)).toBeInTheDocument()
  })

  it('calls edit and submit actions', async () => {
    const { userEvent } = renderWithProviders(<HelmSummaryView {...defaultProps} />)

    await userEvent.click(screen.getByTestId('edit-general-button'))
    await userEvent.click(screen.getByTestId('edit-values-file-button'))
    await userEvent.click(screen.getByTestId('edit-values-arguments-button'))
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await userEvent.click(screen.getByTestId('button-create'))
    await userEvent.click(screen.getByTestId('button-create-deploy'))

    expect(defaultProps.onEditGeneral).toHaveBeenCalled()
    expect(defaultProps.onEditValuesOverrideFile).toHaveBeenCalled()
    expect(defaultProps.onEditValuesOverrideArguments).toHaveBeenCalled()
    expect(defaultProps.onBack).toHaveBeenCalled()
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(false)
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(true)
  })

  it('renders the empty argument state', () => {
    renderWithProviders(
      <HelmSummaryView
        {...defaultProps}
        valuesOverrideArgumentsData={{
          arguments: [],
        }}
      />
    )

    expect(screen.getByText('No argument override defined')).toBeInTheDocument()
  })
})
