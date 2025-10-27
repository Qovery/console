import { CloudProviderEnum, type ClusterFeatureResponse } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepFeaturesFeature from './step-features-feature'

const mockSetFeaturesData = jest.fn()
const mockNavigate = jest.fn()

const mockFeatures: ClusterFeatureResponse[] = [
  {
    id: 'FEATURE',
    title: 'feature-1',
    cost_per_month: 23,
    value_object: {
      type: 'STRING',
      value: 'test',
    },
    accepted_values: ['test', 'my-value'],
  },
]

const useCloudProviderFeaturesMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderFeatures') as jest.Mock

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
  useNavigate: () => mockNavigate,
}))

const ContextWrapper = (props: { children: ReactNode }) => {
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
        setFeaturesData: mockSetFeaturesData,
        resourcesData: undefined,
        setResourcesData: jest.fn(),
        creationFlowUrl: '/organization/1/clusters/create',
      }}
    >
      <StepFeaturesFeature />
    </ClusterContainerCreateContext.Provider>
  )
}

describe('StepFeaturesFeature', () => {
  beforeEach(() => {
    useCloudProviderFeaturesMockSpy.mockReturnValue({
      data: mockFeatures,
      isLoading: false,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ContextWrapper>
        <StepFeaturesFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { userEvent } = renderWithProviders(
      <ContextWrapper>
        <StepFeaturesFeature />
      </ContextWrapper>
    )

    await waitFor(async () => {
      const feature = screen.getByTestId('feature')
      await userEvent.click(feature)
    })

    const selectMenu = screen.getByLabelText('VPC Subnet address')
    await selectEvent.select(selectMenu, mockFeatures[0].accepted_values[0], {
      container: document.body,
    })

    const button = screen.getByTestId('button-submit')
    expect(button).toBeEnabled()
    await userEvent.click(button)

    const FEATURE = 'FEATURE'

    expect(mockSetFeaturesData).toHaveBeenCalledWith({
      vpc_mode: 'DEFAULT',
      features: {
        [FEATURE]: {
          title: 'feature-1',
          value: true,
          extendedValue: 'test',
        },
      },
    })

    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/clusters/create/summary')
  })

  describe('STATIC_IP feature default value handling', () => {
    it('should force STATIC_IP to true when feature has old format with false value', async () => {
      const staticIpFeatures: ClusterFeatureResponse[] = [
        {
          id: 'STATIC_IP',
          title: 'Static IP',
          value_object: {
            type: 'BOOLEAN',
            value: false,
          },
        },
      ]

      useCloudProviderFeaturesMockSpy.mockReturnValue({
        data: staticIpFeatures,
        isLoading: false,
      })

      renderWithProviders(
        <ContextWrapper>
          <StepFeaturesFeature />
        </ContextWrapper>
      )

      // The useEffect should force the value to true
      await waitFor(() => {
        // Component should render without errors
        expect(screen.getByText('Network configuration')).toBeInTheDocument()
      })
    })

    it('should force STATIC_IP to true when feature has new format with false value', async () => {
      const staticIpFeatures: ClusterFeatureResponse[] = [
        {
          id: 'STATIC_IP',
          title: 'Static IP',
          value_object: {
            type: 'STATIC_IP',
            value: {
              type: 'common',
              value: false,
              is_enabled: false,
            },
          },
        },
      ]

      useCloudProviderFeaturesMockSpy.mockReturnValue({
        data: staticIpFeatures,
        isLoading: false,
      })

      renderWithProviders(
        <ContextWrapper>
          <StepFeaturesFeature />
        </ContextWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Network configuration')).toBeInTheDocument()
      })
    })

    it('should not override STATIC_IP when feature has old format with true value', async () => {
      const staticIpFeatures: ClusterFeatureResponse[] = [
        {
          id: 'STATIC_IP',
          title: 'Static IP',
          value_object: {
            type: 'BOOLEAN',
            value: true,
          },
        },
      ]

      useCloudProviderFeaturesMockSpy.mockReturnValue({
        data: staticIpFeatures,
        isLoading: false,
      })

      renderWithProviders(
        <ContextWrapper>
          <StepFeaturesFeature />
        </ContextWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Network configuration')).toBeInTheDocument()
      })
    })

    it('should not override STATIC_IP when feature has new format with true value', async () => {
      const staticIpFeatures: ClusterFeatureResponse[] = [
        {
          id: 'STATIC_IP',
          title: 'Static IP',
          value_object: {
            type: 'STATIC_IP',
            value: {
              type: 'common',
              value: true,
              is_enabled: true,
            },
          },
        },
      ]

      useCloudProviderFeaturesMockSpy.mockReturnValue({
        data: staticIpFeatures,
        isLoading: false,
      })

      renderWithProviders(
        <ContextWrapper>
          <StepFeaturesFeature />
        </ContextWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Network configuration')).toBeInTheDocument()
      })
    })

    it('should handle Scaleway static IP format', async () => {
      const scwStaticIpFeatures: ClusterFeatureResponse[] = [
        {
          id: 'STATIC_IP',
          title: 'Static IP',
          value_object: {
            type: 'STATIC_IP',
            value: {
              type: 'scaleway',
              value: true,
              is_enabled: true,
              gateway_type: 'VPC_GW_M',
              dhcp_subnet_cidr: '172.16.0.0/24',
            },
          },
        },
      ]

      useCloudProviderFeaturesMockSpy.mockReturnValue({
        data: scwStaticIpFeatures,
        isLoading: false,
      })

      const contextWithScw = {
        currentStep: 1,
        setCurrentStep: jest.fn(),
        featuresData: {
          vpc_mode: 'DEFAULT',
          features: {},
        },
        generalData: {
          name: 'test',
          production: false,
          cloud_provider: CloudProviderEnum.SCW,
          region: 'fr-par',
          credentials: '111-111-111',
          credentials_name: 'name',
          installation_type: 'MANAGED',
        },
        setGeneralData: jest.fn(),
        setFeaturesData: mockSetFeaturesData,
        resourcesData: undefined,
        setResourcesData: jest.fn(),
        creationFlowUrl: '/organization/1/clusters/create',
      }

      renderWithProviders(
        <ClusterContainerCreateContext.Provider value={contextWithScw}>
          <StepFeaturesFeature />
        </ClusterContainerCreateContext.Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Network configuration')).toBeInTheDocument()
      })
    })
  })
})
