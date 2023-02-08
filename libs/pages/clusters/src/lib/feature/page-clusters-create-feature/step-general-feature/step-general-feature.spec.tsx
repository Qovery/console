import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ReactNode } from 'react'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { ClusterContainerCreateContext } from '../page-clusters-create-feature'
import StepGeneralFeature from './step-general-feature'

const mockSetGeneralData = jest.fn()
const mockNavigate = jest.fn()
const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
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
    selectOrganizationById: () => mockOrganization,
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
          credentials: mockOrganization.credentials?.items ? mockOrganization.credentials?.items[0].id : '',
          credentials_name: mockOrganization.credentials?.items ? mockOrganization.credentials?.items[0].name : '',
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
  })
  it('should render successfully', () => {
    const { baseElement } = render(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should submit form and navigate', async () => {
    const { getByTestId } = render(
      <ContextWrapper>
        <StepGeneralFeature />
      </ContextWrapper>
    )

    await act(() => {
      const input = getByTestId('input-name')
      fireEvent.input(input, { target: { value: 'test' } })
    })

    const button = getByTestId('button-submit')
    expect(button).not.toBeDisabled()

    await act(() => {
      button.click()
    })

    expect(mockSetGeneralData).toHaveBeenCalledWith({
      name: 'test',
      description: 'hello',
      production: false,
      cloud_provider: CloudProviderEnum.AWS,
      region: 'Paris',
      credentials: mockOrganization.credentials?.items ? mockOrganization.credentials?.items[0].id : '',
      credentials_name: mockOrganization.credentials?.items ? mockOrganization.credentials?.items[0].name : '',
    })
    expect(mockNavigate).toHaveBeenCalledWith('/organization/1/clusters/create/resources')
  })
})
