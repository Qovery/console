import { type Application, type Job, type Terraform } from '@qovery/domains/services/data-access'
import { applicationFactoryMock, cronjobFactoryMock, terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceBuildSettings } from './service-build-settings'

const mockEditService = jest.fn()
const mockService = { data: undefined as Application | Job | Terraform | undefined }

const mockAdvancedSettings = {
  data: undefined as Record<string, unknown> | undefined,
}

const mockDefaultAdvancedSettings = {
  data: undefined as Record<string, unknown> | undefined,
}

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1', projectId: 'proj-1', environmentId: 'env-1', serviceId: 'svc-1' }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useSupportChat: () => ({ showChat: jest.fn() }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useService: () => mockService,
  useAdvancedSettings: () => mockAdvancedSettings,
  useDefaultAdvancedSettings: () => mockDefaultAdvancedSettings,
  useEditService: () => ({ mutate: mockEditService, isLoading: false }),
}))

const applicationAdvancedSettings: Record<string, unknown> = {
  'build.timeout_max_sec': 1800,
  'build.cpu_max_in_milli': 4000,
  'build.ram_max_in_gib': 8,
  'build.ephemeral_storage_in_gib': 10,
  'build.disable_buildkit_cache': false,
  'build.skip_git_submodules': false,
  'network.ingress.enable_cors': true,
}

const applicationDefaultAdvancedSettings: Record<string, unknown> = {
  'build.timeout_max_sec': 1800,
  'build.cpu_max_in_milli': 4000,
  'build.ram_max_in_gib': 8,
  'build.ephemeral_storage_in_gib': 10,
  'build.disable_buildkit_cache': false,
  'build.skip_git_submodules': false,
  'network.ingress.enable_cors': true,
}

const terraformAdvancedSettings: Record<string, unknown> = {
  'build.timeout_max_sec': 1800,
  'build.cpu_max_in_milli': 4000,
  'build.ram_max_in_gib': 8,
  'build.ephemeral_storage_in_gib': 10,
  'build.skip_git_submodules': false,
  'network.ingress.enable_cors': true,
}

const mockApplication = { ...applicationFactoryMock(1)[0], build_settings_editable: true } as Application
const mockJob = { ...cronjobFactoryMock(1)[0], build_settings_editable: true } as Job
const mockTerraform = { ...terraformFactoryMock(1)[0], build_settings_editable: true } as Terraform
const mockApplicationDisabled = { ...applicationFactoryMock(1)[0], build_settings_editable: false } as Application

function setup(service: Application | Job | Terraform, advancedSettings?: Record<string, unknown>) {
  mockService.data = service
  mockAdvancedSettings.data = advancedSettings ?? applicationAdvancedSettings
  mockDefaultAdvancedSettings.data = advancedSettings ?? applicationDefaultAdvancedSettings
  mockEditService.mockClear()
  return renderWithProviders(<ServiceBuildSettings />)
}

describe('ServiceBuildSettings', () => {
  it('should render number inputs for timeout, CPU, RAM, and ephemeral storage', () => {
    setup(mockApplication)
    expect(screen.getByLabelText(/timeout/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cpu/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ram/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ephemeral storage/i)).toBeInTheDocument()
  })

  it('should render toggle switches for BuildKit cache and Git submodules for Application', () => {
    setup(mockApplication)
    expect(screen.getByRole('switch', { name: /buildkit cache/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /git submodules/i })).toBeInTheDocument()
  })

  it('should render toggle switches for BuildKit cache and Git submodules for Job', () => {
    setup(mockJob)
    expect(screen.getByRole('switch', { name: /buildkit cache/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /git submodules/i })).toBeInTheDocument()
  })

  it('should NOT render BuildKit cache toggle for Terraform', () => {
    setup(mockTerraform, terraformAdvancedSettings)
    expect(screen.queryByRole('switch', { name: /buildkit cache/i })).not.toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /git submodules/i })).toBeInTheDocument()
  })

  it('should pre-populate form fields with values from advanced settings', () => {
    setup(mockApplication)
    expect(screen.getByLabelText(/timeout/i)).toHaveValue(1800)
    expect(screen.getByLabelText(/cpu/i)).toHaveValue(4000)
    expect(screen.getByLabelText(/ram/i)).toHaveValue(8)
    expect(screen.getByLabelText(/ephemeral storage/i)).toHaveValue(10)
  })

  it('should call editService with build_settings in the payload on submit', async () => {
    const { userEvent } = setup(mockApplication)

    const timeoutInput = screen.getByLabelText(/timeout/i)
    await userEvent.clear(timeoutInput)
    await userEvent.type(timeoutInput, '3600')

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockEditService).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceId: 'svc-1',
        payload: expect.objectContaining({
          build_settings: expect.objectContaining({
            timeout_max_sec: 3600,
            cpu_max_in_milli: 4000,
            ram_max_in_gib: 8,
            ephemeral_storage_in_gib: 10,
            disable_buildkit_cache: false,
            skip_git_submodules: false,
          }),
        }),
      }),
      expect.anything()
    )
  })

  it('should not include disable_buildkit_cache in build_settings for Terraform', async () => {
    const { userEvent } = setup(mockTerraform, terraformAdvancedSettings)

    const timeoutInput = screen.getByLabelText(/timeout/i)
    await userEvent.clear(timeoutInput)
    await userEvent.type(timeoutInput, '3600')

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockEditService).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          build_settings: expect.not.objectContaining({
            disable_buildkit_cache: expect.anything(),
          }),
        }),
      }),
      expect.anything()
    )
  })

  it('should send all build_settings fields even when only one is modified', async () => {
    const { userEvent } = setup(mockApplication)

    const cpuInput = screen.getByLabelText(/cpu/i)
    await userEvent.clear(cpuInput)
    await userEvent.type(cpuInput, '8000')

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    const payload = mockEditService.mock.calls[0][0].payload
    expect(payload.build_settings).toEqual(
      expect.objectContaining({
        timeout_max_sec: 1800,
        cpu_max_in_milli: 8000,
        ram_max_in_gib: 8,
        ephemeral_storage_in_gib: 10,
        disable_buildkit_cache: false,
        skip_git_submodules: false,
      })
    )
  })

  it('should show Save button when build_settings_editable is true', () => {
    setup(mockApplication)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('should disable all inputs when build_settings_editable is false', () => {
    setup(mockApplicationDisabled)
    expect(screen.getByLabelText(/timeout/i)).toBeDisabled()
    expect(screen.getByLabelText(/cpu/i)).toBeDisabled()
    expect(screen.getByLabelText(/ram/i)).toBeDisabled()
    expect(screen.getByLabelText(/ephemeral storage/i)).toBeDisabled()
  })

  it('should show a callout message when build_settings_editable is false', () => {
    setup(mockApplicationDisabled)
    expect(screen.getByText(/not available for your organization/i)).toBeInTheDocument()
  })

  it('should not show Save button when build_settings_editable is false', () => {
    setup(mockApplicationDisabled)
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })
})
