import { act, findAllByTestId, fireEvent, render, screen, waitFor } from '__tests__/utils/setup-jest'
import ImportEnvironmentVariableModalFeature, {
  type ImportEnvironmentVariableModalFeatureProps,
} from './import-environment-variable-modal-feature'

const envText = `
QOVERY_BUILD_TIME=hello
variable_denv=hey
`
describe('ImportEnvironmentVariableModalFeature', () => {
  const props: ImportEnvironmentVariableModalFeatureProps = {
    applicationId: '123',
    setOpen: jest.fn(),
  }

  it('should render successfully and show dropzone', async () => {
    const { baseElement } = render(<ImportEnvironmentVariableModalFeature {...props} />)

    await waitFor(async () => {
      expect(baseElement).toBeTruthy()
      expect(await screen.getByTestId('drop-input')).toBeInTheDocument()
    })
  })

  it('should read file dropped and show table of inputs', async () => {
    const { baseElement } = render(<ImportEnvironmentVariableModalFeature {...props} />)
    const inputEl = screen.getByTestId('drop-input')

    const blob = new Blob([envText])
    const file = new File([blob], 'values.json', {
      type: 'application/text',
    })

    await act(() => {
      fireEvent.change(inputEl, {
        target: {
          files: [file],
        },
      })
    })
    const formRows = await findAllByTestId(baseElement, 'form-row')
    expect(formRows).toHaveLength(2)
  })
})
