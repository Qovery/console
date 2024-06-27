import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { credentialsMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsGeneral, { type PageSettingsCredentialsProps } from './page-settings-credentials'

const mockCredentials = credentialsMock(2)

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
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<PageSettingsGeneral {...props} />))
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues,
      })
    )

    const button = screen.getByTestId('submit-button')
    await userEvent.click(button)
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
