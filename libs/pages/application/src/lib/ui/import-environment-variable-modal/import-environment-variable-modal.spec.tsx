import { act, findAllByTestId, fireEvent, getByTestId, render, screen, waitFor } from '__tests__/utils/setup-jest'
import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { jsonToForm } from '../../feature/import-environment-variable-modal-feature/utils/file-to-form'
import ImportEnvironmentVariableModal, {
  type ImportEnvironmentVariableModalProps,
} from './import-environment-variable-modal'

describe('ImportEnvironmentVariableModal', () => {
  const props: ImportEnvironmentVariableModalProps = {
    onSubmit: jest.fn(),
    closeModal: jest.fn(),
    triggerToggleAll: jest.fn(),
    toggleAll: false,
    showDropzone: false,
    dropzoneGetInputProps: jest.fn(),
    dropzoneGetRootProps: jest.fn(),
    dropzoneIsDragActive: false,
    existingVars: [],
  }

  it('should render successfully', async () => {
    const { baseElement } = render(wrapWithReactHookForm(<ImportEnvironmentVariableModal {...props} />))

    await waitFor(() => {
      expect(baseElement).toBeTruthy()
    })
  })

  describe('with a lot of entries', function () {
    it('should loop and print forms line', async () => {
      const json = JSON.stringify({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
        keyEmpty: '',
      })
      const defaultValues = jsonToForm(json)
      props.keys = Object.keys(JSON.parse(json))

      const { baseElement } = render(
        wrapWithReactHookForm(<ImportEnvironmentVariableModal {...props} />, { defaultValues })
      )

      const formRows = await findAllByTestId(baseElement, 'form-row')
      await waitFor(() => {
        expect(formRows).toHaveLength(props.keys.length)
      })
    })
  })

  describe('with only one entry', () => {
    const json = JSON.stringify({
      key1: 'value1',
    })
    const defaultValues = jsonToForm(json)

    beforeEach(() => {
      props.keys = Object.keys(JSON.parse(json))
    })

    it('should render row with correct form inputs', async () => {
      const { baseElement } = render(
        wrapWithReactHookForm(<ImportEnvironmentVariableModal {...props} />, { defaultValues })
      )

      await waitFor(async () => {
        const formRows = await findAllByTestId(baseElement, 'form-row')
        expect(formRows[0].querySelectorAll('input')).toHaveLength(3)
        expect(formRows[0].querySelectorAll('select')).toHaveLength(1)
        expect(formRows[0].querySelectorAll('[data-testid="input-toggle"]')).toHaveLength(1)
      })
    })

    it('should disabled button if form is not well filled up', async () => {
      const { baseElement } = render(
        wrapWithReactHookForm(<ImportEnvironmentVariableModal {...props} />, { defaultValues })
      )

      await act(() => {
        const input = screen.getByLabelText('key1_key')
        fireEvent.input(input, { target: { value: 'asdfasf' } })
      })

      await act(() => {
        const input = screen.getByLabelText('key1_key')
        fireEvent.input(input, { target: { value: '' } })
      })

      await waitFor(() => {
        const warningIcon = screen.getByTestId('warning-icon-left')
        expect(warningIcon).toBeInTheDocument()
      })

      await waitFor(async () => {
        const button = await getByTestId(baseElement, 'submit-button')
        expect(button).toBeDisabled()
      })
    })

    it('should close the modal on cancel', async () => {
      const spy = jest.fn()
      render(wrapWithReactHookForm(<ImportEnvironmentVariableModal {...props} closeModal={spy} />, { defaultValues }))

      await act(() => {
        screen.getByRole('button', { name: 'Cancel' }).click()
      })

      expect(spy).toHaveBeenCalled()
    })

    it('should change the scope for all on select change', async () => {
      const spy = jest.fn()
      render(
        wrapWithReactHookForm(<ImportEnvironmentVariableModal {...props} changeScopeForAll={spy} />, { defaultValues })
      )

      await act(() => {
        const select = screen.getByTestId('select-scope-for-all')
        fireEvent.change(select, { target: { value: APIVariableScopeEnum.PROJECT } })
      })

      expect(spy).toHaveBeenCalledWith(APIVariableScopeEnum.PROJECT)
    })

    it('should toggle all on click on secret toggle', async () => {
      const spy = jest.fn()
      render(
        wrapWithReactHookForm(<ImportEnvironmentVariableModal {...props} triggerToggleAll={spy} toggleAll={true} />, {
          defaultValues,
        })
      )

      await act(() => {
        const toggle = screen.getByTestId('toggle-for-all')
        fireEvent.click(toggle)
      })

      expect(spy).toHaveBeenCalledWith(false)
    })

    it('should show a warning icon if variable name begins with QOVERY', async () => {
      const json = JSON.stringify({
        key1: 'value1',
      })
      const defaultValues = jsonToForm(json)
      props.keys = Object.keys(JSON.parse(json))

      render(wrapWithReactHookForm(<ImportEnvironmentVariableModal {...props} />, { defaultValues }))

      await act(() => {
        const input = screen.getByLabelText('key1_key')
        fireEvent.input(input, { target: { value: 'QOVERY_OIUSOD' } })
      })

      await waitFor(() => {
        const warningIcon = screen.getByTestId('warning-icon-left')
        expect(warningIcon).toBeInTheDocument()
      })
    })
  })

  describe('dropzone test', () => {
    beforeEach(() => {
      props.showDropzone = true
    })

    it('should render dropzone', async () => {
      const defaultValues = {}
      render(wrapWithReactHookForm(<ImportEnvironmentVariableModal {...props} />, { defaultValues }))
      expect(await screen.getByTestId('drop-input')).toBeInTheDocument()
    })
  })
})
