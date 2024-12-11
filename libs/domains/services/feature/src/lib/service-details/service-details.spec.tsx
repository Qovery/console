import { renderWithProviders } from '@qovery/shared/util-tests'
import { ServiceDetails } from './service-details'

jest.mock('../hooks/use-service/use-service', () => ({
  useService: ({
    serviceId,
  }: {
    environmentId: string
    serviceId: 'application-mock' | 'database-mock' | 'job-mock'
  }) => {
    const mocks = {
      'application-mock': {
        id: 'ebb84aa8-91c2-40fb-916d-3a158db354b7',
        created_at: '2023-04-12T08:48:51.801049Z',
        updated_at: '2023-09-28T06:48:09.079032Z',
        environment: {
          id: '28c47145-c8e7-4b9d-8d9e-c65c95b48425',
        },
        auto_preview: true,
        maximum_cpu: 3560,
        maximum_memory: 15411,
        name: 'console',
        description: 'React Application the Qovery Console',
        build_mode: 'DOCKER',
        dockerfile_path: 'Dockerfile',
        arguments: [],
        entrypoint: '',
        cpu: 50,
        memory: 50,
        min_running_instances: 1,
        max_running_instances: 2,
        storage: [],
        ports: [
          {
            internal_port: 80,
            external_port: 443,
            publicly_accessible: true,
            is_default: true,
            protocol: 'HTTP',
            name: 'p80',
            id: '6c9052e8-ebda-439d-bcb2-3b0298d4b51a',
          },
        ],
        healthchecks: {
          readiness_probe: null,
          liveness_probe: null,
        },
        git_repository: {
          has_access: true,
          deployed_commit_id: 'ddd1cee35762e9b4bb95633c22193393ca3bb384',
          deployed_commit_date: '2023-09-28T06:42:35.688665Z',
          deployed_commit_contributor: 'TAGS_NOT_IMPLEMENTED',
          deployed_commit_tag: 'TAGS_NOT_IMPLEMENTED',
          provider: 'GITHUB',
          owner: 'acarranoqovery',
          url: 'https://github.com/Qovery/console.git',
          name: 'Qovery/console',
          branch: 'staging',
          root_path: '/',
        },
        auto_deploy: true,
      },
      'database-mock': {
        id: 'ee3523e9-c81d-42ac-9d0c-f7bc09d5d28c',
        created_at: '2023-07-28T14:50:09.325974Z',
        updated_at: '2023-07-28T14:50:09.325976Z',
        environment: {
          id: '0cd5d05e-0839-48ff-be67-ca3f4fcf8250',
        },
        name: 'containered-posgresSQL-clone',
        description: '',
        type: 'POSTGRESQL',
        version: '15',
        mode: 'CONTAINER',
        disk_encrypted: false,
        accessibility: 'PRIVATE',
        host: 'zee3523e9-postgresql.zc531a994.rustrocks.cloud',
        port: 5432,
        cpu: 500,
        memory: 512,
        storage: 10,
        maximum_cpu: 4000,
        maximum_memory: 16384,
        instance_type: null,
      },
      'job-mock': {
        id: 'c070ebf8-5b82-4d94-8c4d-0c6b86d7c003',
        created_at: '2023-09-12T10:08:39.122972Z',
        updated_at: '2023-09-27T12:17:25.956823Z',
        environment: {
          id: '7aaa3a79-0afa-4d5e-b898-c2bf6f33a01a',
        },
        name: 'test_lifecycle',
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
              deployed_commit_id: 'a82fbbb9ff34784d1b77bebede6c5ac909d3a865',
              deployed_commit_date: '2023-09-22T08:26:53.583504Z',
              deployed_commit_contributor: 'TAGS_NOT_IMPLEMENTED',
              deployed_commit_tag: 'TAGS_NOT_IMPLEMENTED',
              provider: 'GITHUB',
              owner: 'acarranoqovery',
              url: 'https://github.com/acarranoqovery/test_script.git',
              name: 'acarranoqovery/test_script',
              branch: 'main',
              root_path: '/',
            },
            dockerfile_path: 'Dockerfile',
          },
        },
        schedule: {
          on_start: {
            arguments: ['job.py'],
          },
        },
        maximum_cpu: 16000,
        maximum_memory: 16384,
        auto_deploy: false,
        healthchecks: {
          readiness_probe: null,
          liveness_probe: null,
        },
      },
    }
    return {
      data: mocks[serviceId],
      isLoading: false,
      error: null,
    }
  },
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

describe('ServiceDetails', () => {
  const now = new Date('2023-09-29:00:00Z')

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(now)
  })

  it('should match database snapshot', () => {
    const { baseElement } = renderWithProviders(<ServiceDetails environmentId="1" serviceId="database-mock" />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should match application snapshot', () => {
    const { baseElement } = renderWithProviders(<ServiceDetails environmentId="1" serviceId="application-mock" />)
    expect(baseElement).toMatchSnapshot()
  })
  it('should match job snapshot', () => {
    const { baseElement } = renderWithProviders(<ServiceDetails environmentId="1" serviceId="job-mock" />)
    expect(baseElement).toMatchSnapshot()
  })
})
