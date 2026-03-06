import { CloudProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { defaultResourcesData } from '../cluster-creation-flow'
import { StepSummaryPresentation, type StepSummaryPresentationProps } from './step-summary-presentation'

const mockOnSubmit = jest.fn()
const mockOnPrevious = jest.fn()
const mockGoToFeatures = jest.fn()
const mockGoToResources = jest.fn()
const mockGoToKubeconfig = jest.fn()
const mockGoToEksConfig = jest.fn()
const mockGoToGeneral = jest.fn()

const defaultProps: StepSummaryPresentationProps = {
  onSubmit: mockOnSubmit,
  onPrevious: mockOnPrevious,
  goToFeatures: mockGoToFeatures,
  goToResources: mockGoToResources,
  goToKubeconfig: mockGoToKubeconfig,
  goToEksConfig: mockGoToEksConfig,
  goToGeneral: mockGoToGeneral,
  isLoadingCreate: false,
  isLoadingCreateAndDeploy: false,
  generalData: {
    name: 'test-cluster',
    cloud_provider: CloudProviderEnum.AWS,
    region: 'us-east-1',
    installation_type: 'MANAGED',
    production: false,
  },
  resourcesData: {
    ...defaultResourcesData,
    instance_type: 't3.medium',
  },
  featuresData: { vpc_mode: 'DEFAULT', features: {} },
  kubeconfigData: undefined,
  detailInstanceType: {
    type: 't3.medium',
    name: 't3.medium',
    cpu: 2,
    ram_in_gb: 4,
    architecture: 'x86_64',
  },
}

describe('StepSummaryPresentation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render summary blocks and action buttons', () => {
    renderWithProviders(<StepSummaryPresentation {...defaultProps} />)

    expect(screen.getByText('Ready to install your cluster')).toBeInTheDocument()
    expect(screen.getByTestId('summary-general')).toBeInTheDocument()
    expect(screen.getByTestId('summary-resources')).toBeInTheDocument()
    expect(screen.getByTestId('button-create')).toBeInTheDocument()
    expect(screen.getByTestId('button-create-deploy')).toBeInTheDocument()
  })

  it('should trigger callbacks for Back/Create/Create and install', async () => {
    const { userEvent } = renderWithProviders(<StepSummaryPresentation {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await userEvent.click(screen.getByTestId('button-create'))
    await userEvent.click(screen.getByTestId('button-create-deploy'))

    expect(mockOnPrevious).toHaveBeenCalledTimes(1)
    expect(mockOnSubmit).toHaveBeenNthCalledWith(1, false)
    expect(mockOnSubmit).toHaveBeenNthCalledWith(2, true)
  })
})
