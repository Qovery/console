import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ServiceList, type ServiceListProps } from './service-list'

jest.mock('../hooks/use-services/use-services', () => ({
  useServices: () => ({
    data: [
      {
        id: '037c9e87-e098-4970-8b1f-9a5ffe9e4b89',
        created_at: '2023-10-25T09:00:13.39717Z',
        updated_at: '2023-11-07T14:59:35.236987Z',
        environment: {
          id: '55867c71-56f9-4b4f-ab22-5904c9dbafda',
        },
        auto_preview: true,
        maximum_cpu: 3560,
        maximum_memory: 15411,
        name: 'FRONT-END',
        description: '',
        build_mode: 'DOCKER',
        dockerfile_path: 'Dockerfile',
        arguments: [],
        entrypoint: '',
        cpu: 60,
        memory: 51,
        min_running_instances: 2,
        max_running_instances: 5,
        storage: [],
        ports: [
          {
            internal_port: 80,
            external_port: 443,
            publicly_accessible: true,
            is_default: true,
            protocol: 'HTTP',
            name: 'p80',
            id: '58ed34d3-96f4-4ae0-b7c9-42a39e309b42',
          },
        ],
        healthchecks: {
          readiness_probe: {
            type: {
              tcp: {
                host: null,
                port: 80,
              },
              http: null,
              exec: null,
              grpc: null,
            },
            initial_delay_seconds: 30,
            period_seconds: 10,
            timeout_seconds: 1,
            success_threshold: 1,
            failure_threshold: 3,
          },
          liveness_probe: {
            type: {
              tcp: {
                host: null,
                port: 80,
              },
              http: null,
              exec: null,
              grpc: null,
            },
            initial_delay_seconds: 30,
            period_seconds: 10,
            timeout_seconds: 5,
            success_threshold: 1,
            failure_threshold: 3,
          },
        },
        git_repository: {
          has_access: true,
          deployed_commit_id: '2f7444836bb506dc0a4eaade5e4d41906ff7a125',
          deployed_commit_date: '2023-10-25T09:27:38.683105Z',
          deployed_commit_contributor: 'TAGS_NOT_IMPLEMENTED',
          deployed_commit_tag: 'TAGS_NOT_IMPLEMENTED',
          provider: 'GITHUB',
          owner: 'acarranoqovery',
          url: 'https://github.com/acarranoqovery/javascript-tetris.git',
          name: 'acarranoqovery/javascript-tetris',
          branch: 'master',
          root_path: '/',
          git_token_id: null,
          git_token_name: null,
        },
        auto_deploy: false,
        service_type: 'APPLICATION',
        serviceType: 'APPLICATION',
        runningStatus: {
          stateLabel: 'Stopped',
        },
        deploymentStatus: {
          id: '037c9e87-e098-4970-8b1f-9a5ffe9e4b89',
          state: 'STOPPED',
          service_deployment_status: 'UP_TO_DATE',
          last_deployment_date: '2023-10-25T10:13:49.067185Z',
          is_part_last_deployment: false,
          steps: null,
          stateLabel: 'Stopped',
          execution_id: 'exec-1',
        },
      },
      {
        id: '04308de2-af27-405f-9e95-570fa94ed577',
        created_at: '2023-10-25T09:13:34.703734Z',
        updated_at: '2023-10-25T10:02:11.563876Z',
        environment: {
          id: '55867c71-56f9-4b4f-ab22-5904c9dbafda',
        },
        registry: {
          id: 'dce719f0-f75c-4eba-a857-0a55ecfd0f36',
          name: 'DockerHub Public',
          url: 'https://docker.io',
          kind: 'DOCKER_HUB',
        },
        image_name: 'stefanprodan/podinfo',
        tag: '6.5.2',
        arguments: [],
        entrypoint: '',
        auto_preview: true,
        maximum_cpu: 16000,
        maximum_memory: 16384,
        name: 'back-end-A',
        description: '',
        cpu: 49,
        memory: 512,
        min_running_instances: 1,
        max_running_instances: 2,
        storage: [],
        ports: [
          {
            internal_port: 9898,
            external_port: null,
            publicly_accessible: false,
            is_default: true,
            protocol: 'HTTP',
            name: 'p9898',
            id: '2d70a00b-68ad-4046-991c-eda7955d1ca0',
          },
        ],
        healthchecks: {
          readiness_probe: {
            type: {
              tcp: {
                host: null,
                port: 9898,
              },
              http: null,
              exec: null,
              grpc: null,
            },
            initial_delay_seconds: 30,
            period_seconds: 10,
            timeout_seconds: 1,
            success_threshold: 1,
            failure_threshold: 3,
          },
          liveness_probe: {
            type: {
              tcp: {
                host: null,
                port: 9898,
              },
              http: null,
              exec: null,
              grpc: null,
            },
            initial_delay_seconds: 30,
            period_seconds: 10,
            timeout_seconds: 5,
            success_threshold: 1,
            failure_threshold: 3,
          },
        },
        auto_deploy: true,
        service_type: 'CONTAINER',
        serviceType: 'CONTAINER',
        runningStatus: {
          stateLabel: 'Stopped',
        },
        deploymentStatus: {
          id: '04308de2-af27-405f-9e95-570fa94ed577',
          state: 'STOPPED',
          service_deployment_status: 'UP_TO_DATE',
          last_deployment_date: '2023-10-25T10:14:08.195400Z',
          is_part_last_deployment: false,
          steps: null,
          stateLabel: 'Stopped',
        },
      },
      {
        id: 'ebd8be35-d7a2-4d4f-ad82-de4378a83ef4',
        created_at: '2023-10-25T09:41:45.64201Z',
        updated_at: '2023-10-25T10:02:11.46764Z',
        environment: {
          id: '55867c71-56f9-4b4f-ab22-5904c9dbafda',
        },
        name: 'CRONJOB',
        description: '',
        auto_preview: true,
        cpu: 50,
        memory: 51,
        max_nb_restart: 0,
        max_duration_seconds: 300,
        port: null,
        source: {
          docker: {
            git_repository: {
              has_access: true,
              deployed_commit_id: '10ad354df8d25a2c818a927eabbf6290079eb1a8',
              deployed_commit_date: '2023-10-25T09:41:45.645279Z',
              deployed_commit_contributor: 'TAGS_NOT_IMPLEMENTED',
              deployed_commit_tag: 'TAGS_NOT_IMPLEMENTED',
              provider: 'GITHUB',
              owner: 'acarranoqovery',
              url: 'https://github.com/acarranoqovery/test_script.git',
              name: 'acarranoqovery/test_script',
              branch: 'main',
              root_path: '/',
              git_token_id: null,
              git_token_name: null,
            },
            dockerfile_path: 'Dockerfile',
          },
        },
        job_type: 'CRON',
        schedule: {
          cronjob: {
            arguments: ['python', 'cronjob.py'],
            scheduled_at: '* * * * *',
            timezone: 'Etc/UTC',
          },
        },
        maximum_cpu: 16000,
        maximum_memory: 16384,
        auto_deploy: true,
        healthchecks: {
          readiness_probe: null,
          liveness_probe: null,
        },
        service_type: 'JOB',
        serviceType: 'JOB',
        runningStatus: {
          stateLabel: 'Stopped',
        },
        deploymentStatus: {
          id: 'ebd8be35-d7a2-4d4f-ad82-de4378a83ef4',
          state: 'STOPPED',
          service_deployment_status: 'UP_TO_DATE',
          last_deployment_date: '2023-10-25T10:14:02.510717Z',
          is_part_last_deployment: false,
          steps: null,
          stateLabel: 'Stopped',
        },
      },
      {
        id: '33962e52-7883-42fd-8613-85e04229a9b6',
        created_at: '2023-10-25T09:54:12.919499Z',
        updated_at: '2023-10-25T10:02:11.546463Z',
        environment: {
          id: '55867c71-56f9-4b4f-ab22-5904c9dbafda',
        },
        name: 'seed_script',
        description: '',
        auto_preview: true,
        cpu: 500,
        memory: 512,
        max_nb_restart: 0,
        max_duration_seconds: 300,
        port: null,
        source: {
          docker: {
            git_repository: {
              has_access: true,
              deployed_commit_id: '10ad354df8d25a2c818a927eabbf6290079eb1a8',
              deployed_commit_date: '2023-10-25T09:54:12.924016Z',
              deployed_commit_contributor: 'TAGS_NOT_IMPLEMENTED',
              deployed_commit_tag: 'TAGS_NOT_IMPLEMENTED',
              provider: 'GITHUB',
              owner: 'acarranoqovery',
              url: 'https://github.com/acarranoqovery/test_script.git',
              name: 'acarranoqovery/test_script',
              branch: 'main',
              root_path: '/',
              git_token_id: null,
              git_token_name: null,
            },
            dockerfile_path: 'Dockerfile',
          },
        },
        job_type: 'LIFECYCLE',
        schedule: {
          on_start: {
            arguments: ['job.py'],
            entrypoint: 'python',
          },
        },
        maximum_cpu: 16000,
        maximum_memory: 16384,
        auto_deploy: true,
        healthchecks: {
          readiness_probe: null,
          liveness_probe: null,
        },
        service_type: 'JOB',
        serviceType: 'JOB',
        runningStatus: {
          stateLabel: 'Stopped',
        },
        deploymentStatus: {
          id: '33962e52-7883-42fd-8613-85e04229a9b6',
          state: 'READY',
          service_deployment_status: 'UP_TO_DATE',
          last_deployment_date: '2023-10-25T10:14:16.632050Z',
          is_part_last_deployment: false,
          steps: null,
          stateLabel: 'Never deployed',
        },
      },
    ],
    isLoading: false,
    error: {},
  }),
}))

jest.mock('../hooks/use-commits/use-commits', () => ({
  useCommits: () => ({
    data: [
      {
        created_at: '2023-09-28T06:42:32Z',
        git_commit_id: 'ddd1cee35762e9b4bb95633c22193393ca3bb384',
        message: 'refactor(ui): rename legacy button props (#863)',
        tag: 'staging',
        author_name: 'GitHub',
        author_avatar_url: 'https://avatars.githubusercontent.com/u/19864447?v=4',
        commit_page_url: 'https://github.com/Qovery/console/commit/ddd1cee35762e9b4bb95633c22193393ca3bb384',
      },
      {
        created_at: '2023-09-27T14:58:59Z',
        git_commit_id: '136b77f8a57026d1f4760edc84dc8999a5334f97',
        message: 'refactor(ui): rename legacy button types (#862)',
        tag: 'staging',
        author_name: 'GitHub',
        author_avatar_url: 'https://avatars.githubusercontent.com/u/19864447?v=4',
        commit_page_url: 'https://github.com/Qovery/console/commit/136b77f8a57026d1f4760edc84dc8999a5334f97',
      },
    ],
    isLoading: false,
    error: null,
  }),
}))

jest.mock('../hooks/use-service-type/use-service-type', () => ({
  useServiceType: () => ({
    data: 'APPLICATION',
  }),
}))

jest.mock('../hooks/use-links/use-links', () => ({
  useLinks: () => ({
    data: [
      {
        url: 'https://qovery.com',
        internal_port: 8080,
      },
    ],
  }),
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const serviceListProps: ServiceListProps = {
  environment: {
    id: '55867c71-56f9-4b4f-ab22-5904c9dbafda',
    created_at: '2023-10-25T08:52:25.777048Z',
    updated_at: '2023-10-25T08:52:25.77705Z',
    name: 'production',
    organization: {
      id: '1',
    },
    project: {
      id: 'cf021d82-2c5e-41de-96eb-eb69c022eddc',
    },
    cloud_provider: {
      provider: 'AWS',
      cluster: 'eu-west-3',
    },
    mode: 'PRODUCTION',
    cluster_id: 'c531a994-603f-4edf-86cd-bdaea66a46a9',
    cluster_name: 'Undeletable_cluster',
  },
}

describe('ServiceList', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ServiceList {...serviceListProps} />)
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot', () => {
    const now = new Date('2023-11-13T12:00:00Z')
    jest.useFakeTimers()
    jest.setSystemTime(now)
    const { container } = renderWithProviders(<ServiceList {...serviceListProps} />)
    expect(container).toMatchSnapshot()
    jest.useRealTimers()
  })
  it('should display all services', () => {
    renderWithProviders(<ServiceList {...serviceListProps} />)
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(5)
  })
  it('should filter services by name', async () => {
    const { userEvent } = renderWithProviders(<ServiceList {...serviceListProps} />)
    await userEvent.click(screen.getAllByRole('button', { name: /service/i })[0])
    await userEvent.click(screen.getByRole('menuitem', { name: /front-end/i }))
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(2)
  })
  it('should navigate to service on row click', async () => {
    const { userEvent } = renderWithProviders(<ServiceList {...serviceListProps} />)
    const rows = screen.getAllByRole('row')
    await userEvent.click(rows[1])

    expect(mockNavigate).toHaveBeenCalledWith(
      '/organization/1/project/cf021d82-2c5e-41de-96eb-eb69c022eddc/environment/55867c71-56f9-4b4f-ab22-5904c9dbafda/application/037c9e87-e098-4970-8b1f-9a5ffe9e4b89/services/general'
    )
  })
  it('should navigate to service live logs on service status click', () => {
    renderWithProviders(<ServiceList {...serviceListProps} />)
    expect(screen.getAllByRole('link', { name: /stopped/i })[0]).toHaveAttribute(
      'href',
      '/organization/1/project/cf021d82-2c5e-41de-96eb-eb69c022eddc/environment/55867c71-56f9-4b4f-ab22-5904c9dbafda/application/037c9e87-e098-4970-8b1f-9a5ffe9e4b89/services/general'
    )
  })
})
