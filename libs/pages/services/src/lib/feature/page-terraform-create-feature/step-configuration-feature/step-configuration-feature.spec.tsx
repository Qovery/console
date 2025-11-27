import { useForm } from 'react-hook-form'
import { type TerraformGeneralData } from '@qovery/domains/service-terraform/feature'
import { renderHook, renderWithProviders } from '@qovery/shared/util-tests'
import { TerraformCreateContext } from '../page-terraform-create-feature'
import StepConfigurationFeature from './step-configuration-feature'

const generalDataDefaultValues: TerraformGeneralData = {
  description: 'Terraform service',
  auto_approve: false,
  auto_deploy: false,
  terraform_files_source: {
    git_repository: {
      url: 'https://github.com/Qovery/github',
      branch: 'main',
    },
  },
  terraform_variables_source: {
    tf_vars: [],
    tf_var_file_paths: [],
  },
  provider_version: {
    read_from_terraform_block: false,
    explicit_version: '1.0.0',
  },
  job_resources: {
    cpu_milli: 500,
    ram_mib: 256,
    storage_gib: 1,
  },
  source_provider: 'GIT',
  repository: 'Qovery/github',
  arguments: '',
  timeout_sec: '3600',
  state: 'kubernetes',
  provider: 'GITHUB',
  branch: 'main',
  root_path: '/',
  name: 'terraform-service',
  backend: {
    kubernetes: {},
  },
}

describe('StepConfigurationFeature', () => {
  it('should render successfully', () => {
    const { result: generalForm } = renderHook(() =>
      useForm<TerraformGeneralData>({
        mode: 'onChange',
        defaultValues: generalDataDefaultValues,
      })
    )

    const { baseElement } = renderWithProviders(
      <TerraformCreateContext.Provider
        value={{
          currentStep: 1,
          setCurrentStep: jest.fn(),
          generalForm: generalForm.current,
        }}
      >
        <StepConfigurationFeature />
      </TerraformCreateContext.Provider>
    )
    expect(baseElement).toBeTruthy()
  })
})
