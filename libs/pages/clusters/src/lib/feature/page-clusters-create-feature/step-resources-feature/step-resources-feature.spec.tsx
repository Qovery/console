import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepResourcesFeature from './step-resources-feature'

const useCloudProviderInstanceTypesMockSpy = jest.spyOn(
  cloudProvidersDomain,
  'useCloudProviderInstanceTypes'
) as jest.Mock

const mockInstanceType = [
  {
    name: 't2.micro',
    cpu: 1,
    ram_in_gb: 1,
    type: 't2.micro',
    architecture: 'arm64',
  },
  {
    name: 't2.small',
    cpu: 1,
    ram_in_gb: 2,
    type: 't2.small',
    architecture: 'arm64',
  },
  {
    name: 't2.medium',
    cpu: 2,
    ram_in_gb: 4,
    type: 't2.medium',
    architecture: 'x86_64',
  },
]

const mockSetResourceData = jest.fn()

const ContextWrapper = (props: { children: ReactNode }) => {
  return (
    <ClusterContainerCreateContext.Provider
      value={{
        currentStep: 1,
        setCurrentStep: jest.fn(),
        generalData: {
          name: 'test',
          description: 'hello',
          production: false,
          region: 'us-east-1',
          cloud_provider: CloudProviderEnum.AWS,
          credentials: '1',
          credentials_name: 'name',
          installation_type: 'MANAGED',
        },
        setGeneralData: jest.fn(),
        setResourcesData: mockSetResourceData,
        resourcesData: {
          instance_type: 't2.medium',
          cluster_type: 'MANAGED',
          nodes: [1, 3],
          karpenter: {
            enabled: false,
          },
        },
        featuresData: undefined,
        setFeaturesData: jest.fn(),
      }}
    >
      {props.children}
    </ClusterContainerCreateContext.Provider>
  )
}

describe('StepResourcesFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCloudProviderInstanceTypesMockSpy.mockReturnValue({
      data: mockInstanceType,
    })
  })

  it('should submit form and navigate', async () => {
    renderWithProviders(
      <ContextWrapper>
        <StepResourcesFeature />
      </ContextWrapper>
    )

    const select = screen.getByLabelText('Instance type')
    await selectEvent.select(select, 't2.small (1CPU - 2GB RAM - arm64)', {
      container: document.body,
    })

    const button = screen.getByTestId('button-submit')
    button.click()

    await waitFor(() => {
      expect(button).toBeEnabled()
      expect(mockSetResourceData).toHaveBeenCalledWith({
        instance_type: 't2.small',
        cluster_type: 'MANAGED',
        nodes: [1, 3],
        karpenter: {
          enabled: false,
        },
      })
    })
  })
})
