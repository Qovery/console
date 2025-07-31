import { useForm } from 'react-hook-form'
import { renderHook, renderWithProviders } from '@qovery/shared/util-tests'
import { type TerraformGeneralData, type TerraformInputVariablesData } from '../page-terraform-create-feature'
import { TerraformCreateContext } from '../page-terraform-create-feature'
import StepGeneralFeature from './step-general-feature'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ organizationId: '1' }),
}))

const inputVariablesDataDefaultValues: TerraformInputVariablesData = {
  tf_vars: [],
  tf_var_file_paths: [],
}

describe('StepGeneralFeature', () => {
  it('should render successfully', () => {
    const { result: generalForm } = renderHook(() =>
      useForm<TerraformGeneralData>({
        mode: 'onChange',
      })
    )

    const { result: inputVariablesForm } = renderHook(() =>
      useForm<TerraformInputVariablesData>({
        mode: 'onChange',
        defaultValues: inputVariablesDataDefaultValues,
      })
    )

    const { baseElement } = renderWithProviders(
      <TerraformCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalForm: generalForm.current,
          inputVariablesForm: inputVariablesForm.current,
        }}
      >
        <StepGeneralFeature />
      </TerraformCreateContext.Provider>
    )

    expect(baseElement).toBeTruthy()
  })
})
