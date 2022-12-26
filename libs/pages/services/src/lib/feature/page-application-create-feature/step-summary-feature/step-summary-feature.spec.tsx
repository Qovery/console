import { act, getByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { GitProviderEnum } from 'qovery-typescript-axios'
import * as storeApplication from '@qovery/domains/application'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { RepositoryEntity } from '@qovery/shared/interfaces'
import {
  ApplicationContainerCreateContext,
  ApplicationContainerCreateContextInterface,
} from '../page-application-create-feature'
import StepSummaryFeature from './step-summary-feature'

import SpyInstance = jest.SpyInstance

const mockRepositories: RepositoryEntity[] = [
  {
    url: 'https://github.com/Qovery/test_http_server.git',
    provider: GitProviderEnum.GITHUB,
    name: 'Qovery/test_http_server',
    id: '1',
    branches: {
      loadingStatus: 'loaded',
      items: [],
    },
  },
]

jest.mock('@qovery/domains/organization', () => ({
  ...jest.requireActual('@qovery/domains/organization'),
  selectAllRepository: () => mockRepositories,
}))

jest.mock('@qovery/domains/application', () => {
  return {
    ...jest.requireActual('@qovery/domains/application'),
    createApplication: jest.fn(),
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

const mockContext: ApplicationContainerCreateContextInterface = {
  currentStep: 1,
  setCurrentStep: jest.fn(),
  generalData: { name: 'test', serviceType: ServiceTypeEnum.APPLICATION },
  setGeneralData: jest.fn(),
  resourcesData: {
    memory: 512,
    cpu: [0.5],
    instances: [1, 12],
  },
  setResourcesData: jest.fn(),
  setPortData: jest.fn(),
  portData: {
    ports: [
      {
        application_port: 80,
        external_port: 443,
        is_public: true,
      },
    ],
  },
}

describe('PageApplicationPostFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ApplicationContainerCreateContext.Provider value={mockContext}>
        <StepSummaryFeature />
      </ApplicationContainerCreateContext.Provider>
    )

    expect(baseElement).toBeTruthy()
  })

  it('should dispatch createApplication with good payload', async () => {
    const createApplicationSpy: SpyInstance = jest.spyOn(storeApplication, 'createApplication')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { baseElement } = render(
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

    const submitButton = getByTestId(baseElement, 'button-create')

    await act(() => {
      submitButton.click()
    })

    expect(createApplicationSpy).toHaveBeenCalledWith({
      environmentId: '',
      data: {
        name: 'test',
        description: '',
        ports: [{ internal_port: 80, external_port: 443, publicly_accessible: true, protocol: 'HTTP' }],
        cpu: 500,
        memory: 512,
        min_running_instances: 1,
        max_running_instances: 12,
        build_mode: 'BUILDPACKS',
        git_repository: { url: 'https://github.com/Qovery/test_http_server.git', root_path: '/', branch: 'master' },
        buildpack_language: 'JAVA',
      },
      serviceType: 'APPLICATION',
    })
  })

  it('should dispatch createApplication for container with good payload', async () => {
    const createApplicationSpy: SpyInstance = jest.spyOn(storeApplication, 'createApplication')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { baseElement } = render(
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

    const submitButton = getByTestId(baseElement, 'button-create')

    await act(() => {
      submitButton.click()
    })

    expect(createApplicationSpy).toHaveBeenCalledWith({
      environmentId: '',
      data: {
        name: 'test',
        description: '',
        ports: [{ internal_port: 80, external_port: 443, publicly_accessible: true, protocol: 'HTTP' }],
        cpu: 500,
        memory: 512,
        min_running_instances: 1,
        max_running_instances: 12,
        arguments: ['test'],
        registry_id: '123',
        image_name: '456',
        tag: '789',
        entrypoint: '/',
      },
      serviceType: 'CONTAINER',
    })
  })
})
