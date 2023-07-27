import { act, render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { organizationFactoryMock } from '@qovery/shared/factories'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import ClusterCredentialsSettingsFeature, {
  ClusterCredentialsSettingsFeatureProps,
} from './cluster-credentials-settings-feature'

const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]

jest.mock('@qovery/domains/organization', () => {
  return {
    ...jest.requireActual('@qovery/domains/organization'),
    selectOrganizationById: () => mockOrganization,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('ClusterCredentialsSettingsFeature', () => {
  const props: ClusterCredentialsSettingsFeatureProps = {
    cloudProvider: CloudProviderEnum.AWS,
  }

  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ClusterCredentialsSettingsFeature {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { getByTestId, getAllByDisplayValue, getByLabelText } = render(
      wrapWithReactHookForm(<ClusterCredentialsSettingsFeature {...props} />, {
        defaultValues: {
          credentials: '0',
        },
      })
    )

    const realSelect = getByLabelText('Credentials')
    await selectEvent.select(realSelect, [
      (mockOrganization.credentials?.items && mockOrganization.credentials?.items[1].name) || '',
    ])

    getByTestId('input-credentials')
    // using getAllByDisplay because we have two inputs on the input-select when we use the search
    expect(getAllByDisplayValue('1')).toHaveLength(2)
  })
})
