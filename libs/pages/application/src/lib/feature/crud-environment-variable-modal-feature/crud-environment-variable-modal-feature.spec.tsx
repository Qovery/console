import CrudEnvironmentVariableModalFeature, {
  CrudEnvironmentVariableModalFeatureProps,
  DataFormEnvironmentVariableInterface,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from './crud-environment-variable-modal-feature'
import { render } from '__tests__/utils/setup-jest'
import { mockEnvironmentVariable } from '@console/domains/environment-variable'
import { FormProvider, useForm } from 'react-hook-form'
import { act, fireEvent, screen } from '@testing-library/react'

const props: CrudEnvironmentVariableModalFeatureProps = {
  mode: EnvironmentVariableCrudMode.CREATION,
  type: EnvironmentVariableType.ALIAS,
  projectId: 'dsd',
  applicationId: 'sds',
  environmentId: 'sds',
  variable: mockEnvironmentVariable(),
  setOpen: jest.fn(),
}

const WrapperForm = ({ children }) => {
  const methods = useForm<DataFormEnvironmentVariableInterface>({
    defaultValues: {
      key: '',
      scope: '',
      value: '',
      isSecret: false,
    },
    mode: 'onChange',
  })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('CrudEnvironmentVariableModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <WrapperForm>
        <CrudEnvironmentVariableModalFeature {...props} />
      </WrapperForm>
    )
    expect(baseElement).toBeTruthy()
  })

  it('it should remove required for value if type is alias', async () => {
    props.type = EnvironmentVariableType.OVERRIDE
    const { baseElement } = render(
      <WrapperForm>
        <CrudEnvironmentVariableModalFeature {...props} />
      </WrapperForm>
    )

    const textarea = screen.getByLabelText('Value') as HTMLTextAreaElement

    // todo this is not working because not triggering the error message to appear
    act(() => {
      fireEvent.change(textarea, { target: { value: 'SDSD' } })
    })

    //const error = screen.getByText('Please enter a value.')
    const submitButton = screen.getByRole('button', { name: 'Confirm' }) as HTMLButtonElement
    //expect(submitButton).not.toBeDisabled()

    // todo uncomment and fix to finalize test
    // const error = screen.getByText('Please enter a value.')
    // expect(error).toBeTruthy()
  })

  // it('it should call submit callback', () => {
  //   props.type = EnvironmentVariableType.ALIAS
  //   const { baseElement } = render(
  //     <WrapperForm>
  //       <CrudEnvironmentVariableModalFeature {...props} />
  //     </WrapperForm>
  //   )
  //
  //   // todo this is not working because not triggering the error message to appear
  //   act(() => {
  //     const submitButton = screen.getByRole('button', { name: 'Confirm' }) as HTMLButtonElement
  //     fireEvent.click(submitButton)
  //   })
  //
  //   // todo uncomment and fix to finalize test
  // })
})
