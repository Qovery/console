import { render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { credentialsMock } from '@qovery/shared/factories'
import { type ClusterCredentialsEntity } from '@qovery/shared/interfaces'
import PageSettingsGeneral, { type PageSettingsCredentialsProps } from './page-settings-credentials'

const mockCredentials: ClusterCredentialsEntity[] = credentialsMock(2)

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

  it('should submit the form', async () => {
    const { getByTestId } = render(
      wrapWithReactHookForm(<PageSettingsGeneral {...props} />, {
        defaultValues,
      })
    )

    const button = getByTestId('submit-button')

    await waitFor(() => {
      button.click()
      expect(props.onSubmit).toHaveBeenCalled()
    })
  })
})
