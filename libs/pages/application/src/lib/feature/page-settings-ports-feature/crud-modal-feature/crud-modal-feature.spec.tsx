import { PortProtocolEnum } from 'qovery-typescript-axios'
import { type Application } from '@qovery/domains/services/data-access'
import { isMatchingHealthCheck } from '@qovery/shared/console-shared'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders } from '@qovery/shared/util-tests'
import CrudModalFeature, { type CrudModalFeatureProps, handleSubmit } from './crud-modal-feature'

const mockedIsMatchingHealthCheck = jest.mocked(isMatchingHealthCheck)

jest.mock('@qovery/shared/console-shared', () => ({
  ...jest.requireActual('@qovery/shared/console-shared'),
  isMatchingHealthCheck: jest.fn(),
}))

const application = applicationFactoryMock(1)[0] as Application

const props: CrudModalFeatureProps = {
  port: application.ports?.[0],
  service: application,
  projectId: '0',
  onClose: jest.fn(),
}

describe('CrudModalFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
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
        "annotations_groups": [],
        "auto_preview": false,
        "build_mode": "DOCKER",
        "cpu": 1000,
        "created_at": "5/29/2023",
        "description": "dudoifudeg",
        "dockerfile_path": "geniz",
        "environment": {
          "id": "a423de79-940a-5328-9a47-e525140f87ec",
        },
        "git_repository": {
          "branch": "irved",
          "git_token_id": "5f3e8c0c-4725-540c-b879-c9ae17c71ad3",
          "id": "319a2f9a-19ca-5c2c-9204-301cbc6818f5",
          "name": "Alexander Schmidt",
          "owner": "Cecilia Tyler",
          "provider": "GITHUB",
          "root_path": "juzma",
          "url": "http://wa.tt/pi",
        },
        "healthchecks": {
          "liveness_probe": undefined,
          "readiness_probe": undefined,
        },
        "icon_uri": "app://qovery-console/application",
        "id": "0",
        "labels_groups": [],
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
        "serviceType": "APPLICATION",
        "service_type": "APPLICATION",
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
        protocol: PortProtocolEnum.TCP,
      },
      application,
      application.ports?.[0]
    )
    expect(app.ports).toHaveLength(1)
    expect(app).toMatchInlineSnapshot(`
      {
        "annotations_groups": [],
        "auto_preview": false,
        "build_mode": "DOCKER",
        "cpu": 1000,
        "created_at": "5/29/2023",
        "description": "dudoifudeg",
        "dockerfile_path": "geniz",
        "environment": {
          "id": "a423de79-940a-5328-9a47-e525140f87ec",
        },
        "git_repository": {
          "branch": "irved",
          "git_token_id": "5f3e8c0c-4725-540c-b879-c9ae17c71ad3",
          "id": "319a2f9a-19ca-5c2c-9204-301cbc6818f5",
          "name": "Alexander Schmidt",
          "owner": "Cecilia Tyler",
          "provider": "GITHUB",
          "root_path": "juzma",
          "url": "http://wa.tt/pi",
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
        "icon_uri": "app://qovery-console/application",
        "id": "0",
        "labels_groups": [],
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
            "protocol": "TCP",
            "publicly_accessible": false,
          },
        ],
        "serviceType": "APPLICATION",
        "service_type": "APPLICATION",
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
        "annotations_groups": [],
        "auto_preview": false,
        "build_mode": "DOCKER",
        "cpu": 1000,
        "created_at": "5/29/2023",
        "description": "dudoifudeg",
        "dockerfile_path": "geniz",
        "environment": {
          "id": "a423de79-940a-5328-9a47-e525140f87ec",
        },
        "git_repository": {
          "branch": "irved",
          "git_token_id": "5f3e8c0c-4725-540c-b879-c9ae17c71ad3",
          "id": "319a2f9a-19ca-5c2c-9204-301cbc6818f5",
          "name": "Alexander Schmidt",
          "owner": "Cecilia Tyler",
          "provider": "GITHUB",
          "root_path": "juzma",
          "url": "http://wa.tt/pi",
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
        "icon_uri": "app://qovery-console/application",
        "id": "0",
        "labels_groups": [],
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
        "serviceType": "APPLICATION",
        "service_type": "APPLICATION",
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
