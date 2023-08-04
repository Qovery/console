import { render } from '__tests__/utils/setup-jest'
import { PortProtocolEnum } from 'qovery-typescript-axios'
import { isMatchingHealthCheck } from '@qovery/shared/console-shared'
import { applicationFactoryMock } from '@qovery/shared/factories'
import CrudModalFeature, { CrudModalFeatureProps, handleSubmit } from './crud-modal-feature'

const mockedIsMatchingHealthCheck = jest.mocked(isMatchingHealthCheck)

jest.mock('@qovery/shared/console-shared', () => ({
  ...jest.requireActual('@qovery/shared/console-shared'),
  isMatchingHealthCheck: jest.fn(),
}))

const application = applicationFactoryMock(1)[0]

const props: CrudModalFeatureProps = {
  port: application.ports?.[0],
  application: application,
  projectId: '0',
  onClose: jest.fn(),
}

describe('CrudModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit a new port', () => {
    const app = handleSubmit(
      {
        internal_port: '520',
        external_port: '340',
        publicly_accessible: false,
        name: 'p520',
        protocol: PortProtocolEnum.HTTP,
      },
      application
    )
    expect(app.ports).toHaveLength(2)
  })

  it('should submit a edit port', () => {
    mockedIsMatchingHealthCheck.mockReturnValueOnce(false).mockReturnValueOnce(false)
    const app = handleSubmit(
      {
        internal_port: '52',
        external_port: '340',
        publicly_accessible: false,
        name: 'p520',
        protocol: PortProtocolEnum.HTTP,
      },
      application,
      application.ports?.[0]
    )
    expect(app.ports).toHaveLength(1)
    expect(app).toMatchInlineSnapshot(`
      {
        "auto_preview": false,
        "build_mode": "DOCKER",
        "buildpack_language": "NODE_JS",
        "cpu": 1000,
        "created_at": "5/29/2023",
        "description": "dudoifudeg",
        "dockerfile_path": "geniz",
        "environment": {
          "id": "a423de79-940a-5328-9a47-e525140f87ec",
        },
        "healthchecks": {
          "liveness_probe": undefined,
          "readiness_probe": undefined,
        },
        "id": "0",
        "max_running_instances": 3,
        "maximum_cpu": 10,
        "maximum_memory": 10,
        "memory": 1024,
        "min_running_instances": 1,
        "name": "Amy Maxwell",
        "ports": [
          {
            "external_port": undefined,
            "internal_port": 52,
            "name": "p520",
            "protocol": "HTTP",
            "publicly_accessible": false,
          },
        ],
        "storage": [
          {
            "id": "5f52f6ff-bba8-5d88-977e-483f3e3109ff",
            "mount_point": "",
            "size": 10,
            "type": "FAST_SSD",
          },
        ],
        "updated_at": "1/28/2024",
      }
    `)
  })

  it('should submit a edit port matching a liveness_probe healthcheck', () => {
    mockedIsMatchingHealthCheck.mockReturnValueOnce(true).mockReturnValueOnce(false)
    application.healthchecks = {
      liveness_probe: {
        type: {
          http: {
            port: 80,
          },
        },
      },
    }
    const app = handleSubmit(
      {
        internal_port: '52',
        external_port: '340',
        publicly_accessible: false,
        name: 'p520',
        protocol: PortProtocolEnum.HTTP,
      },
      application,
      application.ports?.[0]
    )
    expect(app.ports).toHaveLength(1)
    expect(app).toMatchInlineSnapshot(`
      {
        "auto_preview": false,
        "build_mode": "DOCKER",
        "buildpack_language": "NODE_JS",
        "cpu": 1000,
        "created_at": "5/29/2023",
        "description": "dudoifudeg",
        "dockerfile_path": "geniz",
        "environment": {
          "id": "a423de79-940a-5328-9a47-e525140f87ec",
        },
        "healthchecks": {
          "liveness_probe": {
            "type": {
              "http": {
                "port": 52,
              },
            },
          },
          "readiness_probe": undefined,
        },
        "id": "0",
        "max_running_instances": 3,
        "maximum_cpu": 10,
        "maximum_memory": 10,
        "memory": 1024,
        "min_running_instances": 1,
        "name": "Amy Maxwell",
        "ports": [
          {
            "external_port": undefined,
            "internal_port": 52,
            "name": "p520",
            "protocol": "HTTP",
            "publicly_accessible": false,
          },
        ],
        "storage": [
          {
            "id": "5f52f6ff-bba8-5d88-977e-483f3e3109ff",
            "mount_point": "",
            "size": 10,
            "type": "FAST_SSD",
          },
        ],
        "updated_at": "1/28/2024",
      }
    `)
  })

  it('should submit a edit port matching a readiness_probe healthcheck', () => {
    mockedIsMatchingHealthCheck.mockReturnValueOnce(false).mockReturnValueOnce(true)
    application.healthchecks = {
      readiness_probe: {
        type: {
          http: {
            port: 80,
          },
        },
      },
    }
    const app = handleSubmit(
      {
        internal_port: '52',
        external_port: '340',
        publicly_accessible: false,
        name: 'p520',
        protocol: PortProtocolEnum.HTTP,
      },
      application,
      application.ports?.[0]
    )
    expect(app.ports).toHaveLength(1)
    expect(app).toMatchInlineSnapshot(`
      {
        "auto_preview": false,
        "build_mode": "DOCKER",
        "buildpack_language": "NODE_JS",
        "cpu": 1000,
        "created_at": "5/29/2023",
        "description": "dudoifudeg",
        "dockerfile_path": "geniz",
        "environment": {
          "id": "a423de79-940a-5328-9a47-e525140f87ec",
        },
        "healthchecks": {
          "liveness_probe": undefined,
          "readiness_probe": {
            "type": {
              "http": {
                "port": 52,
              },
            },
          },
        },
        "id": "0",
        "max_running_instances": 3,
        "maximum_cpu": 10,
        "maximum_memory": 10,
        "memory": 1024,
        "min_running_instances": 1,
        "name": "Amy Maxwell",
        "ports": [
          {
            "external_port": undefined,
            "internal_port": 52,
            "name": "p520",
            "protocol": "HTTP",
            "publicly_accessible": false,
          },
        ],
        "storage": [
          {
            "id": "5f52f6ff-bba8-5d88-977e-483f3e3109ff",
            "mount_point": "",
            "size": 10,
            "type": "FAST_SSD",
          },
        ],
        "updated_at": "1/28/2024",
      }
    `)
  })
})
