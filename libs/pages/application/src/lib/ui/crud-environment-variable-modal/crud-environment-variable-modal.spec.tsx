import '@testing-library/jest-dom/extend-expect'
import { act, fireEvent, getByRole, queryByText, render, screen, waitFor } from '@testing-library/react'
import { APIVariableScopeEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'
import {
  DataFormEnvironmentVariableInterface,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../../feature/crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'
import CrudEnvironmentVariableModal, { CrudEnvironmentVariableModalProps } from './crud-environment-variable-modal'

const props: CrudEnvironmentVariableModalProps = {
  mode: EnvironmentVariableCrudMode.CREATION,
  title: 'Create Environment Variable',
  description: 'Create an environment variable.',
  onSubmit: jest.fn(),
  availableScopes: [APIVariableScopeEnum.ENVIRONMENT, APIVariableScopeEnum.PROJECT],
  setOpen: jest.fn(),
  type: EnvironmentVariableType.NORMAL,
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
        const error = screen.getByText('Please enter a value.')
        expect(error).toBeTruthy()
      })

      await waitFor(async () => {
        const button = await getByRole(baseElement, 'button', { name: 'Confirm' })
        expect(button).toBeDisabled()
      })
    })

    it('should not show required error message under value textarea if Alias context', async () => {
      props.type = EnvironmentVariableType.ALIAS
      const { baseElement } = render(
        <WrapperForm>
          <CrudEnvironmentVariableModal {...props} />
        </WrapperForm>
      )

      await act(() => {
        const textarea = screen.getByLabelText('Value') as HTMLTextAreaElement
        fireEvent.change(textarea, { target: { value: 'a' } })
        fireEvent.change(textarea, { target: { value: '' } })
      })

      expect(queryByText(baseElement, 'Please enter a value.')).toBeNull()
    })
  })
})
