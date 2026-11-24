import axios from 'axios'
import download from 'downloadjs'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { Modal } from '@qovery/shared/ui'
import { act, renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useAvailableContainerRegistries } from '../hooks/use-available-container-registries/use-available-container-registries'
import { useClusterOperatorBootstrap } from '../hooks/use-cluster-operator-bootstrap/use-cluster-operator-bootstrap'
import { useClusterOperatorStatus } from '../hooks/use-cluster-operator-status/use-cluster-operator-status'
import { useCreateSelfManagedCluster } from '../hooks/use-create-self-managed-cluster/use-create-self-managed-cluster'
import { usePlatformTemplateComponentConfiguration } from '../hooks/use-platform-template-component-configuration/use-platform-template-component-configuration'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { SelfManagedClusterCreationFlow } from './self-managed-cluster-creation-flow'

const mockNavigate = jest.fn()

jest.mock('downloadjs', () => jest.fn())
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDebounce: <T,>(value: T) => value,
}))
jest.mock('@tanstack/react-router', () => {
  const React = jest.requireActual('react')
  return {
    ...jest.requireActual('@tanstack/react-router'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ organizationId: 'org-123' }),
    Link: React.forwardRef(
      ({ children, ...props }: { children?: React.ReactNode }, ref: React.Ref<HTMLAnchorElement>) =>
        React.createElement('a', { ref, ...props }, children)
    ),
  }
})
jest.mock('../hooks/use-platform-templates/use-platform-templates')
jest.mock('../hooks/use-create-self-managed-cluster/use-create-self-managed-cluster')
jest.mock('../hooks/use-cluster-operator-status/use-cluster-operator-status')
jest.mock('../hooks/use-cluster-operator-bootstrap/use-cluster-operator-bootstrap')
jest.mock('../hooks/use-platform-template-component-configuration/use-platform-template-component-configuration')
jest.mock('../hooks/use-available-container-registries/use-available-container-registries')

const useCloudProvidersMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviders') as jest.Mock
const useCloudProviderCredentialsMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderCredentials') as jest.Mock
const useEnsureOnPremiseCredentialMockSpy = jest.spyOn(
  cloudProvidersDomain,
  'useEnsureOnPremiseCredential'
) as jest.Mock
const mockUsePlatformTemplates = usePlatformTemplates as jest.Mock
const mockUseCreateSelfManagedCluster = useCreateSelfManagedCluster as jest.Mock
const mockUseClusterOperatorStatus = useClusterOperatorStatus as jest.Mock
const mockUseClusterOperatorBootstrap = useClusterOperatorBootstrap as jest.Mock
const mockUsePlatformTemplateComponentConfiguration = usePlatformTemplateComponentConfiguration as jest.Mock
const mockUseAvailableContainerRegistries = useAvailableContainerRegistries as jest.Mock
const mockDownload = download as jest.Mock
const mockCreateSelfManagedCluster = jest.fn()
const mockEnsureOnPremiseCredential = jest.fn()
const mockOnClose = jest.fn()

const HELM_COMMAND =
  'helm upgrade --install qovery-operator oci://registry/qovery-operator --version 1.0.0 --namespace qovery --create-namespace --atomic --wait --timeout 15m -f values.yaml'

const operatorComponent = {
  key: 'qovery-operator',
  kind: 'HELM',
  fields: [
    {
      key: 'cpuArchitectures',
      label: 'CPU architectures',
      type: 'string',
      required: false,
      sensitive: false,
      constraints: { allowedValues: ['AMD64', 'ARM64'] },
    },
    {
      key: 'nodeSelectorKey',
      label: 'Node group label key',
      description: 'Node label key selecting where the Operator and its Engine worker Jobs run.',
      type: 'string',
      required: false,
      sensitive: false,
      defaultValue: 'eks.amazonaws.com/nodegroup',
      constraints: {},
    },
    {
      key: 'nodeSelectorValue',
      label: 'Node group label value',
      type: 'string',
      required: false,
      sensitive: false,
      constraints: {},
    },
  ],
}

async function fillGeneralStep(userEvent: ReturnType<typeof renderWithProviders>['userEvent']) {
  await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
  await selectEvent.select(screen.getByLabelText('Credentials'), 'creds', { container: document.body })
  await selectEvent.select(screen.getByLabelText('Region'), 'Paris (eu-west-3)', { container: document.body })
  // Validation runs asynchronously on change.
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
}

async function goToOperatorStep(userEvent: ReturnType<typeof renderWithProviders>['userEvent']) {
  await fillGeneralStep(userEvent)
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await screen.findByRole('heading', { name: 'Configure Qovery Operator' })
}

async function goToOnPremiseOperatorStep(
  userEvent: ReturnType<typeof renderWithProviders>['userEvent'],
  registry: { username?: string; password?: string } = {}
) {
  await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
  await userEvent.type(screen.getByLabelText('Registry url'), 'https://registry.example.com:5000')
  if (registry.username && registry.password) {
    await selectEvent.select(screen.getByLabelText('Login type'), 'Account', { container: document.body })
    await userEvent.type(screen.getByLabelText('Username'), registry.username)
    await userEvent.type(screen.getByLabelText('Password'), registry.password)
  }
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await screen.findByRole('heading', { name: 'Configure Qovery Operator' })
}

describe('SelfManagedClusterCreationFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCloudProvidersMockSpy.mockReturnValue({
      data: [
        {
          name: 'AWS',
          short_name: CloudProviderEnum.AWS,
          regions: [{ name: 'eu-west-3', city: 'Paris', country_code: 'FR' }],
        },
      ],
    })
    useCloudProviderCredentialsMockSpy.mockReturnValue({ data: [{ id: 'credential-id', name: 'creds' }] })
    mockUsePlatformTemplates.mockReturnValue({
      data: [{ key: 'qovery-cluster-v0', version: '1.0.0', layers: [], bootstrapComponent: operatorComponent }],
      isLoading: false,
      isSuccess: true,
      isError: false,
      refetch: jest.fn(),
    })
    mockUsePlatformTemplateComponentConfiguration.mockReturnValue({
      data: {
        componentKey: 'qovery-operator',
        fields: operatorComponent.fields,
        requirements: [],
        componentBindings: [],
        violations: [],
      },
      isFetching: false,
      isError: false,
    })
    mockCreateSelfManagedCluster.mockResolvedValue({ id: 'cluster-id' })
    mockUseCreateSelfManagedCluster.mockReturnValue({ mutateAsync: mockCreateSelfManagedCluster, isLoading: false })
    mockEnsureOnPremiseCredential.mockResolvedValue({ id: 'on-premise-credential-id', name: 'On-premise clusters' })
    useEnsureOnPremiseCredentialMockSpy.mockReturnValue({
      mutateAsync: mockEnsureOnPremiseCredential,
      isLoading: false,
    })
    mockUseClusterOperatorStatus.mockReturnValue({ data: { operator_connected: false } })
    mockUseAvailableContainerRegistries.mockReturnValue({
      data: ['ECR', 'DOCKER_HUB', 'GENERIC_CR', 'GITHUB_CR', 'GITHUB_ENTERPRISE_CR', 'GITLAB_CR'].map((kind) => ({
        kind,
      })),
    })
    mockUseClusterOperatorBootstrap.mockReturnValue({
      data: { values_yaml: 'secret: values', helm_command: HELM_COMMAND },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    })
  })

  it('enables Continue once the name, credentials and region are set', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    expect(screen.getByRole('heading', { name: 'Connect AWS cluster' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await fillGeneralStep(userEvent)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('keeps the general values when going back from the Operator step', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByLabelText('Cluster name')).toHaveValue('my-cluster')
  })

  it('renders the Operator fields of the template bootstrap component, without the demo-only ones', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByLabelText('Node group label key')).toHaveValue('eks.amazonaws.com/nodegroup')
    expect(screen.getByLabelText('Node group label value')).toHaveValue('')
    expect(screen.queryByText('CPU architectures')).not.toBeInTheDocument()
  })

  it('shows the API-resolved value for read-only Operator fields', async () => {
    mockUsePlatformTemplateComponentConfiguration.mockReturnValue({
      data: {
        componentKey: 'qovery-operator',
        fields: operatorComponent.fields.map((field) =>
          field.key === 'nodeSelectorKey' ? { ...field, readOnly: true } : field
        ),
        resolvedValues: { nodeSelectorKey: 'resolved-node-group' },
        requirements: [],
        componentBindings: [],
        violations: [],
      },
      isFetching: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByLabelText('Node group label key')).toHaveValue('resolved-node-group')
    expect(screen.getByLabelText('Node group label key')).toBeDisabled()
    expect(screen.getByLabelText('Node group label value')).toBeEnabled()
  })

  it('alerts about violations that no displayed field can show', async () => {
    mockUsePlatformTemplateComponentConfiguration.mockReturnValue({
      data: {
        componentKey: 'qovery-operator',
        fields: operatorComponent.fields,
        requirements: [],
        componentBindings: [],
        violations: [{ fieldPath: 'unknownSetting', code: 'INVALID', message: 'The template is invalid.' }],
      },
    })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByRole('alert')).toHaveTextContent('The template is invalid.')
  })

  it.each([
    { type: 'object', fields: [] },
    { type: 'array', items: { type: 'string', constraints: {} } },
  ])('shows an alert for errors on unsupported $type fields', async (schema) => {
    mockUsePlatformTemplateComponentConfiguration.mockReturnValue({
      data: {
        componentKey: 'qovery-operator',
        fields: [
          ...operatorComponent.fields,
          {
            key: 'extraSettings',
            label: 'Extra settings',
            required: true,
            sensitive: false,
            constraints: {},
            ...schema,
          },
        ],
        requirements: [],
        componentBindings: [],
        violations: [{ fieldPath: 'extraSettings', code: 'REQUIRED', message: 'Extra settings must be configured.' }],
      },
      isFetching: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByRole('alert')).toHaveTextContent('Extra settings must be configured.')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('validates the Operator configuration against the template', async () => {
    mockUsePlatformTemplateComponentConfiguration.mockReturnValue({
      data: {
        componentKey: 'qovery-operator',
        fields: operatorComponent.fields,
        requirements: [],
        componentBindings: [],
        violations: [{ fieldPath: 'nodeSelectorValue', code: 'PATTERN', message: 'Invalid label value.' }],
      },
    })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByText('Invalid label value.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(mockUsePlatformTemplateComponentConfiguration).toHaveBeenLastCalledWith(
      expect.objectContaining({
        templateKey: 'qovery-cluster-v0',
        componentKey: 'qovery-operator',
        clusterMode: 'CUSTOMER_MANAGED',
        cloudProvider: 'AWS',
        request: {
          profileConfig: { nodeSelectorKey: 'eks.amazonaws.com/nodegroup' },
          clusterInputs: {},
          componentOutputs: {},
        },
      })
    )
  })

  it.each([
    ['has not been checked yet', { data: undefined, isFetching: true, isError: false }],
    ['is being checked again', { data: { componentKey: 'qovery-operator', violations: [] }, isFetching: true }],
    ['could not be checked', { data: undefined, isFetching: false, isError: true }],
    [
      'is waiting for the network',
      { data: { componentKey: 'qovery-operator', violations: [], requirements: [] }, isPaused: true },
    ],
    [
      'only has the result of previous values',
      { data: { componentKey: 'qovery-operator', violations: [], requirements: [] }, isPreviousData: true },
    ],
    [
      'misses a required input',
      {
        data: {
          componentKey: 'qovery-operator',
          violations: [],
          requirements: [{ key: 'clusterName', source: 'CLUSTER_INPUT', status: 'MISSING' }],
        },
        isFetching: false,
        isError: false,
      },
    ],
  ])('cannot continue while the Operator configuration %s', async (_, preview) => {
    mockUsePlatformTemplateComponentConfiguration.mockReturnValue(preview)
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('creates the cluster with the Operator configuration', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.type(screen.getByLabelText('Node group label value'), 'stable')
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockCreateSelfManagedCluster).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterRequest: {
        name: 'my-cluster',
        production: false,
        provider: 'AWS',
        region: 'eu-west-3',
        credentials: { id: 'credential-id' },
        platform: {
          managedConfig: {
            'qovery-operator': { nodeSelectorKey: 'eks.amazonaws.com/nodegroup', nodeSelectorValue: 'stable' },
          },
        },
      },
    })
    expect(await screen.findByRole('heading', { name: 'Install Qovery Operator' })).toBeInTheDocument()
  })

  it('connects a cluster of another provider with its credentials, regions and platform template', async () => {
    useCloudProvidersMockSpy.mockReturnValue({
      data: [
        {
          name: 'AWS',
          short_name: CloudProviderEnum.AWS,
          regions: [{ name: 'eu-west-3', city: 'Paris', country_code: 'FR' }],
        },
        {
          name: 'Scaleway',
          short_name: CloudProviderEnum.SCW,
          regions: [{ name: 'fr-par-1', city: 'Paris', country_code: 'FR' }],
        },
      ],
    })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="SCW" onClose={mockOnClose} />
    )

    expect(screen.getByRole('heading', { name: 'Connect Scaleway cluster' })).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
    await selectEvent.select(screen.getByLabelText('Credentials'), 'creds', { container: document.body })
    await selectEvent.select(screen.getByLabelText('Region'), 'Paris (fr-par-1)', { container: document.body })
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'Configure Qovery Operator' })
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(useCloudProviderCredentialsMockSpy).toHaveBeenCalledWith(expect.objectContaining({ cloudProvider: 'SCW' }))
    expect(mockUsePlatformTemplates).toHaveBeenCalledWith(expect.objectContaining({ cloudProvider: 'SCW' }))
    expect(mockUsePlatformTemplateComponentConfiguration).toHaveBeenLastCalledWith(
      expect.objectContaining({ cloudProvider: 'SCW' })
    )
    expect(mockCreateSelfManagedCluster).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterRequest: expect.objectContaining({ provider: 'SCW', region: 'fr-par-1', production: false }),
    })
  })

  it('sends no Operator configuration when it is left untouched', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockCreateSelfManagedCluster).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterRequest: expect.objectContaining({ platform: {} }),
    })
  })

  it('creates the cluster with the default platform template when none is listed', async () => {
    mockUsePlatformTemplates.mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
      refetch: jest.fn(),
    })
    mockUsePlatformTemplateComponentConfiguration.mockReturnValue({
      data: undefined,
      isFetching: false,
      isError: false,
    })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByText('Qovery installs the Operator with its default configuration.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockCreateSelfManagedCluster).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterRequest: expect.objectContaining({ platform: {} }),
    })
  })

  it('waits for the platform templates before creating the cluster', async () => {
    mockUsePlatformTemplates.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
      refetch: jest.fn(),
    })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('lets a failed Operator configuration check be retried', async () => {
    const refetchPreview = jest.fn()
    mockUsePlatformTemplateComponentConfiguration.mockReturnValue({
      data: undefined,
      isFetching: false,
      isError: true,
      refetch: refetchPreview,
    })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByText('The Operator configuration could not be checked.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(refetchPreview).toHaveBeenCalled()
  })

  it('does not create the cluster when the platform templates cannot be loaded', async () => {
    const refetchTemplates = jest.fn()
    mockUsePlatformTemplates.mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
      isError: true,
      refetch: refetchTemplates,
    })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByText('The Operator configuration could not be loaded.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(refetchTemplates).toHaveBeenCalled()
    expect(mockCreateSelfManagedCluster).not.toHaveBeenCalled()
  })

  it('cannot be cancelled or left while the cluster is being created', async () => {
    mockUseCreateSelfManagedCluster.mockReturnValue({ mutateAsync: mockCreateSelfManagedCluster, isLoading: true })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  it('keeps its modal open while the cluster is being created', async () => {
    let resolveCreation: (cluster: { id: string }) => void = () => undefined
    mockCreateSelfManagedCluster.mockReturnValue(new Promise((resolve) => (resolveCreation = resolve)))
    const setOpen = jest.fn()
    const { userEvent } = renderWithProviders(
      <Modal fakeModal externalOpen setExternalOpen={setOpen}>
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
      </Modal>
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(setOpen).not.toHaveBeenCalled()

    await act(async () => resolveCreation({ id: 'cluster-id' }))
    await screen.findByRole('heading', { name: 'Install Qovery Operator' })
    await userEvent.keyboard('{Escape}')

    expect(setOpen).toHaveBeenCalled()
  })

  it('stays on the Operator step when the creation fails', async () => {
    mockCreateSelfManagedCluster.mockRejectedValue(new Error('Invalid credentials'))
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockCreateSelfManagedCluster).toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Configure Qovery Operator' })).toBeInTheDocument()
  })

  it('gives the Operator bootstrap values file and Helm command', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await screen.findByRole('heading', { name: 'Install Qovery Operator' })

    expect(mockUseClusterOperatorBootstrap).toHaveBeenLastCalledWith({
      organizationId: 'org-123',
      clusterId: 'cluster-id',
    })
    expect(screen.getByText(HELM_COMMAND)).toBeInTheDocument()
    expect(screen.queryByText('secret: values')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Download values.yaml' }))

    expect(mockDownload).toHaveBeenCalledWith('secret: values', 'values.yaml', 'text/yaml')
    expect(mockUseClusterOperatorStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({ organizationId: 'org-123', clusterId: 'cluster-id', refetchInterval: 5000 })
    )
  })

  it('offers to retry when the bootstrap cannot be generated', async () => {
    const refetch = jest.fn()
    mockUseClusterOperatorBootstrap.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch })
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(refetch).toHaveBeenCalled()
  })

  it('redirects only once while the parent keeps re-rendering', async () => {
    function ClusterCreationWithParentState() {
      const [, setCloseCount] = useState(0)
      return (
        <SelfManagedClusterCreationFlow
          organizationId="org-123"
          cloudProvider="AWS"
          onClose={() => {
            mockOnClose()
            setCloseCount((count) => count + 1)
          }}
        />
      )
    }
    const { userEvent } = renderWithProviders(<ClusterCreationWithParentState />)

    await goToOperatorStep(userEvent)
    mockUseClusterOperatorStatus.mockReturnValue({ data: { operator_connected: true } })
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
    expect(mockOnClose).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledTimes(1)
  })

  it('redirects to the cluster profile once the Operator is connected', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    mockUseClusterOperatorStatus.mockReturnValue({ data: { operator_connected: true } })
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/organization/$organizationId/cluster/$clusterId/profile',
        params: { organizationId: 'org-123', clusterId: 'cluster-id' },
      })
    )
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('tells that the install step can be closed', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText(/Your cluster will be available as soon as the Operator is connected/)
    ).toBeInTheDocument()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('sends a single creation request when Enter is pressed again while the cluster is being created', async () => {
    const requestSpy = jest.spyOn(axios, 'request').mockReturnValue(new Promise(() => undefined))
    mockUseCreateSelfManagedCluster.mockImplementation(
      jest.requireActual('../hooks/use-create-self-managed-cluster/use-create-self-managed-cluster')
        .useCreateSelfManagedCluster
    )
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled())

    // The loading button ignores the pointer, not the keyboard.
    screen.getByRole('button', { name: 'Continue' }).focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')

    expect(requestSpy).toHaveBeenCalledTimes(1)
    expect(requestSpy.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      url: expect.stringMatching(/\/organization\/org-123\/selfManagedCluster$/),
    })
    requestSpy.mockRestore()
  })

  it('creates a cloud provider cluster with the selected credential and no registry', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="AWS" onClose={mockOnClose} />
    )

    expect(screen.queryByLabelText('Registry url')).not.toBeInTheDocument()
    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockEnsureOnPremiseCredential).not.toHaveBeenCalled()
    expect(mockCreateSelfManagedCluster.mock.calls).toStrictEqual([
      [
        {
          organizationId: 'org-123',
          clusterRequest: {
            name: 'my-cluster',
            production: false,
            provider: 'AWS',
            region: 'eu-west-3',
            credentials: { id: 'credential-id' },
            platform: {},
          },
        },
      ],
    ])
  })

  describe('on an on-premise provider', () => {
    it.each([
      ['OVH', 'Connect OVH Cloud cluster', 'OVH'],
      ['CIVO', 'Connect CIVO cluster', 'CIVO'],
      ['ORACLE', 'Connect Oracle Cloud Infrastructure cluster', 'ORACLE'],
      ['HETZNER', 'Connect Hetzner cluster', 'HETZNER'],
      ['IBM', 'Connect IBM Cloud cluster', 'IBM'],
      ['ON_PREMISE', 'Connect Kubernetes cluster', 'UNKNOWN'],
    ] as const)(
      'asks for a container registry instead of a credential and a region on %s',
      (provider, title, vendor) => {
        renderWithProviders(
          <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider={provider} onClose={mockOnClose} />
        )

        expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Container registry' })).toBeInTheDocument()
        expect(screen.getByText('GENERIC_CR')).toBeInTheDocument()
        expect(screen.getByLabelText('Registry url')).toHaveValue('')
        expect(screen.queryByLabelText('Registry name')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Description')).not.toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'Deployment target' })).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Credentials')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Region')).not.toBeInTheDocument()
        expect(useCloudProviderCredentialsMockSpy).not.toHaveBeenCalled()
        expect(mockUsePlatformTemplates).toHaveBeenLastCalledWith(
          expect.objectContaining({ clusterMode: 'CUSTOMER_MANAGED', cloudProvider: vendor })
        )
      }
    )

    it('offers only the registry kinds an on-premise cluster accepts', async () => {
      renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      selectEvent.openMenu(screen.getByLabelText('Type'))

      expect(screen.getAllByRole('option').map((option) => option.textContent)).toStrictEqual([
        'DOCKER_HUB',
        'GENERIC_CR',
        'GITHUB_CR',
      ])
    })

    it('requires a cluster name and a registry URL', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
      await waitFor(() => expect(screen.getByLabelText('Cluster name')).toHaveValue('my-cluster'))
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

      await userEvent.type(screen.getByLabelText('Registry url'), 'https://registry.example.com')

      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    })

    it('gives the expected format of a generic registry URL', () => {
      renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      expect(
        screen.getByText('Expected format: https://registry.example.com or https://registry.example.com:5000')
      ).toBeInTheDocument()
    })

    it('refuses a generic registry URL that q-core refuses', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
      await userEvent.type(screen.getByLabelText('Registry url'), 'https://registry.example.com/v2')

      expect(
        await screen.findByText('The registry URL must not contain a path: keep the host and the optional port only.')
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    })

    it('accepts a generic registry URL with a single-label host', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
      await userEvent.type(screen.getByLabelText('Registry url'), 'https://registry:5000')

      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    })

    it('refuses a registry username or password made of spaces', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
      await userEvent.type(screen.getByLabelText('Registry url'), 'https://registry.example.com')
      await selectEvent.select(screen.getByLabelText('Login type'), 'Account', { container: document.body })
      await userEvent.type(screen.getByLabelText('Username'), '   ')
      await userEvent.type(screen.getByLabelText('Password'), '   ')

      expect(await screen.findByText('Please enter a username.')).toBeInTheDocument()
      expect(await screen.findByText('Please enter a password.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    })

    it('enables Continue when the registry is filled before the cluster name', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await userEvent.type(screen.getByLabelText('Registry url'), 'https://registry.example.com')
      await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')

      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    })

    it('empties the registry credentials when the kind changes', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
      await selectEvent.select(screen.getByLabelText('Type'), 'GITHUB_CR', { container: document.body })
      await userEvent.type(screen.getByLabelText('Container registry prefix'), 'qovery')
      await userEvent.type(screen.getByLabelText('Personal Access Token'), 's3cret')
      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())

      await selectEvent.select(screen.getByLabelText('Type'), 'DOCKER_HUB', { container: document.body })

      expect(screen.getByLabelText('Username')).toHaveValue('')
      expect(screen.getByLabelText('Password')).toHaveValue('')
      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())

      await userEvent.type(screen.getByLabelText('Username'), 'qovery')
      await userEvent.type(screen.getByLabelText('Password'), 's3cret')

      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    })

    it('requires the generic registry username and password once the account login is chosen', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
      await userEvent.type(screen.getByLabelText('Registry url'), 'https://registry.example.com')
      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())

      await selectEvent.select(screen.getByLabelText('Login type'), 'Account', { container: document.body })

      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())
      await userEvent.type(screen.getByLabelText('Username'), 'robot')
      expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
      await userEvent.type(screen.getByLabelText('Password'), 's3cret')

      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
    })

    it('creates the cluster with the on-premise credential and the generic registry without credentials', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await goToOnPremiseOperatorStep(userEvent)
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(mockEnsureOnPremiseCredential.mock.calls).toStrictEqual([[{ organizationId: 'org-123' }]])
      expect(mockCreateSelfManagedCluster.mock.calls).toStrictEqual([
        [
          {
            organizationId: 'org-123',
            clusterRequest: {
              name: 'my-cluster',
              production: false,
              provider: 'HETZNER',
              region: 'on-premise',
              credentials: { id: 'on-premise-credential-id' },
              platform: {},
              registry: { kind: 'GENERIC_CR', url: 'https://registry.example.com:5000' },
            },
          },
        ],
      ])
      expect(mockEnsureOnPremiseCredential.mock.invocationCallOrder[0]).toBeLessThan(
        mockCreateSelfManagedCluster.mock.invocationCallOrder[0]
      )
      expect(await screen.findByRole('heading', { name: 'Install Qovery Operator' })).toBeInTheDocument()
    })

    it('creates the cluster with the generic registry credentials of an account login', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="ON_PREMISE" onClose={mockOnClose} />
      )

      await userEvent.click(screen.getByLabelText('Production cluster'))
      await goToOnPremiseOperatorStep(userEvent, { username: 'robot', password: 's3cret' })
      await userEvent.type(screen.getByLabelText('Node group label value'), 'stable')
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(mockCreateSelfManagedCluster.mock.calls).toStrictEqual([
        [
          {
            organizationId: 'org-123',
            clusterRequest: {
              name: 'my-cluster',
              production: true,
              provider: 'ON_PREMISE',
              region: 'on-premise',
              credentials: { id: 'on-premise-credential-id' },
              platform: {
                managedConfig: {
                  'qovery-operator': { nodeSelectorKey: 'eks.amazonaws.com/nodegroup', nodeSelectorValue: 'stable' },
                },
              },
              registry: {
                kind: 'GENERIC_CR',
                url: 'https://registry.example.com:5000',
                credentials: { username: 'robot', password: 's3cret' },
              },
            },
          },
        ],
      ])
    })

    it.each([
      ['GITHUB_CR', 'https://ghcr.io', 'Container registry prefix', 'Personal Access Token'],
      ['DOCKER_HUB', 'https://docker.io', 'Username', 'Password'],
    ])(
      'creates the cluster with a %s registry, whose account login and credentials are required',
      async (kind, url, usernameLabel, passwordLabel) => {
        const { userEvent } = renderWithProviders(
          <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
        )

        await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
        await selectEvent.select(screen.getByLabelText('Type'), kind, { container: document.body })

        expect(screen.getByLabelText('Registry url')).toHaveValue(url)
        expect(screen.getByLabelText('Login type')).toBeDisabled()
        expect(screen.getByText('Account')).toBeInTheDocument()
        await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled())

        await userEvent.type(screen.getByLabelText(usernameLabel), 'qovery')
        await userEvent.type(screen.getByLabelText(passwordLabel), 's3cret')
        await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
        await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
        await screen.findByRole('heading', { name: 'Configure Qovery Operator' })
        await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

        expect(mockCreateSelfManagedCluster).toHaveBeenCalledWith({
          organizationId: 'org-123',
          clusterRequest: expect.objectContaining({
            registry: { kind, url, credentials: { username: 'qovery', password: 's3cret' } },
          }),
        })
      }
    )

    it('keeps the registry values when going back from the Operator step', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await goToOnPremiseOperatorStep(userEvent, { username: 'robot', password: 's3cret' })
      await userEvent.click(screen.getByRole('button', { name: 'Back' }))

      expect(screen.getByLabelText('Registry url')).toHaveValue('https://registry.example.com:5000')
      expect(screen.getByLabelText('Username')).toHaveValue('robot')
      expect(screen.getByLabelText('Password')).toHaveValue('s3cret')
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    })

    it('sends no credentials of another registry kind after going back and changing the kind', async () => {
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await userEvent.type(screen.getByLabelText('Cluster name'), 'my-cluster')
      await selectEvent.select(screen.getByLabelText('Type'), 'GITHUB_CR', { container: document.body })
      await userEvent.type(screen.getByLabelText('Container registry prefix'), 'qovery')
      await userEvent.type(screen.getByLabelText('Personal Access Token'), 'github-token')
      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
      await screen.findByRole('heading', { name: 'Configure Qovery Operator' })
      await userEvent.click(screen.getByRole('button', { name: 'Back' }))

      await selectEvent.select(screen.getByLabelText('Type'), 'DOCKER_HUB', { container: document.body })

      expect(screen.getByLabelText('Username')).toHaveValue('')
      expect(screen.getByLabelText('Password')).toHaveValue('')
      await userEvent.type(screen.getByLabelText('Username'), 'docker-user')
      await userEvent.type(screen.getByLabelText('Password'), 'docker-token')
      await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled())
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
      await screen.findByRole('heading', { name: 'Configure Qovery Operator' })
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(mockCreateSelfManagedCluster).toHaveBeenCalledWith({
        organizationId: 'org-123',
        clusterRequest: expect.objectContaining({
          registry: {
            kind: 'DOCKER_HUB',
            url: 'https://docker.io',
            credentials: { username: 'docker-user', password: 'docker-token' },
          },
        }),
      })
    })

    it('does not create the cluster when the on-premise credential fails, then retries both', async () => {
      mockEnsureOnPremiseCredential.mockRejectedValueOnce(new Error('Forbidden'))
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await goToOnPremiseOperatorStep(userEvent)
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(mockEnsureOnPremiseCredential).toHaveBeenCalledTimes(1)
      expect(mockCreateSelfManagedCluster).not.toHaveBeenCalled()
      expect(screen.getByRole('heading', { name: 'Configure Qovery Operator' })).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(mockEnsureOnPremiseCredential).toHaveBeenCalledTimes(2)
      expect(mockCreateSelfManagedCluster).toHaveBeenCalledTimes(1)
      expect(await screen.findByRole('heading', { name: 'Install Qovery Operator' })).toBeInTheDocument()
    })

    it('stays on the Operator step when the creation fails and retries with the same credential', async () => {
      mockCreateSelfManagedCluster.mockRejectedValueOnce(new Error('registry.url is not a valid URL'))
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await goToOnPremiseOperatorStep(userEvent)
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(mockCreateSelfManagedCluster).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('heading', { name: 'Configure Qovery Operator' })).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

      expect(mockCreateSelfManagedCluster).toHaveBeenCalledTimes(2)
      expect(mockCreateSelfManagedCluster.mock.calls[1][0].clusterRequest.credentials).toStrictEqual({
        id: 'on-premise-credential-id',
      })
      expect(await screen.findByRole('heading', { name: 'Install Qovery Operator' })).toBeInTheDocument()
    })

    it('cannot be cancelled, left or submitted again while the on-premise credential is being prepared', async () => {
      useEnsureOnPremiseCredentialMockSpy.mockReturnValue({
        mutateAsync: mockEnsureOnPremiseCredential,
        isLoading: true,
      })
      const { userEvent } = renderWithProviders(
        <SelfManagedClusterCreationFlow organizationId="org-123" cloudProvider="HETZNER" onClose={mockOnClose} />
      )

      await goToOnPremiseOperatorStep(userEvent)

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()

      // The loading button ignores the pointer, not the keyboard.
      screen.getByRole('button', { name: 'Continue' }).focus()
      await userEvent.keyboard('{Enter}')

      expect(mockEnsureOnPremiseCredential).not.toHaveBeenCalled()
      expect(mockCreateSelfManagedCluster).not.toHaveBeenCalled()
    })
  })
})
