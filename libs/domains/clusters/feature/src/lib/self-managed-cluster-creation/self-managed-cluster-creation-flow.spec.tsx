import download from 'downloadjs'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import selectEvent from 'react-select-event'
import * as cloudProvidersDomain from '@qovery/domains/cloud-providers/feature'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { useClusterOperatorBootstrap } from '../hooks/use-cluster-operator-bootstrap/use-cluster-operator-bootstrap'
import { useClusterOperatorStatus } from '../hooks/use-cluster-operator-status/use-cluster-operator-status'
import { useCreateSelfManagedCluster } from '../hooks/use-create-self-managed-cluster/use-create-self-managed-cluster'
import { usePlatformTemplates } from '../hooks/use-platform-templates/use-platform-templates'
import { usePlatformTemplateComponentConfiguration } from '../platform-configuration/hooks/use-platform-template-component-configuration'
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
jest.mock('../platform-configuration/hooks/use-platform-template-component-configuration')

const useCloudProvidersMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviders') as jest.Mock
const useCloudProviderCredentialsMockSpy = jest.spyOn(cloudProvidersDomain, 'useCloudProviderCredentials') as jest.Mock
const mockUsePlatformTemplates = usePlatformTemplates as jest.Mock
const mockUseCreateSelfManagedCluster = useCreateSelfManagedCluster as jest.Mock
const mockUseClusterOperatorStatus = useClusterOperatorStatus as jest.Mock
const mockUseClusterOperatorBootstrap = useClusterOperatorBootstrap as jest.Mock
const mockUsePlatformTemplateComponentConfiguration = usePlatformTemplateComponentConfiguration as jest.Mock
const mockDownload = download as jest.Mock
const mockCreateSelfManagedCluster = jest.fn()
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
    mockUseClusterOperatorStatus.mockReturnValue({ data: { operator_connected: false } })
    mockUseClusterOperatorBootstrap.mockReturnValue({
      data: { values_yaml: 'secret: values', helm_command: HELM_COMMAND },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    })
  })

  it('enables Continue once the name, credentials and region are set', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
    )

    expect(screen.getByRole('heading', { name: 'Connect AWS cluster' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await fillGeneralStep(userEvent)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('keeps the general values when going back from the Operator step', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByLabelText('Cluster name')).toHaveValue('my-cluster')
  })

  it('renders the Operator fields of the template bootstrap component, without the demo-only ones', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByLabelText('Node group label key')).toHaveValue('eks.amazonaws.com/nodegroup')
    expect(screen.getByLabelText('Node group label value')).toHaveValue('')
    expect(screen.queryByText('CPU architectures')).not.toBeInTheDocument()
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
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
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
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('creates the cluster with the Operator configuration', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.type(screen.getByLabelText('Node group label value'), 'stable')
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockCreateSelfManagedCluster).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterRequest: {
        name: 'my-cluster',
        production: true,
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

  it('sends no Operator configuration when it is left untouched', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
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
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
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
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
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
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
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
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
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
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  it('stays on the Operator step when the creation fails', async () => {
    mockCreateSelfManagedCluster.mockRejectedValue(new Error('Invalid credentials'))
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
    )

    await goToOperatorStep(userEvent)
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(mockCreateSelfManagedCluster).toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Configure Qovery Operator' })).toBeInTheDocument()
  })

  it('gives the Operator bootstrap values file and Helm command', async () => {
    const { userEvent } = renderWithProviders(
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
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
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
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
      <SelfManagedClusterCreationFlow organizationId="org-123" onClose={mockOnClose} />
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
})
