import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ClusterGeneralData } from '@qovery/shared/interfaces'
import ClusterCredentialsSettingsFeature, { ClusterCredentialsSettingsFeatureProps } from './cluster-general-settings'

// const mockOrganization: OrganizationEntity = organizationFactoryMock(1)[0]

// jest.mock('@qovery/domains/organization', () => {
//   return {
//     ...jest.requireActual('@qovery/domains/organization'),
//     // getOrganizationsState: () => ({
//     //   loadingStatus: 'loaded',
//     //   ids: [mockOrganization.id],
//     //   entities: {
//     //     [mockOrganization.id]: mockOrganization,
//     //   },
//     //   error: null,
//     // }),
//     selectOrganizationById: () => mockOrganization,
//     // fetchCloudProvider: () => ({
//     //   loading: 'loaded',
//     //   items: [],
//     // }),
//     fetchCredentialsList: () => [
//       {
//         id: '1',
//         name: 'credential',
//       },
//     ],
//   }
// })

describe('ClusterCredentialsSettingsFeature', () => {
  const props: ClusterCredentialsSettingsFeatureProps = {
    fromDetail: false,
  }
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<ClusterCredentialsSettingsFeature {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm<ClusterGeneralData>(<ClusterCredentialsSettingsFeature {...props} />, {
        defaultValues: {
          name: 'test',
        },
      })
    )

    const name = getByTestId('input-name')
    const description = getByTestId('input-description')
    const toggle = getByTestId('input-production-toggle')

    expect((name as HTMLInputElement).value).toBe('test')
    expect((description.querySelector('textarea') as HTMLTextAreaElement).value).toBe('test')
    expect((toggle.querySelector('input') as HTMLInputElement).value).toBe('false')
  })
})
