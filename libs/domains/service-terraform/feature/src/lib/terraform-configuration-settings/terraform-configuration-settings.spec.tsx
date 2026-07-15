import { TerraformEngineEnum } from 'qovery-typescript-axios'
import { useForm } from 'react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { type TerraformGeneralData } from '../terraform-general-data/terraform-general-data'
import { TerraformConfigurationSettings } from './terraform-configuration-settings'

jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({
    organizationId: 'org',
    projectId: 'project',
    environmentId: 'environment',
    serviceId: 'service',
  }),
}))

jest.mock('../hooks/use-terraform-available-versions/use-terraform-available-versions', () => ({
  useTerraformAvailableVersions: () => ({ data: [], isLoading: false }),
}))

function TestComponent({ isSettings = false }: { isSettings?: boolean }) {
  const methods = useForm<TerraformGeneralData>({
    mode: 'onChange',
    defaultValues: {
      engine: TerraformEngineEnum.TERRAFORM,
      provider_version: { read_from_terraform_block: false, explicit_version: '1.9.0' },
      backend: { kubernetes: {} },
      use_cluster_credentials: true,
      timeout_sec: '300',
      dockerfile_fragment_source: 'none',
    },
  })

  return <TerraformConfigurationSettings methods={methods} isSettings={isSettings} />
}

describe('TerraformConfigurationSettings', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('configures a file-based Dockerfile fragment', async () => {
    const { userEvent } = renderWithProviders(<TestComponent isSettings />)

    expect(screen.getByRole('heading', { name: 'Dockerfile fragment' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'File path' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Custom file path'))

    expect(screen.getByRole('textbox', { name: 'File path' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/terraform#file-based-fragment'
    )
  })

  it('does not display Dockerfile fragment settings during service creation', () => {
    renderWithProviders(<TestComponent />)

    expect(screen.queryByRole('heading', { name: 'Dockerfile fragment' })).not.toBeInTheDocument()
  })
})
