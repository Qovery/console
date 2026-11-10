import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ServiceResourcesSettings } from './service-resources-settings'

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
  useAdvancedSettings: () => ({ data: undefined }),
  useEditAdvancedSettings: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  useEditService: () => ({ mutate: jest.fn(), isLoading: false }),
  ApplicationSettingsResources: function MockApplicationSettingsResources() {
    const { getValues } = jest.requireActual('react-hook-form').useFormContext()
    const scalers: Array<{ config: string }> = getValues('scalers') ?? []
    return (
      <div data-testid="application-settings-resources">
        Resources form
        {scalers.map((scaler, index) => (
          <pre key={index} data-testid="scaler-config">
            {scaler.config}
          </pre>
        ))}
      </div>
    )
  },
}))

describe('ServiceResourcesSettings', () => {
  const service = applicationFactoryMock(1)[0]

  it('should render resources heading and save action', async () => {
    renderWithProviders(<ServiceResourcesSettings service={service} />)

    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument()
    expect(screen.getByText('Manage the resources assigned to the service.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
  })

  it('should render resources form content', async () => {
    renderWithProviders(<ServiceResourcesSettings service={service} />)

    expect(screen.getByTestId('application-settings-resources')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
  })

  describe('KEDA scalers', () => {
    const buildKedaService = (scaler: Record<string, unknown>) =>
      ({
        ...service,
        autoscaling: {
          mode: 'KEDA',
          scalers: [{ scaler_type: 'prometheus', ...scaler }],
        },
      }) as unknown as typeof service

    it('should display config_json pretty-printed when config_yaml is missing', async () => {
      const configJson = { serverAddress: 'http://prometheus:9090', threshold: '100' }
      renderWithProviders(<ServiceResourcesSettings service={buildKedaService({ config_json: configJson })} />)

      await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
      expect(screen.getByTestId('scaler-config')).toHaveTextContent(JSON.stringify(configJson, null, 2), {
        normalizeWhitespace: false,
      })
    })

    it('should prefer config_yaml over config_json when both are set', async () => {
      renderWithProviders(
        <ServiceResourcesSettings
          service={buildKedaService({ config_yaml: 'threshold: "50"', config_json: { threshold: '100' } })}
        />
      )

      await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
      expect(screen.getByTestId('scaler-config')).toHaveTextContent('threshold: "50"', { normalizeWhitespace: false })
    })
  })
})
