import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ClusterContainerCreateContext,
  type ClusterContainerCreateContextInterface,
  defaultResourcesData,
} from '../cluster-creation-flow'
import StepResources, { type StepResourcesProps } from './step-resources'

const mockOnSubmit = jest.fn()
const mockSetCurrentStep = jest.fn()

const mockContextValue: ClusterContainerCreateContextInterface = {
  currentStep: 2,
  setCurrentStep: mockSetCurrentStep,
  generalData: {
    name: 'test-cluster',
    cloud_provider: CloudProviderEnum.AWS,
    region: 'us-east-1',
    installation_type: 'MANAGED',
  },
  setGeneralData: jest.fn(),
  resourcesData: defaultResourcesData,
  setResourcesData: jest.fn(),
  featuresData: { vpc_mode: undefined, features: {} },
  setFeaturesData: jest.fn(),
  kubeconfigData: undefined,
  setKubeconfigData: jest.fn(),
  creationFlowUrl: '/organization/org-123/cluster/create/aws',
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <ClusterContainerCreateContext.Provider value={mockContextValue}>{children}</ClusterContainerCreateContext.Provider>
  )
}

jest.mock('@qovery/domains/cloud-providers/feature', () => ({
  ...jest.requireActual('@qovery/domains/cloud-providers/feature'),
  useCloudProviderInstanceTypes: () => ({ data: [] }),
  useCloudProviderInstanceTypesKarpenter: () => ({ data: [] }),
}))

jest.mock('../../cluster-resources-settings/cluster-resources-settings', () => ({
  ClusterResourcesSettings: () => <div data-testid="cluster-resources-settings">Mocked ClusterResourcesSettings</div>,
}))

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: jest.fn(),
    closeModal: jest.fn(),
  }),
}))

jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useParams: () => ({ organizationId: 'org-123', slug: 'aws' }),
    useRouterState: () => ({ location: { pathname: '/' } }),
    useRouter: () => ({ buildLocation: jest.fn(() => ({ href: '/' })) }),
    Link: React.forwardRef(
      ({ children, ...props }: { children?: React.ReactNode }, ref: React.Ref<HTMLAnchorElement>) =>
        React.createElement('a', { ref, ...props }, children)
    ),
  }
})

const defaultProps: StepResourcesProps = {
  organizationId: 'org-123',
  onSubmit: mockOnSubmit,
}

describe('StepResources', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render resources form', async () => {
    renderWithProviders(<StepResources {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByText('Resources')).toBeInTheDocument()
      expect(screen.getByTestId('button-submit')).toBeInTheDocument()
    })
  })

  it('should set current step on mount', async () => {
    renderWithProviders(<StepResources {...defaultProps} />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(mockSetCurrentStep).toHaveBeenCalled()
    })
  })
})
