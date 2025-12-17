import { TerraformEngineEnum } from 'qovery-typescript-axios'
import { useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { TerraformConfigurationSettings, type TerraformGeneralData } from './terraform-configuration-settings'

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({
      organizationId: 'org',
      projectId: 'proj',
      environmentId: 'env',
      applicationId: 'app',
    }),
  }
})

jest.mock('../../hooks/use-terraform-available-versions/use-terraform-available-versions', () => ({
  __esModule: true,
  default: () => ({ data: [], isLoading: false }),
}))

function TestComponent({ isSettings }: { isSettings?: boolean }) {
  const methods = useForm<TerraformGeneralData>({
    defaultValues: {
      engine: TerraformEngineEnum.TERRAFORM,
      provider_version: { read_from_terraform_block: false, explicit_version: '1.9.0' },
      backend: { kubernetes: {} },
      use_cluster_credentials: true,
      auto_deploy: false,
      job_resources: { cpu_milli: 100, ram_mib: 256, storage_gib: 1 },
      arguments: '',
      timeout_sec: '300',
      dockerfile_fragment_source: 'none',
      source_provider: 'GIT',
      repository: 'repo',
    } as unknown as TerraformGeneralData,
  })

  return <TerraformConfigurationSettings methods={methods} isSettings={isSettings} />
}

describe('TerraformConfigurationSettings - Custom build commands visibility', () => {
  it('should not render the custom build commands section in creation flow (default)', () => {
    renderWithProviders(<TestComponent />)

    expect(screen.queryByText('Custom build commands')).not.toBeInTheDocument()
  })

  it('should render the custom build commands section in settings', () => {
    renderWithProviders(<TestComponent isSettings />)

    expect(screen.getByText('Custom build commands')).toBeInTheDocument()
  })
})
