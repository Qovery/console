import { type PropsWithChildren, useEffect, useState } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import {
  ApplicationContainerCreationFlow,
  useApplicationContainerCreateContext,
} from '../../application-container-creation-flow'
import { ApplicationContainerStepSummary } from './step-summary'

const mockNavigate = jest.fn()
const mockCreateService = jest.fn()
const mockImportVariables = jest.fn()
const mockDeployService = jest.fn()
const mockEditAdvancedSettings = jest.fn()
const mockCapture = jest.fn()

jest.mock('posthog-js', () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}))

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({
    organizationId: 'org-1',
    projectId: 'proj-1',
    environmentId: 'env-1',
    slug: 'application',
  }),
  useSearch: () => ({
    template: 'nextjs',
    option: 'current',
  }),
  useNavigate: () => mockNavigate,
}))

jest.mock('@qovery/domains/variables/feature', () => ({
  useImportVariables: () => ({ mutateAsync: mockImportVariables }),
}))

jest.mock('../../../../hooks/use-create-service/use-create-service', () => ({
  useCreateService: () => ({ mutateAsync: mockCreateService }),
}))

jest.mock('../../../../hooks/use-deploy-service/use-deploy-service', () => ({
  useDeployService: () => ({ mutateAsync: mockDeployService }),
}))

jest.mock('../../../../hooks/use-edit-advanced-settings/use-edit-advanced-settings', () => ({
  useEditAdvancedSettings: () => ({ mutateAsync: mockEditAdvancedSettings }),
}))

function SummaryFixture({ autoscalingMode = 'NONE' }: PropsWithChildren<{ autoscalingMode?: 'NONE' | 'HPA' }>) {
  const { generalForm, resourcesForm, portForm, variablesForm } = useApplicationContainerCreateContext()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    generalForm.reset({
      name: 'console-app',
      serviceType: 'APPLICATION',
      auto_deploy: true,
      repository: 'https://github.com/Qovery/console',
      branch: 'staging',
      root_path: '/',
      dockerfile_path: 'Dockerfile',
    })
    resourcesForm.reset({
      cpu: 500,
      memory: 512,
      gpu: 0,
      min_running_instances: 1,
      max_running_instances: 2,
      autoscaling_mode: autoscalingMode,
      hpa_metric_type: 'CPU',
      hpa_cpu_average_utilization_percent: 60,
    })
    portForm.reset({
      ports: [
        {
          application_port: 3000,
          is_public: true,
          protocol: 'HTTP',
          external_port: 443,
          name: 'web',
        },
      ],
      healthchecks: undefined,
    })
    variablesForm.reset({
      variables: [
        {
          variable: 'NODE_ENV',
          value: 'production',
          scope: 'APPLICATION',
          isSecret: false,
        },
      ],
    })
    setReady(true)
  }, [autoscalingMode, generalForm, portForm, resourcesForm, variablesForm])

  if (!ready) {
    return null
  }

  return <ApplicationContainerStepSummary selectedRegistryName="Docker Hub" annotationsGroup={[]} labelsGroup={[]} />
}

describe('ApplicationContainerStepSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateService.mockResolvedValue({ id: 'service-1' })
    mockImportVariables.mockResolvedValue(undefined)
    mockDeployService.mockResolvedValue(undefined)
    mockEditAdvancedSettings.mockResolvedValue(undefined)
  })

  it('renders summary and creates the service', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application">
        <SummaryFixture />
      </ApplicationContainerCreationFlow>
    )

    expect(screen.getByTestId('funnel-body-content')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ready to create your Application' })).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('button-create'))

    await waitFor(() => {
      expect(mockCreateService).toHaveBeenCalledWith({
        environmentId: 'env-1',
        payload: expect.objectContaining({
          serviceType: 'APPLICATION',
          name: 'console-app',
        }),
      })
    })

    expect(mockImportVariables).toHaveBeenCalledWith({
      serviceType: 'APPLICATION',
      serviceId: 'service-1',
      variableImportRequest: {
        overwrite: true,
        vars: [
          {
            name: 'NODE_ENV',
            value: 'production',
            scope: 'APPLICATION',
            is_secret: false,
          },
        ],
      },
    })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
      params: {
        organizationId: 'org-1',
        projectId: 'proj-1',
        environmentId: 'env-1',
      },
    })
    expect(mockCapture).toHaveBeenCalledWith('create-service', {
      selectedServiceType: 'application',
      selectedServiceSubType: 'current',
    })
  })

  it('deploys after create when create and deploy is clicked', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreationFlow creationFlowUrl="/organization/org-1/project/proj-1/environment/env-1/service/create/application">
        <SummaryFixture autoscalingMode="HPA" />
      </ApplicationContainerCreationFlow>
    )

    await userEvent.click(screen.getByTestId('button-create-deploy'))

    await waitFor(() => {
      expect(mockDeployService).toHaveBeenCalledWith({
        serviceId: 'service-1',
        serviceType: 'APPLICATION',
      })
    })

    expect(mockEditAdvancedSettings).toHaveBeenCalledWith({
      serviceId: 'service-1',
      payload: expect.objectContaining({
        serviceType: 'APPLICATION',
      }),
    })
  })
})
