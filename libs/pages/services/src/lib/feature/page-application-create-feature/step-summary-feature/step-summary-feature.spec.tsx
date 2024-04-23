import { PortProtocolEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import {
  ApplicationContainerCreateContext,
  type ApplicationContainerCreateContextInterface,
} from '../page-application-create-feature'
import StepSummaryFeature from './step-summary-feature'

const mockCreateService = jest.fn()

jest.mock('@qovery/domains/services/feature', () => ({
  useCreateService: () => ({
    mutateAsync: mockCreateService,
  }),
  useAddAnnotationsGroup: () => ({
    mutate: jest.fn(),
  }),
  useDeployService: () => ({
    mutate: jest.fn(),
  }),
}))

const mockContext: Required<ApplicationContainerCreateContextInterface> = {
  currentStep: 1,
  setCurrentStep: jest.fn(),
  generalData: { name: 'test', serviceType: ServiceTypeEnum.APPLICATION, auto_deploy: true },
  setGeneralData: jest.fn(),
  resourcesData: {
    memory: 512,
    cpu: 500,
    min_running_instances: 1,
    max_running_instances: 12,
  },
  setResourcesData: jest.fn(),
  setPortData: jest.fn(),
  portData: {
    ports: [
      {
        application_port: 80,
        external_port: 443,
        is_public: true,
        protocol: PortProtocolEnum.HTTP,
        name: 'p80',
      },
    ],
  },
}

describe('PageApplicationPostFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ApplicationContainerCreateContext.Provider value={mockContext}>
        <StepSummaryFeature />
      </ApplicationContainerCreateContext.Provider>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should create an application with good payload', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreateContext.Provider
        value={{
          ...mockContext,
          generalData: {
            ...mockContext.generalData,
            name: 'test',
            serviceType: ServiceTypeEnum.APPLICATION,
            provider: 'GITHUB',
            build_mode: 'BUILDPACKS',
            dockerfile_path: 'Dockerfile',
            repository: 'Qovery/test_http_server',
            branch: 'master',
            root_path: '/',
            buildpack_language: 'JAVA',
          },
        }}
      >
        <StepSummaryFeature />
      </ApplicationContainerCreateContext.Provider>
    )

    const submitButton = screen.getByTestId('button-create')
    await userEvent.click(submitButton)

    expect(mockCreateService).toHaveBeenCalledWith({
      environmentId: '',
      payload: {
        serviceType: 'APPLICATION',
        name: 'test',
        description: '',
        arguments: undefined,
        entrypoint: '',
        ports: [{ internal_port: 80, external_port: 443, publicly_accessible: true, protocol: 'HTTP', name: 'p80' }],
        cpu: 500,
        memory: 512,
        min_running_instances: 1,
        max_running_instances: 12,
        build_mode: 'BUILDPACKS',
        git_repository: { url: 'https://github.com/Qovery/test_http_server.git', root_path: '/', branch: 'master' },
        buildpack_language: 'JAVA',
        healthchecks: {},
        auto_deploy: true,
      },
    })
  })

  it('should create a container with good payload', async () => {
    const { userEvent } = renderWithProviders(
      <ApplicationContainerCreateContext.Provider
        value={{
          ...mockContext,
          generalData: {
            ...mockContext.generalData,
            name: 'test',
            description: '',
            serviceType: ServiceTypeEnum.CONTAINER,
            cmd_arguments: '["test"]',
            cmd: ['test'],
            registry: '123',
            image_name: '456',
            image_tag: '789',
            image_entry_point: '/',
          },
        }}
      >
        <StepSummaryFeature />
      </ApplicationContainerCreateContext.Provider>
    )

    const submitButton = screen.getByTestId('button-create')
    await userEvent.click(submitButton)

    expect(mockCreateService).toHaveBeenCalledWith({
      environmentId: '',
      payload: {
        serviceType: 'CONTAINER',
        name: 'test',
        description: '',
        healthchecks: {},
        ports: [{ internal_port: 80, external_port: 443, publicly_accessible: true, protocol: 'HTTP', name: 'p80' }],
        cpu: 500,
        memory: 512,
        min_running_instances: 1,
        max_running_instances: 12,
        arguments: ['test'],
        registry_id: '123',
        image_name: '456',
        tag: '789',
        entrypoint: '/',
        auto_deploy: true,
        annotations_groups: [],
      },
    })
  })
})
