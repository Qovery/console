import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import * as organizationsDomain from '@qovery/domains/organizations/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepGeneralFeature from './step-general-feature'

const mockSetGeneralData = jest.fn()
const mockNavigate = jest.fn()

const useCloudProviderCredentialsMockSpy = jest.spyOn(organizationsDomain, 'useCloudProviderCredentials') as jest.Mock

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
  useNavigate: () => mockNavigate,
}))

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    fetchCloudProvider: () => ({
      loading: 'loaded',
      items: [],
    }),
  }
})

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
          cloud_provider: CloudProviderEnum.AWS,
          region: 'Paris',
          credentials: '000-000-000',
          credentials_name: 'my-credential',
        },
        setGeneralData: mockSetGeneralData,
      }}
    >
      <StepGeneralFeature />
    </ClusterContainerCreateContext.Provider>
  )
}

describe('StepGeneralFeature', () => {
  beforeEach(() => {
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve([
          {
            short_name: CloudProviderEnum.AWS,
            regions: [
              {
                name: 'Paris',
              },
            ],
          },
        ]),
    }))
    useCloudProviderCredentialsMockSpy.mockReturnValue({
      data: [
        {
          name: 'my-credential',
          id: '000-000-000',
        },
      ],
    })
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { userEvent } = renderWithProviders(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )

    const input = screen.getByTestId('input-name')
    await userEvent.clear(input)
    await userEvent.type(input, 'my-cluster-name')

    const button = screen.getByTestId('button-submit')
    expect(button).not.toBeDisabled()

    await userEvent.click(button)

    expect(mockSetGeneralData).toHaveBeenCalledWith({
      name: 'my-cluster-name',
      description: 'hello',
      production: false,
      cloud_provider: CloudProviderEnum.AWS,
      region: 'Paris',
      credentials: '000-000-000',
      credentials_name: 'my-credential',
    })
    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/clusters/create/resources')
  })
})
