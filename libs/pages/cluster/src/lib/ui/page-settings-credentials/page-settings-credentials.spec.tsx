import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { credentialsMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsCredentials, { type PageSettingsCredentialsProps } from './page-settings-credentials'

const mockCredentials = credentialsMock(2)
const useCloudProviderCredentialsMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderCredentials') as jest.Mock

describe('PageSettingsCredentials', () => {
  const props: PageSettingsCredentialsProps = {
    onSubmit: jest.fn((e) => e.preventDefault()),
    cloudProvider: CloudProviderEnum.AWS,
    loading: false,
  }

  const defaultValues = {
    credentials: mockCredentials[0].id,
  }

  beforeEach(() => {
    useCloudProviderCredentialsMockSpy.mockReturnValue({
      data: mockCredentials,
      isLoading: false,
    })
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<PageSettingsCredentials {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsCredentials {...props} />, {
        defaultValues,
      })
    )

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
