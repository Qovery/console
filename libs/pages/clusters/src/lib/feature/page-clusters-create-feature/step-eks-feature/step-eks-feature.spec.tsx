import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import { StepEKSFeature } from './step-eks-feature'

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <ClusterContainerCreateContext.Provider
      value={{
        currentStep: 1,
        setCurrentStep: jest.fn(),
        featuresData: {
          vpc_mode: 'DEFAULT',
          features: {},
        },
        generalData: {
          name: 'test',
          production: false,
          cloud_provider: CloudProviderEnum.AWS,
          region: 'Paris',
          credentials: '111-111-111',
          credentials_name: 'name',
          installation_type: 'MANAGED',
        },
        setGeneralData: jest.fn(),
        setFeaturesData: jest.fn(),
        resourcesData: undefined,
        setResourcesData: jest.fn(),
        creationFlowUrl: '/organization/1/clusters/create',
        kubeconfigData: undefined,
        setKubeconfigData: jest.fn(),
      }}
    >
      {children}
    </ClusterContainerCreateContext.Provider>
  )
}

const render = (component: ReactNode) => {
  return renderWithProviders(<ContextWrapper>{component}</ContextWrapper>)
}

describe('StepEKSFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StepEKSFeature />)
    expect(baseElement).toBeTruthy()
    expect(screen.getByText('EKS configuration')).toBeInTheDocument()
    const submitButton = baseElement.querySelector('button[type="submit"]')
    expect(submitButton).toBeInTheDocument()
    expect(submitButton?.textContent).toBe('Continue')
    const backButton = baseElement.querySelector('button[type="button"]')
    expect(backButton).toBeInTheDocument()
    expect(backButton?.textContent).toBe('Back')
  })
})
