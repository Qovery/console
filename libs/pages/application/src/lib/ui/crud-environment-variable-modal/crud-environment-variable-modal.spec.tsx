import CrudEnvironmentVariableModal, { CrudEnvironmentVariableModalProps } from './crud-environment-variable-modal'
import { render } from '__tests__/utils/setup-jest'
import {
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from '../../feature/crud-environment-variable-modal-feature/crud-environment-variable-modal-feature'
import { EnvironmentVariableScopeEnum } from 'qovery-typescript-axios'
import { FormProvider, useForm } from 'react-hook-form'

const props: CrudEnvironmentVariableModalProps = {
  mode: EnvironmentVariableCrudMode.CREATION,
  title: 'Create Environment Variable',
  description: 'Create an environment variable.',
  onSubmit: jest.fn(),
  availableScopes: [EnvironmentVariableScopeEnum.ENVIRONMENT, EnvironmentVariableScopeEnum.PROJECT],
  setOpen: jest.fn(),
  type: EnvironmentVariableType.ALIAS,
}

const WrapperForm = ({ children }) => {
  const methods = useForm()
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
})
