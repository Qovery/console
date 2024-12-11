import { environmentFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { ServiceListActionBar } from './service-list-action-bar'

const [environmentMock] = environmentFactoryMock(1)

const rows = [
  {
    id: 'ebb84aa8-91c2-40fb-916d-3a158db354b7',
    created_at: '2023-04-12T08:48:51.801049Z',
    updated_at: '2024-02-12T08:58:17.393871Z',
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
      deployed_commit_id: 'c9060913d45641782915b3b6871805362e7d3632',
      deployed_commit_date: '2024-02-12T08:52:58.046779Z',
      deployed_commit_contributor: 'TAGS_NOT_IMPLEMENTED',
      deployed_commit_tag: 'TAGS_NOT_IMPLEMENTED',
      provider: 'GITHUB',
      owner: 'acarranoqovery',
      url: 'https://github.com/Qovery/console.git',
      name: 'Qovery/console',
      branch: 'staging',
      root_path: '/',
      git_token_id: null,
      git_token_name: null,
    },
    auto_deploy: true,
    serviceType: 'APPLICATION',
    runningStatus: {
      id: 'ebb84aa8-91c2-40fb-916d-3a158db354b7',
      state: 'RUNNING',
      pods: [
        {
          name: 'app-zebb84aa8-5b77d7c589-25hvh',
          state: 'RUNNING',
          state_reason: '',
          state_message: '',
          restart_count: 0,
          containers: [
            {
              name: 'app-zebb84aa8',
              image:
                '880317640327.dkr.ecr.eu-west-3.amazonaws.com/zebb84aa8:14451187545962569101-c9060913d45641782915b3b6871805362e7d3632',
              restart_count: 0,
              current_state: {
                state: 'RUNNING',
                started_at: 1707728267000,
                state_reason: null,
                state_message: null,
              },
              last_terminated_state: null,
            },
          ],
          started_at: 1707728265000,
          service_version: 'c9060913d45641782915b3b6871805362e7d3632',
        },
      ],
      certificates: [],
      stateLabel: 'Running',
    },
    deploymentStatus: {
      id: 'ebb84aa8-91c2-40fb-916d-3a158db354b7',
      state: 'DEPLOYED',
      service_deployment_status: 'UP_TO_DATE',
      last_deployment_date: '2024-02-12T08:58:58.191789Z',
      is_part_last_deployment: true,
      steps: {
        total_duration_sec: 49,
        total_computing_duration_sec: 35,
        details: [
          {
            step_name: 'BUILD_QUEUEING',
            status: 'SUCCESS',
            duration_sec: 0,
          },
          {
            step_name: 'REGISTRY_CREATE_REPOSITORY',
            status: 'SKIP',
            duration_sec: 0,
          },
          {
            step_name: 'GIT_CLONE',
            status: 'SUCCESS',
            duration_sec: 0,
          },
          {
            step_name: 'BUILD',
            status: 'SKIP',
            duration_sec: 0,
          },
          {
            step_name: 'DEPLOYMENT_QUEUEING',
            status: 'SUCCESS',
            duration_sec: 0,
          },
          {
            step_name: 'DEPLOYMENT',
            status: 'SUCCESS',
            duration_sec: 20,
          },
          {
            step_name: 'ROUTER_DEPLOYMENT',
            status: 'SUCCESS',
            duration_sec: 15,
          },
        ],
      },
      stateLabel: 'Deployed',
    },
  },
]

describe('ServiceListActionBar', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <ServiceListActionBar environment={environmentMock} selectedRows={[]} resetRowSelection={jest.fn()} />
    )
    expect(baseElement).toBeTruthy()
  })
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(
      <ServiceListActionBar environment={environmentMock} selectedRows={rows} resetRowSelection={jest.fn()} />
    )
    expect(baseElement).toMatchSnapshot()
  })
})
