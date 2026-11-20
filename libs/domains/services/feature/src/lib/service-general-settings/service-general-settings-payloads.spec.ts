import { type Container } from '@qovery/domains/services/data-access'
import { containerFactoryMock, gitContainerFactoryMock } from '@qovery/shared/factories'
import { type ApplicationGeneralData } from '@qovery/shared/interfaces'
import { handleContainerSubmit } from './service-general-settings-payloads'

const toWire = (payload: object) => JSON.parse(JSON.stringify(payload))

describe('handleContainerSubmit', () => {
  const data: ApplicationGeneralData = {
    name: 'api',
    description: 'API service',
    serviceType: 'CONTAINER',
    auto_deploy: true,
    registry: 'registry-id',
    image_name: 'qovery/api',
    image_tag: 'v2',
    image_entry_point: '/bin/sh',
    cmd_arguments: '',
  }

  it('should send the form image fields and no source for an image container', () => {
    const container = {
      ...containerFactoryMock(1)[0],
      source: {
        image: {
          image_name: 'qovery/api',
          tag: 'v1',
          registry: { id: 'registry-id', name: 'docker hub', url: 'https://docker.io', kind: 'DOCKER_HUB' as const },
        },
      },
    }

    const payload = toWire(handleContainerSubmit(data, container, [], []))

    expect(payload).toMatchObject({
      name: 'api',
      registry_id: 'registry-id',
      image_name: 'qovery/api',
      tag: 'v2',
      auto_deploy: true,
    })
    expect(payload).not.toHaveProperty('source')
  })

  it('should send no flat image fields, no source and no auto-deploy for a Git container', () => {
    const container = gitContainerFactoryMock(1)[0]

    const payload = toWire(handleContainerSubmit(data, container, [], []))

    expect(payload).toMatchObject({ name: 'api', description: 'API service', entrypoint: '/bin/sh' })
    expect(payload).not.toHaveProperty('registry_id')
    expect(payload).not.toHaveProperty('image_name')
    expect(payload).not.toHaveProperty('tag')
    expect(payload).not.toHaveProperty('source')
    expect(payload).not.toHaveProperty('auto_deploy')
    expect(payload).not.toHaveProperty('auto_preview')
    expect(payload).not.toHaveProperty('build_settings')
  })

  describe('full request', () => {
    const formData: ApplicationGeneralData = {
      ...data,
      icon_uri: 'app://qovery-console/container',
      cmd_arguments: 'serve --port 80',
      labels_groups: ['label-group-1'],
      annotations_groups: ['annotation-group-1'],
    }
    const labelsGroup = { id: 'label-group-1', created_at: '2026-01-01T00:00:00Z', name: 'team', labels: [] }
    const annotationsGroup = {
      id: 'annotation-group-1',
      created_at: '2026-01-01T00:00:00Z',
      name: 'owner',
      annotations: [],
      scopes: [],
    }
    const labelsGroups = [labelsGroup, { ...labelsGroup, id: 'label-group-2' }]
    const annotationsGroups = [annotationsGroup, { ...annotationsGroup, id: 'annotation-group-2' }]
    const autoscaling = {
      id: 'autoscaling-id',
      created_at: '2026-01-01T00:00:00Z',
      service_id: 'service-id',
      mode: 'KEDA' as const,
      polling_interval_seconds: 30,
      cooldown_period_seconds: 300,
      scalers: [
        {
          id: 'scaler-id',
          created_at: '2026-01-01T00:00:00Z',
          scaler_type: 'cpu',
          enabled: true,
          role: 'PRIMARY' as const,
          config_yaml: 'value: "60"',
        },
      ],
    }

    const expectedRequest = (container: Container) => ({
      serviceType: 'CONTAINER',
      name: 'api',
      description: 'API service',
      icon_uri: 'app://qovery-console/container',
      storage: container.storage,
      ports: container.ports,
      cpu: 1000,
      gpu: 0,
      memory: 1024,
      min_running_instances: 1,
      max_running_instances: 3,
      arguments: ['serve', '--port', '80'],
      entrypoint: '/bin/sh',
      healthchecks: {},
      cpu_architecture: 'ARM64',
      ephemeral_storage_in_gib: 20,
      annotations_groups: [annotationsGroup],
      labels_groups: [labelsGroup],
      autoscaling: {
        mode: 'KEDA',
        polling_interval_seconds: 30,
        cooldown_period_seconds: 300,
        scalers: [{ id: 'scaler-id', scaler_type: 'cpu', enabled: true, role: 'PRIMARY', config_yaml: 'value: "60"' }],
      },
    })

    const storedFields = { cpu_architecture: 'ARM64' as const, ephemeral_storage_in_gib: 20, autoscaling }

    it('should send the stored service fields with the form fields for an image container', () => {
      const container = { ...containerFactoryMock(1)[0], ...storedFields }

      const payload = toWire(handleContainerSubmit(formData, container, labelsGroups, annotationsGroups))

      expect(payload).toEqual({
        ...expectedRequest(container),
        registry_id: 'registry-id',
        image_name: 'qovery/api',
        tag: 'v2',
        auto_deploy: true,
        auto_preview: false,
      })
    })

    it('should send the stored service fields with the form fields for a Git container', () => {
      const container = { ...gitContainerFactoryMock(1)[0], ...storedFields }

      const payload = toWire(handleContainerSubmit(formData, container, labelsGroups, annotationsGroups))

      expect(payload).toEqual(expectedRequest(container))
    })
  })
})
