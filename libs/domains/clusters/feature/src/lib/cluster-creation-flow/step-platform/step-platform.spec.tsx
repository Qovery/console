import {
  CloudProviderEnum,
  type PlatformCloudVendor,
  type PlatformComponentConfigurationPreviewRequest,
  type PlatformTemplateSummaryResponse,
} from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ClusterContainerCreateContext,
  type ClusterContainerCreateContextInterface,
  defaultResourcesData,
} from '../cluster-creation-flow'
import { StepPlatform } from './step-platform'

const mockSetCurrentStep = jest.fn()
const mockSetPlatformConfigurationData = jest.fn()
const mockOnPrevious = jest.fn()
const mockOnSubmit = jest.fn()
const mockUsePlatformTemplates = jest.fn()
const mockUsePlatformTemplateComponentConfiguration = jest.fn()

interface ResolverHookProps {
  componentKey?: string
  cloudProvider?: PlatformCloudVendor
  request: PlatformComponentConfigurationPreviewRequest
}

const mockTemplate = {
  key: 'qovery-cluster-v0',
  version: '0.1.0',
  status: 'PUBLISHED',
  layers: [
    {
      key: 'log-infrastructure',
      mandatory: false,
      enabledByDefault: true,
      modes: ['CUSTOMER_MANAGED'],
      providers: ['AWS'],
      componentKeys: ['loki'],
      components: [
        {
          key: 'loki',
          kind: 'HELM',
          fields: [
            {
              key: 'retention',
              type: 'number',
              required: true,
              defaultValue: '4',
              label: 'Retention period',
              sensitive: false,
              constraints: { min: 1, max: 52 },
            },
            {
              key: 'highAvailability',
              type: 'bool',
              required: true,
              defaultValue: 'false',
              label: 'High availability',
              sensitive: false,
              constraints: {},
            },
            {
              key: 'storage',
              type: 'string',
              required: true,
              defaultValue: 'pvc',
              label: 'Storage',
              sensitive: false,
              constraints: { allowedValues: ['pvc', 's3'] },
            },
          ],
        },
      ],
    },
  ],
} satisfies PlatformTemplateSummaryResponse

const mockGcpTemplate = {
  ...mockTemplate,
  layers: mockTemplate.layers.map((layer) => ({
    ...layer,
    providers: ['GCP'],
    components: layer.components.map((component) => ({
      ...component,
      fields: component.fields.map((field) =>
        field.key === 'storage' ? { ...field, constraints: { allowedValues: ['pvc', 'gcs'] } } : field
      ),
    })),
  })),
} satisfies PlatformTemplateSummaryResponse

function createMockContextValue(cloudProvider = CloudProviderEnum.AWS): ClusterContainerCreateContextInterface {
  return {
    currentStep: 2,
    setCurrentStep: mockSetCurrentStep,
    generalData: {
      name: 'test-cluster',
      cloud_provider: cloudProvider,
      region: 'eu-west-3',
      installation_type: 'SELF_MANAGED',
    },
    setGeneralData: jest.fn(),
    resourcesData: defaultResourcesData,
    setResourcesData: jest.fn(),
    featuresData: { vpc_mode: undefined, features: {} },
    setFeaturesData: jest.fn(),
    kubeconfigData: undefined,
    setKubeconfigData: jest.fn(),
    addonsData: { kedaActivated: false, secretManagers: [] },
    setAddonsData: jest.fn(),
    platformConfigurationData: undefined,
    setPlatformConfigurationData: mockSetPlatformConfigurationData,
    isEngineV2SelfManaged: true,
    creationFlowUrl: '/organization/org-123/cluster/create/aws-self-managed',
  }
}

let mockContextValue = createMockContextValue()

function Wrapper({ children }: PropsWithChildren) {
  return (
    <ClusterContainerCreateContext.Provider value={mockContextValue}>{children}</ClusterContainerCreateContext.Provider>
  )
}

jest.mock('../../platform-configuration/hooks/use-platform-template-component-configuration', () => ({
  usePlatformTemplateComponentConfiguration: (props: unknown) => mockUsePlatformTemplateComponentConfiguration(props),
}))

jest.mock('../../platform-configuration/hooks/use-platform-templates', () => ({
  usePlatformTemplates: (props: unknown) => mockUsePlatformTemplates(props),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDebounce: (value: unknown) => value,
}))

describe('StepPlatform', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockContextValue = createMockContextValue()
    mockUsePlatformTemplates.mockReturnValue({ data: [mockTemplate], isLoading: false, isError: false })
    mockUsePlatformTemplateComponentConfiguration.mockImplementation(
      ({ componentKey, cloudProvider, request }: ResolverHookProps) => {
        const fields =
          cloudProvider === 'GCP'
            ? mockGcpTemplate.layers[0].components[0].fields
            : mockTemplate.layers[0].components[0].fields
        const requirements =
          request.profileConfig?.storage === 'gcs'
            ? [
                {
                  key: 'infra.gcsBucketName',
                  type: 'string',
                  scope: 'CLUSTER',
                  label: 'GCS bucket name',
                  required: true,
                  sensitive: false,
                  constraints: {},
                  status: request.clusterInputs?.['infra.gcsBucketName'] ? 'READY' : 'MISSING',
                },
                {
                  key: 'infra.gcpServiceAccountEmail',
                  type: 'string',
                  scope: 'CLUSTER',
                  label: 'GCP service account email',
                  required: true,
                  sensitive: false,
                  constraints: {},
                  status: request.clusterInputs?.['infra.gcpServiceAccountEmail'] ? 'READY' : 'MISSING',
                },
              ]
            : []

        return {
          data: componentKey
            ? { componentKey, fields, requirements, componentBindings: [], violations: [] }
            : undefined,
          isError: false,
          isFetching: false,
        }
      }
    )
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('opens Loki configuration and stores edited values in the binding draft', async () => {
    const { userEvent } = renderWithProviders(
      <StepPlatform organizationId="org-123" onPrevious={mockOnPrevious} onSubmit={mockOnSubmit} />,
      { wrapper: Wrapper }
    )

    expect(mockUsePlatformTemplates).toHaveBeenCalledWith({
      organizationId: 'org-123',
      clusterMode: 'CUSTOMER_MANAGED',
      cloudProvider: 'AWS',
    })

    await userEvent.click(screen.getByRole('button', { name: 'Loki HELM' }))

    expect(screen.getByLabelText('High availability')).not.toBeChecked()
    expect(screen.getByText('pvc')).toBeInTheDocument()

    const retentionInput = screen.getByLabelText('Retention period')
    await userEvent.clear(retentionInput)
    await userEvent.type(retentionInput, '12')
    const saveButton = screen.getByRole('button', { name: 'Save configuration' })
    await waitFor(() => expect(saveButton).toBeEnabled())
    await userEvent.click(saveButton)

    expect(mockSetPlatformConfigurationData).toHaveBeenLastCalledWith({
      templateKey: mockTemplate.key,
      templateVersion: mockTemplate.version,
      layerSelections: { 'log-infrastructure': true },
      managedConfig: { loki: { retention: 12 } },
      customerProvidedInputs: {},
    })
  })

  it('displays and stores GCS runtime inputs selected during cluster creation', async () => {
    mockContextValue = createMockContextValue(CloudProviderEnum.GCP)
    mockUsePlatformTemplates.mockReturnValue({ data: [mockGcpTemplate], isLoading: false, isError: false })
    const { userEvent } = renderWithProviders(
      <StepPlatform organizationId="org-123" onPrevious={mockOnPrevious} onSubmit={mockOnSubmit} />,
      { wrapper: Wrapper }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Loki HELM' }))
    await selectEvent.select(screen.getByLabelText('Storage'), 'gcs')

    const bucketInput = screen.getByLabelText('GCS bucket name')
    const serviceAccountInput = screen.getByLabelText('GCP service account email')
    await userEvent.type(bucketInput, 'qovery-loki-logs')
    await userEvent.type(serviceAccountInput, 'loki@qovery.iam.gserviceaccount.com')

    const saveButton = screen.getByRole('button', { name: 'Save configuration' })
    await waitFor(() => expect(saveButton).toBeEnabled())
    await userEvent.click(saveButton)

    expect(mockSetPlatformConfigurationData).toHaveBeenLastCalledWith({
      templateKey: mockGcpTemplate.key,
      templateVersion: mockGcpTemplate.version,
      layerSelections: { 'log-infrastructure': true },
      managedConfig: { loki: { storage: 'gcs' } },
      customerProvidedInputs: {
        loki: {
          'infra.gcsBucketName': 'qovery-loki-logs',
          'infra.gcpServiceAccountEmail': 'loki@qovery.iam.gserviceaccount.com',
        },
      },
    })
  })
})
