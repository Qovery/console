import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { type ReactNode, useState } from 'react'
import { helmFactoryMock, terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintGeneralSettings } from './blueprint-general-settings'

const mockUseBlueprint = jest.fn()
const mockUseBlueprintVariables = jest.fn().mockReturnValue({ data: [], isLoading: false })
const mockUseBlueprintCatalogServiceManifest = jest.fn()
const mockPreviewBlueprintUpdate = jest.fn()
const mockUpdateBlueprint = jest.fn()
const mockDeployBlueprint = jest.fn()
const mockBlueprintMetadata = jest.fn()

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))
const service = {
  ...terraformFactoryMock(1)[0],
  blueprint_id: 'blueprint-id',
  terraform_variables_source: {
    tf_vars: [{ key: 'database_name', value: 'outdated-value', secret: false }],
    tf_var_file_paths: [],
  },
}

jest.mock('@qovery/domains/environments/feature', () => ({
  useEnvironment: () => ({ data: { cluster_id: 'cluster-id' } }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useBlueprint: (...args: unknown[]) => mockUseBlueprint(...args),
  useBlueprintVariables: (...args: unknown[]) => mockUseBlueprintVariables(...args),
  useBlueprintCatalogServiceManifest: (...args: unknown[]) => mockUseBlueprintCatalogServiceManifest(...args),
  usePreviewBlueprintUpdate: () => ({ mutateAsync: mockPreviewBlueprintUpdate, isLoading: false }),
  useUpdateBlueprint: () => ({ mutateAsync: mockUpdateBlueprint, isLoading: false }),
  useDeployBlueprint: () => ({ mutateAsync: mockDeployBlueprint, isLoading: false }),
  getDefaultFieldValue: jest.fn(),
  getFallbackServiceIcon: jest.fn(),
  getFieldValidationError: jest.fn(),
  isFieldValid: () => true,
  isOptionalVariableField: (field: { required: boolean; kind: string }) => field.kind === 'variable' && !field.required,
  isRequiredVariableField: (field: { required: boolean; kind: string }) => field.kind === 'variable' && field.required,
  BlueprintManifestVariableInput: ({
    onChange,
    value,
  }: {
    onChange: (value: string) => void
    value: string | boolean | undefined
  }) => (
    <>
      <span>Current value: {String(value ?? '')}</span>
      <button type="button" onClick={() => onChange('updated-value')}>
        Edit value
      </button>
    </>
  ),
  BlueprintSection: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      {title}
      {children}
    </div>
  ),
  OverridesSectionCard: ({
    active,
    children,
    onClick,
  }: {
    active: boolean
    children: ReactNode
    onClick: () => void
  }) => (active ? <div>{children}</div> : <button onClick={onClick}>Configure</button>),
  BlueprintUpdateFlowShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BlueprintPreview: ({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => Promise<void> }) => (
    <>
      <button type="button" onClick={onBack}>
        Back to configuration
      </button>
      <button type="button" onClick={() => void onConfirm()}>
        Confirm & deploy update
      </button>
    </>
  ),
  BlueprintMetadata: (props: unknown) => {
    mockBlueprintMetadata(props)
    return <span>Blueprint metadata</span>
  },
  BlueprintMetadataSkeleton: () => <span>Loading blueprint metadata</span>,
  formatBlueprintName: (name: string) =>
    name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
}))

function BlueprintGeneralSettingsHarness() {
  const [queryClient] = useState(() => new QueryClient())
  const [visible, setVisible] = useState(true)

  return (
    <QueryClientProvider client={queryClient}>
      <button type="button" onClick={() => setVisible((current) => !current)}>
        {visible ? 'Navigate to Overview' : 'Navigate to Settings'}
      </button>
      {visible ? (
        <BlueprintGeneralSettings service={service} environmentId="environment-id" organizationId="organization-id" />
      ) : null}
    </QueryClientProvider>
  )
}

describe('BlueprintGeneralSettings', () => {
  beforeEach(() => {
    mockUseBlueprintVariables.mockReturnValue({ data: [], isLoading: false })
    jest.mocked(posthog.capture).mockClear()
  })

  it('loads the catalog form from the Blueprint tag returned by the existing read endpoint', () => {
    mockUseBlueprintCatalogServiceManifest.mockReturnValue({ data: [], isLoading: false })
    mockUseBlueprint.mockReturnValue({
      data: { name: 'aws-rds-postgresql', tag: 'aws/postgres/17/1.0.0' },
      isLoading: false,
    })

    renderWithProviders(
      <BlueprintGeneralSettings service={service} environmentId="environment-id" organizationId="organization-id" />
    )

    expect(screen.getByText('Blueprint setup')).toBeInTheDocument()
    expect(screen.getByText('Aws Rds Postgresql')).toBeInTheDocument()
    expect(screen.getByText('Blueprint metadata')).toBeInTheDocument()
    expect(mockBlueprintMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        blueprintId: 'blueprint-id',
        gitRepository: service.terraform_files_source.git?.git_repository,
        service,
      })
    )
    expect(mockUseBlueprintCatalogServiceManifest).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'aws', serviceFamily: 'postgres', serviceVersion: '17' })
    )
    expect(posthog.capture).toHaveBeenCalledWith('blueprint_settings_visited', {
      blueprint_id: service.blueprint_id,
      service_id: service.id,
      service_type: service.serviceType,
    })
  })

  it('uses the Blueprint read model to prefill and preview updates for Helm Blueprint services', async () => {
    const helmBlueprintService = { ...helmFactoryMock(1)[0], blueprint_id: 'helm-blueprint-id' }
    mockUseBlueprintCatalogServiceManifest.mockReturnValue({ data: [], isLoading: false })
    mockUseBlueprint.mockReturnValue({
      data: {
        name: 'rabbitmq',
        tag: 'helm/rabbitmq/1.0.0',
        variables: [{ name: 'replicas', value: '3', is_secret: false }],
        manifest: {
          results: [
            {
              kind: 'variable',
              name: 'replicas',
              required: true,
              is_secret: false,
              type: { type: 'string' },
            },
          ],
        },
      },
      isLoading: false,
    })
    mockUseBlueprintVariables.mockReturnValue({
      data: [{ name: 'replicas', value: '3', is_secret: false }],
      isLoading: false,
    })
    mockPreviewBlueprintUpdate.mockResolvedValue({ preview_id: 'preview-id' })

    const { userEvent } = renderWithProviders(
      <BlueprintGeneralSettings
        service={helmBlueprintService}
        environmentId="environment-id"
        organizationId="organization-id"
      />
    )

    expect(screen.getByText('Current value: 3')).toBeInTheDocument()
    expect(mockBlueprintMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        blueprintId: 'helm-blueprint-id',
        gitRepository: undefined,
        service: helmBlueprintService,
      })
    )

    await userEvent.click(screen.getByRole('button', { name: 'Edit value' }))
    await userEvent.click(screen.getByRole('button', { name: 'Preview changes' }))

    expect(mockPreviewBlueprintUpdate).toHaveBeenCalledWith({
      blueprintId: 'helm-blueprint-id',
      payload: expect.objectContaining({
        variables: {
          replicas: { value: 'updated-value', is_secret: false },
        },
      }),
    })
  })

  it('only persists and deploys after the user confirms the preview', async () => {
    mockUseBlueprintCatalogServiceManifest.mockReturnValue({
      data: [
        {
          kind: 'variable',
          name: 'database_name',
          required: false,
          is_secret: true,
          type: { type: 'string' },
        },
      ],
      isLoading: false,
    })
    mockUseBlueprint.mockReturnValue({
      data: { name: service.name, tag: 'aws/postgres/17/1.0.0' },
      isLoading: false,
    })
    mockPreviewBlueprintUpdate.mockResolvedValue({ preview_id: 'preview-id' })

    const { userEvent } = renderWithProviders(
      <BlueprintGeneralSettings service={service} environmentId="environment-id" organizationId="organization-id" />
    )

    expect(screen.getByRole('button', { name: 'Configure' })).toBeInTheDocument()
    expect(screen.queryByText('Current value:')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit value' }))
    await userEvent.click(screen.getByRole('button', { name: 'Preview changes' }))

    expect(mockPreviewBlueprintUpdate).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith('blueprint_settings_preview_triggered', {
      blueprint_id: 'blueprint-id',
      service_id: service.id,
      service_type: service.serviceType,
    })
    expect(mockPreviewBlueprintUpdate).toHaveBeenCalledWith({
      blueprintId: 'blueprint-id',
      payload: expect.objectContaining({
        variables: {
          database_name: { value: 'updated-value', is_secret: true },
        },
      }),
    })
    expect(mockUpdateBlueprint).not.toHaveBeenCalled()
    expect(mockDeployBlueprint).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Confirm & deploy update' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockUpdateBlueprint).toHaveBeenCalledTimes(1)
    expect(mockUpdateBlueprint).toHaveBeenCalledWith({
      blueprintId: 'blueprint-id',
      payload: expect.objectContaining({
        variables: {
          database_name: { value: 'updated-value', is_secret: true },
        },
      }),
    })
    expect(mockDeployBlueprint).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith('blueprint_settings_updated', {
      blueprint_id: service.blueprint_id,
      service_id: service.id,
      service_type: service.serviceType,
    })
  })

  it('keeps confirmed non-secret values visible when Settings remounts before the service read model catches up', async () => {
    mockUseBlueprintCatalogServiceManifest.mockReturnValue({
      data: [
        {
          kind: 'variable',
          name: 'database_name',
          required: false,
          is_secret: false,
          type: { type: 'string' },
        },
      ],
      isLoading: false,
    })
    mockUseBlueprint.mockReturnValue({
      data: { name: service.name, tag: 'aws/postgres/17/1.0.0' },
      isLoading: false,
    })
    mockPreviewBlueprintUpdate.mockResolvedValue({ preview_id: 'preview-id' })

    const { userEvent } = renderWithProviders(<BlueprintGeneralSettingsHarness />)

    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit value' }))
    await userEvent.click(screen.getByRole('button', { name: 'Preview changes' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirm & deploy update' }))

    expect(screen.getByText('Current value: updated-value')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Navigate to Overview' }))
    await userEvent.click(screen.getByRole('button', { name: 'Navigate to Settings' }))

    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))
    expect(screen.getByText('Current value: updated-value')).toBeInTheDocument()
  })

  it('keeps the preview modal open until the user explicitly returns to the configuration', async () => {
    mockUseBlueprintCatalogServiceManifest.mockReturnValue({
      data: [
        {
          kind: 'variable',
          name: 'database_name',
          required: false,
          is_secret: false,
          type: { type: 'string' },
        },
      ],
      isLoading: false,
    })
    mockUseBlueprint.mockReturnValue({
      data: { name: service.name, tag: 'aws/postgres/17/1.0.0' },
      isLoading: false,
    })
    mockPreviewBlueprintUpdate.mockResolvedValue({ preview_id: 'preview-id' })

    const { userEvent } = renderWithProviders(
      <BlueprintGeneralSettings service={service} environmentId="environment-id" organizationId="organization-id" />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Configure' }))
    await userEvent.click(screen.getByRole('button', { name: 'Edit value' }))
    await userEvent.click(screen.getByRole('button', { name: 'Preview changes' }))

    expect(screen.getByRole('dialog')).toHaveStyle({
      height: 'min(65vh, 680px)',
      width: 'min(50vw, 900px)',
    })

    await userEvent.click(screen.getByTestId('overlay'))

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Back to configuration' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview changes' })).toBeEnabled()
  })
})
