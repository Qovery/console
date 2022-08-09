import ImportEnvironmentVariableModalFeature, {
  ImportEnvironmentVariableModalFeatureProps,
} from './import-environment-variable-modal-feature'
import { findAllByTestId, fireEvent, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { render } from '__tests__/utils/setup-jest'

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
      expect(await screen.getByTestId('drop-input')).toBeTruthy()
    })
  })

  it('should read file dropped and show table of inputs', async () => {
    const { baseElement } = render(<ImportEnvironmentVariableModalFeature {...props} />)
    const inputEl = screen.getByTestId('drop-input')

    const blob = new Blob([envText])
    const file = new File([blob], 'values.json', {
      type: 'application/text',
    })

    fireEvent.change(inputEl, {
      target: {
        files: [file],
      },
    })

    await waitFor(async () => {
      const formRows = await findAllByTestId(baseElement, 'form-row')
      expect(formRows).toHaveLength(2)
    })
  })
})
