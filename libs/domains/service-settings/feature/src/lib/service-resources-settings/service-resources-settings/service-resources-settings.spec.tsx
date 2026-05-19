import { applicationFactoryMock } from '@qovery/shared/factories'
import { fireEvent, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ServiceResourcesSettings } from './service-resources-settings'

let mockAdvancedSettings: Record<string, unknown> | undefined
const mockEditAdvancedSettings = jest.fn()
const mockEditService = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
  }),
}))

jest.mock('@qovery/domains/services/feature', () => ({
  ...jest.requireActual('@qovery/domains/services/feature'),
  useAdvancedSettings: () => ({ data: mockAdvancedSettings }),
  useEditAdvancedSettings: () => ({ mutateAsync: mockEditAdvancedSettings, isLoading: false }),
  useEditService: () => ({ mutate: mockEditService, isLoading: false }),
  ApplicationSettingsResources: ({ displayStableNodepoolToggle }: { displayStableNodepoolToggle?: boolean }) => {
    const { setValue, watch } = jest.requireActual('react-hook-form').useFormContext()
    const runOnStableNodepool = watch('run_on_stable_nodepool') ?? false

    return (
      <div data-testid="application-settings-resources">
        Resources form
        {displayStableNodepoolToggle && (
          <>
            <button
              type="button"
              onClick={() => setValue('run_on_stable_nodepool', !runOnStableNodepool, { shouldDirty: true })}
            >
              Run on a stable nodepool
            </button>
          </>
        )}
      </div>
    )
  },
}))

describe('ServiceResourcesSettings', () => {
  const service = applicationFactoryMock(1)[0]

  beforeEach(() => {
    mockAdvancedSettings = undefined
    mockEditAdvancedSettings.mockReset()
    mockEditAdvancedSettings.mockResolvedValue(undefined)
    mockEditService.mockReset()
  })

  it('should render resources heading and save action', () => {
    renderWithProviders(<ServiceResourcesSettings service={service} />)

    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    expect(screen.getByText('Manage the resources assigned to the service.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('should render resources form content', () => {
    renderWithProviders(<ServiceResourcesSettings service={service} />)

    expect(screen.getByTestId('application-settings-resources')).toBeInTheDocument()
  })

  it('should render stable nodepool control in the resources form', async () => {
    renderWithProviders(<ServiceResourcesSettings service={service} />)

    expect(screen.getByTestId('application-settings-resources')).toContainElement(
      screen.getByText('Run on a stable nodepool')
    )
  })

  it('should remove stable nodepool advanced settings when toggle is disabled', async () => {
    mockAdvancedSettings = {
      'deployment.affinity.node.required': {
        'karpenter.sh/capacity-type': 'on-demand',
        'karpenter.sh/nodepool': 'stable',
        'kubernetes.io/arch': 'arm64',
      },
    }

    renderWithProviders(<ServiceResourcesSettings service={service} />)

    fireEvent.click(screen.getByText('Run on a stable nodepool'))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockEditAdvancedSettings).toHaveBeenCalledWith({
        serviceId: service.id,
        payload: {
          serviceType: 'APPLICATION',
          'deployment.affinity.node.required': {
            'kubernetes.io/arch': 'arm64',
          },
          'hpa.cpu.average_utilization_percent': 60,
          'hpa.memory.average_utilization_percent': null,
        },
      })
    })
  })
})
