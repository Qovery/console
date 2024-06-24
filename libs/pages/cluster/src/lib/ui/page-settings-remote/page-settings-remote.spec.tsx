import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type ClusterRemoteData } from '@qovery/shared/interfaces'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsRemote, { type PageSettingsRemoteProps } from './page-settings-remote'

const props: PageSettingsRemoteProps = {
  loading: false,
  onSubmit: jest.fn((e) => e.preventDefault()),
}

describe('PageSettingsRemote', () => {
  let defaultValues: ClusterRemoteData

  beforeEach(() => {
    defaultValues = {
      ssh_key: 'ssh key',
    }
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      wrapWithReactHookForm<ClusterRemoteData>(<PageSettingsRemote {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
    screen.getByDisplayValue('ssh key')
  })

  it('should submit the form', async () => {
    props.onSubmit = jest.fn((e) => e.preventDefault())
    const { userEvent } = renderWithProviders(
      wrapWithReactHookForm<ClusterRemoteData>(<PageSettingsRemote {...props} />, {
        defaultValues,
      })
    )

    const button = screen.getByTestId('submit-button')

    await userEvent.click(button)
    expect(props.onSubmit).toHaveBeenCalled()
  })
})
