import { useParams } from '@tanstack/react-router'
import { act, within } from '@testing-library/react'
import type { BlueprintItem, BlueprintManifestResponseResultsInner } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  BlueprintConfigurationView,
  BlueprintCreationFlow,
  BlueprintStepSummary,
  useBlueprintCreateContext,
} from './blueprint-creation-flow'

const mockNavigate = jest.fn()
const mockUseSearch = jest.fn()
const mockUseBlueprintCatalogServiceManifest = jest.fn()
const mockUseBlueprintCatalogServiceReadme = jest.fn()
const mockUseBlueprintServiceCreatedSocket = jest.fn()
const mockCreateBlueprint = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
  useSearch: () => mockUseSearch(),
}))

jest.mock('@qovery/shared/ui', () => {
  const actual = jest.requireActual('@qovery/shared/ui')
  return {
    ...actual,
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

  useEffect(() => {
    form.setValue('serviceName', 'custom-postgres')
    form.setValue('fields', {
      db_name: 'production',
      db_username: 'postgres',
      db_password: 'super-secret',
      skip_final_snapshot: true,
    })
  }, [form])

  return children
}

function BlueprintFlowRouteHarness() {
  const [step, setStep] = useState<'configuration' | 'summary'>('configuration')

  useEffect(() => {
    mockNavigate.mockImplementation((options: { to?: string }) => {
      if (options.to?.endsWith('/summary')) {
        setStep('summary')
      }
    })
  }, [])

  return (
    <BlueprintCreationFlow blueprint={blueprint} onExit={jest.fn()}>
      {step === 'configuration' ? <BlueprintConfigurationView /> : <BlueprintStepSummary />}
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
    mockUseBlueprintCatalogServiceManifest.mockReturnValue({ data: manifestFields })
    mockUseBlueprintCatalogServiceReadme.mockReturnValue({
      data: {
        content: '# AWS RDS PostgreSQL\n\nBlueprint documentation',
        repository_url: 'https://github.com/qovery-blueprints/postgres',
      },
    })
    mockCreateBlueprint.mockResolvedValue({ environment_id: 'env-1' })
    mockUseSearch.mockReturnValue({})
  })

  it('should open the blueprint details drawer from the configuration header', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(<BlueprintConfigurationView />)

    await userEvent.click(screen.getByRole('button', { name: 'AWS RDS PostgreSQL' }))

    const dialog = await screen.findByRole('dialog', { name: 'AWS RDS PostgreSQL' })

    expect(dialog).toHaveTextContent('Managed PostgreSQL database.')
    expect(dialog).toHaveTextContent('Blueprint documentation')
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole('link', { name: 'Deploy blueprint' })).not.toBeInTheDocument()
  })

  it('should navigate to the blueprint summary from the confirm blueprint configuration button', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(<BlueprintConfigurationView />)

    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.type(await screen.findByLabelText('Db name'), 'production')
    await userEvent.type(screen.getByLabelText('Db username'), 'postgres')
    await userEvent.type(screen.getByLabelText('Db password'), 'super-secret')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm blueprint configuration/i }))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres/summary',
    })
  })

  it('should focus the first blueprint setup field after continuing from service information', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(<BlueprintConfigurationView />)

    await userEvent.type(screen.getByLabelText('Service name'), 'custom-postgres')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByLabelText('Db name')).toHaveFocus()
  })

  it('should not load manifest fields when a blueprint has no service family', () => {
    renderWithProviders(
      <BlueprintCreationFlow blueprint={{ ...blueprint, serviceFamily: undefined }} onExit={jest.fn()}>
        <BlueprintConfigurationView />
      </BlueprintCreationFlow>
    )

    expect(mockUseBlueprintCatalogServiceManifest).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'AWS',
        serviceFamily: '',
        enabled: false,
      })
    )
  })

  it('should focus the first overrides field after continuing from blueprint setup', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(<BlueprintConfigurationView />)

    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.type(await screen.findByLabelText('Db name'), 'production')
    await userEvent.type(screen.getByLabelText('Db username'), 'postgres')
    await userEvent.type(screen.getByLabelText('Db password'), 'super-secret')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByRole('checkbox', { name: 'Skip final snapshot' })).toHaveFocus()
  })

  it('should open the requested configuration section from route search', async () => {
    mockUseSearch.mockReturnValue({ section: 'overrides' })

    renderBlueprintFlow(<BlueprintConfigurationView />)

    expect(await screen.findByText(/Use overrides to customize how your service is built or run/)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Skip final snapshot' })).toBeInTheDocument()
  })

  it('should fallback to service information when the route search section is invalid', () => {
    mockUseSearch.mockReturnValue({ section: 'unknown-section' })

    renderBlueprintFlow(<BlueprintConfigurationView />)

    expect(screen.getByLabelText('Service name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Db name')).not.toBeInTheDocument()
    expect(screen.queryByText(/Use overrides to customize how your service is built or run/)).not.toBeInTheDocument()
  })

  it('should update the current section when the route search section changes to a valid section', async () => {
    mockUseSearch.mockReturnValue({})

    const { rerender } = renderBlueprintFlow(<BlueprintConfigurationView />)

    expect(screen.getByLabelText('Service name')).toBeInTheDocument()

    mockUseSearch.mockReturnValue({ section: 'blueprint-setup' })
    rerender(
      <BlueprintCreationFlow blueprint={blueprint} onExit={jest.fn()}>
        <BlueprintConfigurationView />
      </BlueprintCreationFlow>
    )

    expect(await screen.findByLabelText('Db name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Service name')).not.toBeInTheDocument()
  })

  it('should navigate to the matching configuration section from summary edit buttons', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(
      <FillFormValues>
        <BlueprintStepSummary />
      </FillFormValues>
    )

    await screen.findByText(/custom-postgres/)

    await userEvent.click(screen.getByRole('button', { name: 'Edit service information' }))
    expect(mockNavigate).toHaveBeenLastCalledWith({
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres',
      search: { section: 'service-information' },
    })

    await userEvent.click(screen.getByRole('button', { name: 'Edit blueprint setup' }))
    expect(mockNavigate).toHaveBeenLastCalledWith({
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres',
      search: { section: 'blueprint-setup' },
    })

    await userEvent.click(screen.getByRole('button', { name: 'Edit overrides' }))
    expect(mockNavigate).toHaveBeenLastCalledWith({
      to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres',
      search: { section: 'overrides' },
    })
  })

  it('should render the summary with the previously filled blueprint values', async () => {
    renderBlueprintFlow(
      <FillFormValues>
        <BlueprintStepSummary />
      </FillFormValues>
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
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm blueprint configuration/i }))

    expect(await screen.findByText('Ready to create your blueprint service')).toBeInTheDocument()
    expect(screen.getByText(/production/)).toBeInTheDocument()
    expect(screen.getByText(/^postgres$/)).toBeInTheDocument()
    expect(screen.getByText(/••••••••/)).toBeInTheDocument()
  })

  it('should redirect to configuration when summary is opened without required blueprint values', async () => {
    renderBlueprintFlow(<BlueprintStepSummary />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organization/org-1/project/proj-1/environment/env-1/service/create/blueprint/AWS/postgres',
      })
    })
  })

  it('should send blueprint setup fields in the create payload', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(
      <FillFormValues>
        <BlueprintStepSummary />
      </FillFormValues>
    )

    await screen.findByText(/custom-postgres/)
    await userEvent.click(screen.getByTestId('button-create-deploy'))

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

  it('should start listening for the blueprint service-created event before leaving the creation flow', async () => {
    jest.useFakeTimers()

    const { userEvent } = renderBlueprintFlow(
      <FillFormValues>
        <BlueprintStepSummary />
      </FillFormValues>
    )

    await screen.findByText(/custom-postgres/)
    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockUseBlueprintServiceCreatedSocket).toHaveBeenLastCalledWith(
        expect.objectContaining({
          organizationId: 'org-1',
          projectId: 'proj-1',
          environmentId: 'env-1',
          enabled: true,
        })
      )
    })
    expect(mockNavigate).not.toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'proj-1',
        environmentId: 'env-1',
      },
    })

    const socketProps = mockUseBlueprintServiceCreatedSocket.mock.calls.at(-1)?.[0] as {
      onServiceCreated: () => void
    }
    act(() => {
      socketProps.onServiceCreated()
    })

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
