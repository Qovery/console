import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ClusterCredentialsSettingsFeature, {
  type ClusterCredentialsSettingsFeatureProps,
} from './cluster-credentials-settings-feature'

const useCloudProviderCredentialsMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderCredentials') as jest.Mock

const props: ClusterCredentialsSettingsFeatureProps = {
  cloudProvider: CloudProviderEnum.AWS,
}

describe('ClusterCredentialsSettingsFeature', () => {
  beforeEach(() => {
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
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<ClusterCredentialsSettingsFeature {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form on click', async () => {
    renderWithProviders(
      wrapWithReactHookForm(<ClusterCredentialsSettingsFeature {...props} />, {
        defaultValues: {
          credentials: '0',
        },
      })
    )

    const realSelect = screen.getByLabelText('Credentials')
    await selectEvent.select(realSelect, ['my-credential'])

    screen.getByTestId('input-credentials')
    // using getAllByDisplay because we have two inputs on the input-select when we use the search
    expect(screen.getAllByDisplayValue('000-000-000')).toHaveLength(2)
  })
})
