import { useParams } from '@tanstack/react-router'
import { act, within } from '@testing-library/react'
import type { BlueprintItem, BlueprintManifestResponseResultsInner } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useLayoutEffect, useState } from 'react'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  BlueprintCreationFlow,
  BlueprintManifestFieldsProvider,
  BlueprintOverridesConfigurationSection,
  BlueprintServiceInformationSection,
  BlueprintSetupSection,
  BlueprintStepSummary,
  useBlueprintCreateContext,
} from './blueprint-creation-flow'

const mockNavigate = jest.fn()
const mockUseBlueprintCatalogServiceManifest = jest.fn()
const mockPrefetchBlueprintManifestFields = jest.fn()
const mockUseBlueprintCatalogServiceReadme = jest.fn()
const mockUseBlueprintServiceCreatedSocket = jest.fn()
const mockCreateBlueprint = jest.fn()
const mockToast = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
}))

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
    toast: (...args: Parameters<typeof actual.toast>) => mockToast(...args),
    Link: ({ children, to, ...props }: { children: ReactNode; to?: string; [key: string]: unknown }) =>
      typeof to === 'string' ? (
        <a href={to} {...props}>
          {children}
        </a>
      ) : (
        <span {...props}>{children}</span>
      ),
  }
})

jest.mock('../../hooks/use-blueprint-catalog-service-manifest/use-blueprint-catalog-service-manifest', () => ({
  useBlueprintCatalogServiceManifest: (props: unknown) => mockUseBlueprintCatalogServiceManifest(props),
  usePrefetchBlueprintCatalogServiceManifest: () => mockPrefetchBlueprintManifestFields,
}))

jest.mock('../../hooks/use-blueprint-catalog-service-readme/use-blueprint-catalog-service-readme', () => ({
  useBlueprintCatalogServiceReadme: (props: unknown) => mockUseBlueprintCatalogServiceReadme(props),
}))

jest.mock('../../hooks/use-blueprint-service-created-socket/use-blueprint-service-created-socket', () => ({
  useBlueprintServiceCreatedSocket: (props: unknown) => mockUseBlueprintServiceCreatedSocket(props),
}))

jest.mock('../../hooks/use-create-blueprint/use-create-blueprint', () => ({
  useCreateBlueprint: () => ({
    mutateAsync: mockCreateBlueprint,
  }),
}))

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

const blueprint: BlueprintItem = {
  name: 'AWS RDS PostgreSQL',
  kind: 'ServiceBlueprint',
  description: 'Managed PostgreSQL database.',
  icon: 'https://cdn.qovery.com/icons/postgresql.svg',
  categories: ['database'],
  provider: 'AWS',
  serviceFamily: 'postgres',
  majorVersions: [{ serviceVersion: '17', latestTag: 'aws/postgres/17/1.0.0' }],
}

const manifestFields: BlueprintManifestResponseResultsInner[] = [
  {
    kind: 'variable',
    name: 'db_name',
    required: true,
    is_secret: false,
    description: 'PostgreSQL database name',
    type: { type: 'string' },
  },
  {
    kind: 'variable',
    name: 'db_username',
    required: true,
    is_secret: false,
    description: 'Master username',
    type: { type: 'string' },
  },
  {
    kind: 'variable',
    name: 'db_password',
    required: true,
    is_secret: true,
    description: 'Master password',
    type: { type: 'string' },
  },
  {
    kind: 'variable',
    name: 'skip_final_snapshot',
    required: false,
    is_secret: false,
    description: 'Skip final snapshot',
    type: { type: 'bool' },
    default_value: 'true',
  },
]

function renderBlueprintFlow(children: JSX.Element) {
  return renderWithProviders(
    <BlueprintCreationFlow blueprint={blueprint} onExit={jest.fn()}>
      {children}
    </BlueprintCreationFlow>
  )
}

function FillFormValues({ children }: { children: JSX.Element }) {
  const { form } = useBlueprintCreateContext()
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    form.reset({
      ...form.getValues(),
      serviceName: 'custom-postgres',
      loadedVersionTag: 'aws/postgres/17/1.0.0',
      fields: {
        db_name: 'production',
        db_username: 'postgres',
        db_password: 'super-secret',
        skip_final_snapshot: true,
      },
    })
    setReady(true)
  }, [form])

  if (!ready) {
    return null
  }

  return children
}

function WithBlueprintManifestFields({ children }: { children: JSX.Element }) {
  return <BlueprintManifestFieldsProvider>{children}</BlueprintManifestFieldsProvider>
}

type BlueprintRouteStep = 'service-information' | 'blueprint-setup' | 'overrides' | 'summary'

function BlueprintFlowRouteHarness({ flowBlueprint = blueprint }: { flowBlueprint?: BlueprintItem }) {
  const [step, setStep] = useState<BlueprintRouteStep>('service-information')

  useEffect(() => {
    mockNavigate.mockImplementation((options: { to?: string }) => {
      if (options.to?.endsWith('/service-information')) {
        setStep('service-information')
      }
      if (options.to?.endsWith('/blueprint-setup')) {
        setStep('blueprint-setup')
      }
      if (options.to?.endsWith('/overrides')) {
        setStep('overrides')
      }
      if (options.to?.endsWith('/summary')) {
        setStep('summary')
      }
    })
  }, [])

  return (
    <BlueprintCreationFlow blueprint={flowBlueprint} onExit={jest.fn()}>
      {step === 'service-information' && <BlueprintServiceInformationSection />}
      {step === 'blueprint-setup' && (
        <WithBlueprintManifestFields>
          <BlueprintSetupSection />
        </WithBlueprintManifestFields>
      )}
      {step === 'overrides' && (
        <WithBlueprintManifestFields>
          <BlueprintOverridesConfigurationSection />
        </WithBlueprintManifestFields>
      )}
      {step === 'summary' && (
        <WithBlueprintManifestFields>
          <BlueprintStepSummary />
        </WithBlueprintManifestFields>
      )}
    </BlueprintCreationFlow>
  )
}

describe('BlueprintCreationFlow', () => {
  const useParamsMock = useParams as jest.MockedFunction<typeof useParams>

  beforeEach(() => {
    jest.clearAllMocks()
    useParamsMock.mockReturnValue({
      organizationId: 'org-1',
      projectId: 'proj-1',
      environmentId: 'env-1',
      provider: 'AWS',
      serviceFamily: 'postgres',
    })
    mockUseBlueprintCatalogServiceManifest.mockReturnValue({
      data: manifestFields,
    })
    mockPrefetchBlueprintManifestFields.mockResolvedValue(undefined)
    mockUseBlueprintCatalogServiceReadme.mockReturnValue({
      data: {
        content: '# AWS RDS PostgreSQL\n\nBlueprint documentation',
        repository_url: 'https://github.com/qovery-blueprints/postgres',
      },
    })
    mockCreateBlueprint.mockResolvedValue({ environment_id: 'env-1' })
  })

  it('should open the blueprint details drawer from the configuration header', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(<BlueprintServiceInformationSection />)

    await userEvent.click(screen.getByRole('button', { name: 'AWS RDS PostgreSQL' }))

    const dialog = await screen.findByRole('dialog', { name: 'AWS RDS PostgreSQL' })

    expect(dialog).toHaveTextContent('Managed PostgreSQL database.')
    expect(dialog).toHaveTextContent('Blueprint documentation')
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole('link', { name: 'Deploy blueprint' })).not.toBeInTheDocument()
  })

  it('should focus the first blueprint setup field after continuing from service information', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderWithProviders(<BlueprintFlowRouteHarness />)

    await userEvent.type(screen.getByLabelText('Service name'), 'custom-postgres')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByLabelText('Db name')).toHaveFocus()
  })

  it('should prefetch blueprint setup fields before navigating from service information', async () => {
    mockPrefetchBlueprintManifestFields.mockImplementation(async () => {
      expect(mockNavigate).not.toHaveBeenCalledWith({
        to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres/blueprint-setup',
      })
    })

    const { userEvent } = renderWithProviders(<BlueprintFlowRouteHarness />)

    await userEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockPrefetchBlueprintManifestFields).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres/blueprint-setup',
    })
  })

  it('should not load manifest fields from the service information route', () => {
    renderWithProviders(
      <BlueprintCreationFlow blueprint={{ ...blueprint, serviceFamily: undefined }} onExit={jest.fn()}>
        <BlueprintServiceInformationSection />
      </BlueprintCreationFlow>
    )

    expect(mockUseBlueprintCatalogServiceManifest).not.toHaveBeenCalled()
  })

  it('should focus the first overrides field after opening overrides from blueprint setup', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderWithProviders(<BlueprintFlowRouteHarness />)

    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.type(await screen.findByLabelText('Db name'), 'production')
    await userEvent.type(screen.getByLabelText('Db username'), 'postgres')
    await userEvent.type(screen.getByLabelText('Db password'), 'super-secret')
    await userEvent.click(screen.getByRole('button', { name: /overrides/i }))

    expect(await screen.findByRole('checkbox', { name: 'Skip final snapshot' })).toHaveFocus()
  })

  it('should navigate to the matching configuration section from summary edit buttons', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(
      <WithBlueprintManifestFields>
        <FillFormValues>
          <BlueprintStepSummary />
        </FillFormValues>
      </WithBlueprintManifestFields>
    )

    await screen.findByText(/custom-postgres/)

    await userEvent.click(screen.getByRole('button', { name: 'Edit service information' }))
    expect(mockNavigate).toHaveBeenLastCalledWith({
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres/service-information',
    })

    await userEvent.click(screen.getByRole('button', { name: 'Edit blueprint setup' }))
    expect(mockNavigate).toHaveBeenLastCalledWith({
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres/blueprint-setup',
    })

    await userEvent.click(screen.getByRole('button', { name: 'Edit overrides' }))
    expect(mockNavigate).toHaveBeenLastCalledWith({
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres/overrides',
    })
  })

  it('should render the summary with the previously filled blueprint values', async () => {
    renderBlueprintFlow(
      <WithBlueprintManifestFields>
        <FillFormValues>
          <BlueprintStepSummary />
        </FillFormValues>
      </WithBlueprintManifestFields>
    )

    expect(screen.getByText('Ready to create your blueprint service')).toBeInTheDocument()
    expect(await screen.findByText(/custom-postgres/)).toBeInTheDocument()
    expect(screen.getByText(/AWS RDS PostgreSQL/)).toBeInTheDocument()
    expect(screen.getByText(/production/)).toBeInTheDocument()
    expect(screen.getAllByText(/postgres/)).toHaveLength(2)
    expect(screen.getByText(/Enabled/)).toBeInTheDocument()
  })

  it('should keep blueprint setup values when moving from configuration to summary', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderWithProviders(<BlueprintFlowRouteHarness />)

    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.type(await screen.findByLabelText('Db name'), 'production')
    await userEvent.type(screen.getByLabelText('Db username'), 'postgres')
    await userEvent.type(screen.getByLabelText('Db password'), 'super-secret')
    await userEvent.click(screen.getByRole('button', { name: /confirm blueprint configuration/i }))

    expect(await screen.findByText('Ready to create your blueprint service')).toBeInTheDocument()
    expect(screen.getByText(/production/)).toBeInTheDocument()
    expect(screen.getByText(/^postgres$/)).toBeInTheDocument()
    expect(screen.getByText(/••••••••/)).toBeInTheDocument()
  })

  it('should send default override values in the create payload when overrides were not opened', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderWithProviders(<BlueprintFlowRouteHarness />)

    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.type(await screen.findByLabelText('Db name'), 'production')
    await userEvent.type(screen.getByLabelText('Db username'), 'postgres')
    await userEvent.type(screen.getByLabelText('Db password'), 'super-secret')
    await userEvent.click(screen.getByRole('button', { name: /confirm blueprint configuration/i }))
    expect(await screen.findByText('Ready to create your blueprint service')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateBlueprint).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            variables: expect.arrayContaining([
              {
                name: 'skip_final_snapshot',
                value: 'true',
                is_secret: false,
              },
            ]),
          }),
        })
      )
    })
  })

  it('should redirect to configuration when summary is opened without required blueprint values', async () => {
    renderBlueprintFlow(
      <WithBlueprintManifestFields>
        <BlueprintStepSummary />
      </WithBlueprintManifestFields>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres/blueprint-setup',
      })
    })
  })

  it('should send blueprint setup fields in the create payload', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(
      <WithBlueprintManifestFields>
        <FillFormValues>
          <BlueprintStepSummary />
        </FillFormValues>
      </WithBlueprintManifestFields>
    )

    await screen.findByText(/custom-postgres/)
    await userEvent.click(screen.getByTestId('button-create-deploy'))

    await waitFor(() => {
      expect(mockCreateBlueprint).toHaveBeenCalledWith({
        environmentId: 'env-1',
        deploy: true,
        payload: {
          name: 'custom-postgres',
          tag: 'aws/postgres/17/1.0.0',
          icon: 'https://cdn.qovery.com/icons/postgresql.svg',
          variables: expect.arrayContaining([
            {
              name: 'db_name',
              value: 'production',
              is_secret: false,
            },
            {
              name: 'db_username',
              value: 'postgres',
              is_secret: false,
            },
            {
              name: 'db_password',
              value: 'super-secret',
              is_secret: true,
            },
            {
              name: 'skip_final_snapshot',
              value: 'true',
              is_secret: false,
            },
          ]),
        },
      })
    })
  })

  it('should sort blueprint versions and send the selected version tag in the create payload', async () => {
    jest.useFakeTimers()
    const versionedBlueprint: BlueprintItem = {
      ...blueprint,
      majorVersions: [
        { serviceVersion: '14', latestTag: 'aws/postgres/14/1.0.0' },
        { serviceVersion: '17', latestTag: 'aws/postgres/17/1.0.0' },
        { serviceVersion: '16', latestTag: 'aws/postgres/16/1.0.0' },
      ],
    }

    const { userEvent } = renderWithProviders(<BlueprintFlowRouteHarness flowBlueprint={versionedBlueprint} />)

    expect(screen.getByText('17')).toBeInTheDocument()
    expect(mockUseBlueprintCatalogServiceManifest).not.toHaveBeenCalled()

    await selectEvent.select(screen.getByLabelText('Blueprint version'), '16')
    expect(mockUseBlueprintCatalogServiceManifest).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByLabelText('Db name')
    await waitFor(() =>
      expect(mockUseBlueprintCatalogServiceManifest).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceVersion: '16',
          suspense: true,
        })
      )
    )
    await userEvent.type(await screen.findByLabelText('Db name'), 'production')
    await userEvent.type(screen.getByLabelText('Db username'), 'postgres')
    await userEvent.type(screen.getByLabelText('Db password'), 'super-secret')
    await userEvent.click(screen.getByRole('button', { name: /confirm blueprint configuration/i }))

    expect(await screen.findByText('Ready to create your blueprint service')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateBlueprint).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            tag: 'aws/postgres/16/1.0.0',
          }),
        })
      )
    })
  })

  it('should start listening for the blueprint service-created event before creating the blueprint', async () => {
    jest.useFakeTimers()
    let resolveCreateBlueprint: (value: { environment_id: string }) => void = jest.fn()
    mockCreateBlueprint.mockImplementationOnce(
      () =>
        new Promise<{ environment_id: string }>((resolve) => {
          resolveCreateBlueprint = resolve
        })
    )

    const { userEvent } = renderBlueprintFlow(
      <WithBlueprintManifestFields>
        <FillFormValues>
          <BlueprintStepSummary />
        </FillFormValues>
      </WithBlueprintManifestFields>
    )

    await screen.findByText(/custom-postgres/)
    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateBlueprint).toHaveBeenCalled()
    })

    const enabledSocketCall = mockUseBlueprintServiceCreatedSocket.mock.calls.find(
      ([props]) =>
        (props as { enabled?: boolean; organizationId?: string; projectId?: string; environmentId?: string })
          .enabled === true
    )
    const enabledSocketCallIndex = mockUseBlueprintServiceCreatedSocket.mock.calls.findIndex(
      ([props]) =>
        (props as { enabled?: boolean; organizationId?: string; projectId?: string; environmentId?: string })
          .enabled === true
    )
    expect(enabledSocketCall?.[0]).toEqual(
      expect.objectContaining({
        organizationId: 'org-1',
        projectId: 'proj-1',
        environmentId: 'env-1',
        enabled: true,
      })
    )
    expect(mockUseBlueprintServiceCreatedSocket.mock.invocationCallOrder[enabledSocketCallIndex]).toBeLessThan(
      mockCreateBlueprint.mock.invocationCallOrder[0]
    )
    expect(mockNavigate).not.toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'proj-1',
        environmentId: 'env-1',
      },
    })

    await act(async () => {
      resolveCreateBlueprint({ environment_id: 'env-1' })
    })
    expect(mockToast).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(29_999)
    })
    expect(mockToast).not.toHaveBeenCalled()

    const socketProps = mockUseBlueprintServiceCreatedSocket.mock.calls.at(-1)?.[0] as {
      onServiceCreated: () => void
    }
    act(() => {
      socketProps.onServiceCreated()
    })

    expect(mockToast).toHaveBeenCalledWith('success', 'Your service has been created')
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'proj-1',
        environmentId: 'env-1',
      },
    })

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(mockToast).toHaveBeenCalledTimes(1)
  })

  it('should complete the blueprint creation flow after a fallback timeout when the websocket event is missed', async () => {
    jest.useFakeTimers()
    let resolveCreateBlueprint: (value: { environment_id: string }) => void = jest.fn()
    mockCreateBlueprint.mockImplementationOnce(
      () =>
        new Promise<{ environment_id: string }>((resolve) => {
          resolveCreateBlueprint = resolve
        })
    )

    const { userEvent } = renderBlueprintFlow(
      <WithBlueprintManifestFields>
        <FillFormValues>
          <BlueprintStepSummary />
        </FillFormValues>
      </WithBlueprintManifestFields>
    )

    await screen.findByText(/custom-postgres/)
    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateBlueprint).toHaveBeenCalled()
    })

    await act(async () => {
      resolveCreateBlueprint({ environment_id: 'env-1' })
    })

    expect(mockToast).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'proj-1',
        environmentId: 'env-1',
      },
    })

    act(() => {
      jest.advanceTimersByTime(30_000)
    })

    expect(mockToast).toHaveBeenCalledWith('success', 'Your service has been created')
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'proj-1',
        environmentId: 'env-1',
      },
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })
})
