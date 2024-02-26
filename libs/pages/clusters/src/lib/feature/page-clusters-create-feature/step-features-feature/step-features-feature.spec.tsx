import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepFeaturesFeature from './step-features-feature'

const mockSetFeaturesData = jest.fn()
const mockNavigate = jest.fn()

const mockFeatures = [
  {
    id: 'STATIC_IP',
    title: 'feature-1',
    cost_per_month: 23,
    value: 'my-value',
    accepted_values: ['test', 'my-value'],
  },
  {
    id: 'CUSTOM_VPC',
    title: 'feature-2',
    cost_per_month: 23,
    value: 'my-value',
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
        remoteData: undefined,
        setRemoteData: jest.fn(),
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
    const { userEvent, baseElement, debug } = renderWithProviders(
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
    expect(button).not.toBeDisabled()
    await userEvent.click(button)

    const STATIC_IP = 'STATIC_IP'

    expect(mockSetFeaturesData).toHaveBeenCalledWith({
      vpc_mode: 'DEFAULT',
      features: {
        [STATIC_IP]: {
          title: 'feature-1',
          value: true,
          extendedValue: 'test',
        },
      },
    })

    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/clusters/create/summary')
  })
})
