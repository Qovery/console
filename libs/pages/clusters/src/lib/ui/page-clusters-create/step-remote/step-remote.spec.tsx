import { getByDisplayValue, getByTestId, render, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { type ClusterRemoteData } from '@qovery/shared/interfaces'
import StepRemote, { type StepRemoteProps } from './step-remote'

const props: StepRemoteProps = {
  onSubmit: jest.fn((e) => e.preventDefault()),
}

describe('StepRemote', () => {
  let defaultValues: ClusterRemoteData

  beforeEach(() => {
    defaultValues = {
      ssh_key: 'ssh_key dslkjsdflkjsdflksjdf',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(
      wrapWithReactHookForm<ClusterRemoteData>(<StepRemote {...props} />, {
        defaultValues,
      })
    )
    expect(baseElement).toBeTruthy()
    getByDisplayValue(baseElement, 'ssh_key dslkjsdflkjsdflksjdf')
  })

  it('should submit the form', async () => {
    props.onSubmit = jest.fn((e) => e.preventDefault())
    const { baseElement } = render(
      wrapWithReactHookForm<ClusterRemoteData>(<StepRemote {...props} />, {
        defaultValues,
      })
    )
    const button = getByTestId(baseElement, 'button-submit')
    await waitFor(() => {
      button.click()
      expect(props.onSubmit).toHaveBeenCalled()
    })
  })
})
