import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ClusterContainerCreateContext,
  type ClusterContainerCreateContextInterface,
  defaultResourcesData,
} from '../cluster-creation-flow'
import StepKubeconfig, { type StepKubeconfigProps } from './step-kubeconfig'

const mockOnSubmit = jest.fn()
const mockSetCurrentStep = jest.fn()
const mockNavigate = jest.fn()

const mockContextValue: ClusterContainerCreateContextInterface = {
  currentStep: 2,
  setCurrentStep: mockSetCurrentStep,
  generalData: {
    name: 'test-cluster',
    cloud_provider: CloudProviderEnum.AWS,
    region: 'us-east-1',
    installation_type: 'PARTIALLY_MANAGED',
  },
  setGeneralData: jest.fn(),
  resourcesData: defaultResourcesData,
  setResourcesData: jest.fn(),
  featuresData: { vpc_mode: undefined, features: {} },
  setFeaturesData: jest.fn(),
  kubeconfigData: undefined,
  setKubeconfigData: jest.fn(),
  creationFlowUrl: '/organization/org-123/cluster/create/aws-eks-anywhere',
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <ClusterContainerCreateContext.Provider value={mockContextValue}>{children}</ClusterContainerCreateContext.Provider>
  )
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))

const defaultProps: StepKubeconfigProps = {
  onSubmit: mockOnSubmit,
}

describe('StepKubeconfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render kubeconfig step', async () => {
    renderWithProviders(<StepKubeconfig {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByText('Kubeconfig')).toBeInTheDocument()
      expect(screen.getByTestId('button-submit')).toBeInTheDocument()
    })
  })

  it('should set current step on mount', async () => {
    renderWithProviders(<StepKubeconfig {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(mockSetCurrentStep).toHaveBeenCalled()
    })
  })
})
