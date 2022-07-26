import ImportEnvironmentVariableModalFeature, {
  ImportEnvironmentVariableModalFeatureProps,
} from './import-environment-variable-modal-feature'
import { findAllByTestId, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

const envVariableFile = {
  key1: 'value1',
  key2: 'value2',
  key3: 'value3',
}

describe('ImportEnvironmentVariableModalFeature', () => {
  const props: ImportEnvironmentVariableModalFeatureProps = {
    applicationId: '123',
    setOpen: jest.fn(),
  }

  it('should render successfully', async () => {
    const { baseElement, debug } = render(<ImportEnvironmentVariableModalFeature {...props} />)

    await waitFor(() => {
      expect(baseElement).toBeTruthy()
      debug()
    })
  })

  it('should read file dropped and show table of inputs', async () => {
    const { baseElement } = render(<ImportEnvironmentVariableModalFeature {...props} />)
    const inputEl = screen.getByTestId('drop-input')
    const str = JSON.stringify(envVariableFile)
    const blob = new Blob([str])
    const file = new File([blob], 'values.json', {
      type: 'application/JSON',
    })

    fireEvent.change(inputEl, {
      target: {
        files: [file],
      },
    })

    await waitFor(async () => {
      const formRows = await findAllByTestId(baseElement, 'form-row')
      expect(formRows).toHaveLength(Object.keys(envVariableFile).length)
    })
  })
})
