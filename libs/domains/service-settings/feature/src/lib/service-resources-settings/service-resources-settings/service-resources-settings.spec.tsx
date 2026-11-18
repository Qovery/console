import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { ServiceResourcesSettings } from './service-resources-settings'

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
  useAdvancedSettings: () => ({ data: undefined }),
  useEditAdvancedSettings: () => ({ mutateAsync: jest.fn(), isLoading: false }),
  useEditService: () => ({ mutate: mockEditService, isLoading: false }),
  ApplicationSettingsResources: function MockApplicationSettingsResources() {
    const { useFieldArray, useFormContext } = jest.requireActual('react-hook-form')
    const { control, getValues } = useFormContext()
    const { append, remove } = useFieldArray({ control, name: 'scalers' })
    const scalers: Array<{ config: string }> = getValues('scalers') ?? []
    return (
      <div data-testid="application-settings-resources">
        Resources form
        {scalers.map((scaler, index) => (
          <pre key={index} data-testid="scaler-config">
            {scaler.config}
          </pre>
        ))}
        <button type="button" onClick={() => remove(1)}>
          Remove second scaler
        </button>
        <button
          type="button"
          onClick={() =>
            append({ type: 'cpu', config: 'value: "50"', configFormat: 'yaml', triggerAuthentication: '' })
          }
        >
          Add scaler
        </button>
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

    it('should disable save in KEDA mode until a scaler has a type and a config', async () => {
      const { userEvent } = renderWithProviders(
        <ServiceResourcesSettings service={buildKedaService({ config_yaml: '' })} />
      )

      await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled())

      await userEvent.click(screen.getByRole('button', { name: 'Add scaler' }))

      await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
    })

    it('should send the id of kept scalers on save, no id for a new scaler and drop a removed one', async () => {
      const kedaService = {
        ...service,
        min_running_instances: 1,
        max_running_instances: 3,
        autoscaling: {
          mode: 'KEDA',
          polling_interval_seconds: 30,
          cooldown_period_seconds: 300,
          scalers: [
            {
              id: 'scaler-1',
              scaler_type: 'prometheus',
              enabled: true,
              role: 'PRIMARY',
              config_yaml: 'threshold: "50"',
            },
            { id: 'scaler-2', scaler_type: 'memory', enabled: true, role: 'SAFETY', config_yaml: 'value: "70"' },
          ],
        },
      } as unknown as typeof service
      const { userEvent } = renderWithProviders(<ServiceResourcesSettings service={kedaService} />)

      await userEvent.click(screen.getByRole('button', { name: 'Remove second scaler' }))
      await userEvent.click(screen.getByRole('button', { name: 'Add scaler' }))
      await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => expect(mockEditService).toHaveBeenCalled())
      const scalers = mockEditService.mock.calls[0][0].payload.autoscaling.scalers
      expect(scalers).toEqual([
        expect.objectContaining({ id: 'scaler-1', scaler_type: 'prometheus', role: 'PRIMARY' }),
        expect.objectContaining({ scaler_type: 'cpu', role: 'SAFETY' }),
      ])
      expect(scalers[1].id).toBeUndefined()
    })
  })
})
