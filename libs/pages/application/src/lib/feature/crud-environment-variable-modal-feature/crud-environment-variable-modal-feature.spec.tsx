import CrudEnvironmentVariableModalFeature, {
  CrudEnvironmentVariableModalFeatureProps,
  EnvironmentVariableCrudMode,
  EnvironmentVariableType,
} from './crud-environment-variable-modal-feature'
import { render } from '__tests__/utils/setup-jest'
import { mockEnvironmentVariable } from '@console/domains/environment-variable'
import { FormProvider, useForm } from 'react-hook-form'

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
  const methods = useForm()
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
})
