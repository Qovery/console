import { type ReactNode } from 'react'
import { terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintGeneralSettings } from './blueprint-general-settings'

const mockUseBlueprint = jest.fn()
const mockUseBlueprintCatalogServiceManifest = jest.fn()
const mockPreviewBlueprintUpdate = jest.fn()
const mockUpdateBlueprint = jest.fn()
const mockDeployBlueprint = jest.fn()

jest.mock('@qovery/domains/environments/feature', () => ({
  useEnvironment: () => ({ data: { cluster_id: 'cluster-id' } }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  useBlueprint: (...args: unknown[]) => mockUseBlueprint(...args),
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
  BlueprintManifestVariableInput: ({ onChange }: { onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange('updated-value')}>
      Edit value
    </button>
  ),
  BlueprintSection: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      {title}
      {children}
    </div>
  ),
  OverridesSectionCard: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BlueprintUpdateFlowShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BlueprintPreview: ({ onConfirm }: { onConfirm: () => Promise<void> }) => (
    <button type="button" onClick={() => void onConfirm()}>
      Confirm & deploy update
    </button>
  ),
}))

describe('BlueprintGeneralSettings', () => {
  const service = { ...terraformFactoryMock(1)[0], blueprint_id: 'blueprint-id' }

  it('loads the catalog form from the Blueprint tag returned by the existing read endpoint', () => {
    mockUseBlueprintCatalogServiceManifest.mockReturnValue({ data: [], isLoading: false })
    mockUseBlueprint.mockReturnValue({
      data: { name: service.name, tag: 'aws/postgres/17/1.0.0' },
      isLoading: false,
    })

    renderWithProviders(
      <BlueprintGeneralSettings service={service} environmentId="environment-id" organizationId="organization-id" />
    )

    expect(screen.getByText('Blueprint setup')).toBeInTheDocument()
    expect(mockUseBlueprintCatalogServiceManifest).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'aws', serviceFamily: 'postgres', serviceVersion: '17' })
    )
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

    await userEvent.click(screen.getByRole('button', { name: 'Edit value' }))
    await userEvent.click(screen.getByRole('button', { name: 'Preview changes' }))

    expect(mockPreviewBlueprintUpdate).toHaveBeenCalledTimes(1)
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
  })
})
