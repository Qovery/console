import { waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { clusterFactoryMock, credentialsMock, organizationFactoryMock } from '@qovery/shared/factories'
import { ClusterCredentialsEntity, ClusterEntity, OrganizationEntity } from '@qovery/shared/interfaces'
import PageSettingsGeneral, { PageSettingsCredentialsProps } from './page-settings-credentials'

const mockCluster: ClusterEntity = clusterFactoryMock(1, CloudProviderEnum.AWS)[0]
const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]
const mockCredentials: ClusterCredentialsEntity[] = credentialsMock(2)

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    getClusterState: () => ({
      loadingStatus: 'loaded',
      ids: [mockCluster.id],
      entities: {
        [mockCluster.id]: mockCluster,
      },
      error: null,
    }),
    selectClusterById: () => mockCluster,
    getOrganizationsState: () => ({
      loadingStatus: 'loaded',
      ids: [mockOrganization.id],
      entities: {
        [mockOrganization.id]: mockOrganization,
      },
      error: null,
    }),
    selectOrganizationById: () => mockOrganization,
    fetchCredentialsList: () => mockCredentials,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ organizationId: '0', clusterId: mockCluster.id }),
}))

describe('PageSettingsGeneral', () => {
  const props: PageSettingsCredentialsProps = {
    onSubmit: jest.fn((e) => e.preventDefault()),
    cloudProvider: CloudProviderEnum.AWS,
    loading: false,
  }

  const defaultValues = {
    credentials: mockCredentials[0].id,
  }

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should render the form with fields', async () => {
    const { getAllByDisplayValue } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    // using all because we have two inputs with the input select "search"
    getAllByDisplayValue('0')
  })

  it('should submit the form', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues: defaultValues,
      })
    )

    const button = getByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(props.onSubmit).toHaveBeenCalled()
    })
  })
})
