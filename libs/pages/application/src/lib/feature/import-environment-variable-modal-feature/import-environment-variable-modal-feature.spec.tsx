import ImportEnvironmentVariableModalFeature, {
  ImportEnvironmentVariableModalFeatureProps,
} from './import-environment-variable-modal-feature'
import { findAllByTestId, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { configureStore } from '@reduxjs/toolkit'
import { initialRootState, rootReducer } from '@console/store/data'
import { Provider } from 'react-redux'

const envText = `
QOVERY_BUILD_TIME=hello
variable_denv=hey
`

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialRootState(),
})

describe('ImportEnvironmentVariableModalFeature', () => {
  const props: ImportEnvironmentVariableModalFeatureProps = {
    applicationId: '123',
    setOpen: jest.fn(),
  }

  it('should render successfully and show dropzone', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <ImportEnvironmentVariableModalFeature {...props} />
      </Provider>
    )

    await waitFor(async () => {
      expect(baseElement).toBeTruthy()
      expect(await screen.getByTestId('drop-input')).toBeTruthy()
    })
  })

  it('should read file dropped and show table of inputs', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <ImportEnvironmentVariableModalFeature {...props} />
      </Provider>
    )
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
