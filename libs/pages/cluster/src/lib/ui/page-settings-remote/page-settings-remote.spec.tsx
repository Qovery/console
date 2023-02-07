import { getByDisplayValue, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { ClusterRemoteData } from '@qovery/shared/interfaces'
import PageSettingsRemote, { PageSettingsRemoteProps } from './page-settings-remote'

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
    const { baseElement } = render(
      wrapWithReactHookForm<ClusterRemoteData>(<PageSettingsRemote {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
    getByDisplayValue(baseElement, 'ssh key')
  })

  it('should submit the form', async () => {
    props.onSubmit = jest.fn((e) => e.preventDefault())
    const { getByTestId } = render(
      wrapWithReactHookForm<ClusterRemoteData>(<PageSettingsRemote {...props} />, {
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
