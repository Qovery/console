import { type ReactNode } from 'react'
import { terraformFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { BlueprintGeneralSettings } from './blueprint-general-settings'

const mockUseBlueprint = jest.fn()
const mockUseBlueprintCatalogServiceManifest = jest.fn()

jest.mock('@qovery/domains/services/feature', () => ({
  useBlueprint: (...args: unknown[]) => mockUseBlueprint(...args),
  useBlueprintCatalogServiceManifest: (...args: unknown[]) => mockUseBlueprintCatalogServiceManifest(...args),
  usePreviewBlueprintUpdate: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  useUpdateBlueprint: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  useDeployBlueprint: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  getDefaultFieldValue: jest.fn(),
  getFallbackServiceIcon: jest.fn(),
  getFieldValidationError: jest.fn(),
  isFieldValid: jest.fn(),
  isOptionalVariableField: jest.fn(),
  isRequiredVariableField: jest.fn(),
  BlueprintManifestVariableInput: () => null,
  BlueprintSection: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      {title}
      {children}
    </div>
  ),
  OverridesSectionCard: ({ children }: { children: ReactNode }) => <div>{children}</div>,
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
})
