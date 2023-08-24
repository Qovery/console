import {
  act,
  fireEvent,
  getByLabelText,
  getByRole,
  getByText,
  queryByLabelText,
  render,
  screen,
  waitFor,
} from '__tests__/utils/setup-jest'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import {
  type DataFormEnvironmentVariableInterface,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../../feature/crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'
import CrudEnvironmentVariableModal, { type CrudEnvironmentVariableModalProps } from './crud-environment-variable-modal'

const props: CrudEnvironmentVariableModalProps = {
  mode: EnvironmentVariableCrudMode.CREATION,
  title: 'Create Environment Variable',
  description: 'Create an environment variable.',
  onSubmit: jest.fn(),
  availableScopes: [APIVariableScopeEnum.ENVIRONMENT, APIVariableScopeEnum.PROJECT],
  setOpen: jest.fn(),
  type: EnvironmentVariableType.NORMAL,
  isFile: false,
}

const WrapperForm = ({ children }) => {
  const methods = useForm<DataFormEnvironmentVariableInterface>({
    defaultValues: {
      key: 'asdasd',
      scope: APIVariableScopeEnum.PROJECT,
      value: 'asdas',
      isSecret: false,
    },
    mode: 'all',
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('CrudEnvironmentVariableModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <WrapperForm>
        <CrudEnvironmentVariableModal {...props} />
      </WrapperForm>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should display variable near the checkbox', async () => {
    props.mode = EnvironmentVariableCrudMode.CREATION
    props.type = EnvironmentVariableType.NORMAL
    const { baseElement } = render(
      <WrapperForm>
        <CrudEnvironmentVariableModal {...props} />
      </WrapperForm>
    )
    getByText(baseElement, 'Secret variable')
  })

  it('should render correct input for normal variable', () => {
    const { baseElement } = render(
      <WrapperForm>
        <CrudEnvironmentVariableModal
          {...props}
          mode={EnvironmentVariableCrudMode.CREATION}
          type={EnvironmentVariableType.NORMAL}
        />
      </WrapperForm>
    )
    getByLabelText(baseElement, 'Variable')
    getByLabelText(baseElement, 'Value')
    getByLabelText(baseElement, 'Scope')
  })

  it('should render correct input for alias variable', () => {
    const { baseElement } = render(
      <WrapperForm>
        <CrudEnvironmentVariableModal
          {...props}
          mode={EnvironmentVariableCrudMode.CREATION}
          type={EnvironmentVariableType.ALIAS}
        />
      </WrapperForm>
    )
    getByLabelText(baseElement, 'Variable')
    getByLabelText(baseElement, 'New variable')
    getByLabelText(baseElement, 'Scope')

    expect(queryByLabelText(baseElement, 'Value')).toBeNull()
  })

  it('should render correct input for override variable', () => {
    const { baseElement } = render(
      <WrapperForm>
        <CrudEnvironmentVariableModal
          {...props}
          mode={EnvironmentVariableCrudMode.CREATION}
          type={EnvironmentVariableType.OVERRIDE}
        />
      </WrapperForm>
    )
    getByLabelText(baseElement, 'Variable')
    getByLabelText(baseElement, 'Value')
    getByLabelText(baseElement, 'Scope')

    expect(queryByLabelText(baseElement, 'New value')).toBeNull()
  })

  it('should close on cancel', async () => {
    const spy = jest.fn()
    props.closeModal = spy
    render(
      <WrapperForm>
        <CrudEnvironmentVariableModal {...props} />
      </WrapperForm>
    )

    await act(() => {
      const button = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(button)
    })

    expect(spy).toBeCalled()
  })

  describe('for file variable type', () => {
    beforeEach(() => {
      props.isFile = true
    })

    it('should display mount value field enabled for creation', async () => {
      props.mode = EnvironmentVariableCrudMode.CREATION

      const { baseElement } = render(
        <WrapperForm>
          <CrudEnvironmentVariableModal {...props} />
        </WrapperForm>
      )

      const input = getByLabelText(baseElement, 'Path')
      expect(input).toBeEnabled()
    })

    it('should display mount value field disabled for edition and normal', async () => {
      props.mode = EnvironmentVariableCrudMode.EDITION
      props.type = EnvironmentVariableType.NORMAL
      const { baseElement } = render(
        <WrapperForm>
          <CrudEnvironmentVariableModal {...props} />
        </WrapperForm>
      )
      const input = getByLabelText(baseElement, 'Path')
      expect(input).toBeDisabled()
    })

    it('should display mount value field disabled for edition and alias', async () => {
      props.mode = EnvironmentVariableCrudMode.EDITION
      props.type = EnvironmentVariableType.ALIAS
      const { baseElement } = render(
        <WrapperForm>
          <CrudEnvironmentVariableModal {...props} />
        </WrapperForm>
      )
      const input = getByLabelText(baseElement, 'Path')
      expect(input).toBeDisabled()
    })

    it('should display mount value field disabled for edition and override', async () => {
      props.mode = EnvironmentVariableCrudMode.EDITION
      props.type = EnvironmentVariableType.OVERRIDE
      const { baseElement } = render(
        <WrapperForm>
          <CrudEnvironmentVariableModal {...props} />
        </WrapperForm>
      )
      const input = getByLabelText(baseElement, 'Path')
      expect(input).toBeDisabled()
    })

    it('should display secret file label instead of secret variable', async () => {
      props.mode = EnvironmentVariableCrudMode.CREATION
      props.type = EnvironmentVariableType.NORMAL
      const { baseElement } = render(
        <WrapperForm>
          <CrudEnvironmentVariableModal {...props} />
        </WrapperForm>
      )
      getByText(baseElement, 'Secret file')
    })
  })

  describe('with bad form data', () => {
    it('should show required error message under value textarea if not Alias context', async () => {
      const { baseElement } = render(
        <WrapperForm>
          <CrudEnvironmentVariableModal {...props} />
        </WrapperForm>
      )

      await act(() => {
        const textarea = screen.getByLabelText('Value') as HTMLTextAreaElement
        fireEvent.change(textarea, { target: { value: '' } })
      })

      await waitFor(async () => {
        const button = await getByRole(baseElement, 'button', { name: 'Confirm' })
        expect(button).toBeDisabled()
      })
    })
  })
})
