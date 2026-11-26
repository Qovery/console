import {
  type ContainerRequest,
  DatabaseAccessibilityEnum,
  DatabaseModeEnum,
  DatabaseTypeEnum,
  StorageTypeEnum,
} from 'qovery-typescript-axios'
import { type Application, type Container, type Database, type Job } from '@qovery/domains/services/data-access'
import { buildEditServicePayload } from './build-edit-service-payload'

describe('testing payload refactoring', () => {
  it('should remove useless application values', () => {
    const response: Application = {
      id: '1',
      service_type: 'APPLICATION',
      serviceType: 'APPLICATION',
      icon_uri: 'app://qovery-console/application',
      created_at: '',
      updated_at: '',
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      maximum_cpu: 10,
      maximum_memory: 10,
      git_repository: {
        url: '',
        branch: '',
        root_path: '',
        provider: 'GITHUB',
        owner: 'Foobar',
        name: '',
      },
      name: 'hello-2',
      healthchecks: {},
      cpu_architecture: 'ARM64',
      environment: {
        id: '1',
      },
    }

    expect(buildEditServicePayload({ service: response })).toEqual({
      serviceType: 'APPLICATION',
      icon_uri: 'app://qovery-console/application',
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      git_repository: {
        url: '',
        branch: '',
        root_path: '',
        provider: 'GITHUB',
        owner: 'Foobar',
        name: '',
      },
      healthchecks: {},
      name: 'hello-2',
      cpu_architecture: 'ARM64',
    })
  })

  it('should remove useless container values', () => {
    const response: Container = {
      id: '1',
      service_type: 'CONTAINER',
      serviceType: 'CONTAINER',
      icon_uri: 'app://qovery-console/container',
      created_at: '',
      updated_at: '',
      environment: {
        id: '1',
      },
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      maximum_cpu: 10,
      maximum_memory: 10,
      maximum_gpu: 0,
      name: 'hello-2',
      description: 'test',
      entrypoint: '/',
      cpu: 3000,
      gpu: 0,
      auto_preview: false,
      auto_deploy: false,
      tag: '1',
      ports: [],
      arguments: [],
      memory: 32,
      max_running_instances: 12,
      min_running_instances: 1,
      registry: {
        id: '1',
        name: 'registry',
        url: 'url',
        kind: 'DOCKER_HUB',
      },
      image_name: 'image_name',
      healthchecks: {},
      cpu_architecture: null,
    }

    expect(buildEditServicePayload({ service: response })).toEqual({
      serviceType: 'CONTAINER',
      icon_uri: 'app://qovery-console/container',
      name: 'hello-2',
      description: 'test',
      storage: [
        {
          id: '1',
          mount_point: '',
          size: 4,
          type: StorageTypeEnum.FAST_SSD,
        },
      ],
      ports: [],
      cpu: 3000,
      gpu: 0,
      memory: 32,
      max_running_instances: 12,
      min_running_instances: 1,
      registry_id: '1',
      image_name: 'image_name',
      tag: '1',
      arguments: [],
      entrypoint: '/',
      auto_preview: false,
      healthchecks: {},
      auto_deploy: false,
      cpu_architecture: null,
    })
  })

  describe('container source', () => {
    const toWire = (payload: object) => JSON.parse(JSON.stringify(payload))

    const imageContainer: Container = {
      id: '1',
      service_type: 'CONTAINER',
      serviceType: 'CONTAINER',
      icon_uri: 'app://qovery-console/container',
      created_at: '',
      environment: { id: '1' },
      maximum_cpu: 10,
      maximum_memory: 10,
      maximum_gpu: 0,
      name: 'api',
      cpu: 500,
      gpu: 0,
      memory: 512,
      min_running_instances: 1,
      max_running_instances: 1,
      auto_preview: false,
      auto_deploy: true,
      healthchecks: {},
      image_name: 'qovery/api',
      tag: 'v1',
      registry: { id: 'registry-id', name: 'docker hub', url: 'https://docker.io', kind: 'DOCKER_HUB' },
      source: {
        image: {
          image_name: 'qovery/api',
          tag: 'v1',
          registry: { id: 'registry-id', name: 'docker hub', url: 'https://docker.io', kind: 'DOCKER_HUB' },
        },
      },
    }

    const gitContainer: Container = {
      ...imageContainer,
      auto_deploy: false,
      image_name: 'z1a2b3c4-api',
      tag: '4f3a1c2e',
      registry: { id: 'cluster-registry-id', name: 'cluster registry', url: 'https://ecr.aws', kind: 'ECR' },
      source: {
        git_repository: {
          provider: 'GITHUB',
          owner: 'qovery',
          name: 'qovery/api',
          url: 'https://github.com/qovery/api.git',
          branch: 'main',
          dockerfile_path: 'Dockerfile',
        },
      },
      build_settings: { timeout_max_sec: 1800, cpu_max_in_milli: 4000, ram_max_in_gib: 8 },
    }

    it('should keep the flat image fields and send no source for an image container', () => {
      const payload = toWire(buildEditServicePayload({ service: imageContainer }))

      expect(payload).toMatchObject({
        registry_id: 'registry-id',
        image_name: 'qovery/api',
        tag: 'v1',
        auto_deploy: true,
      })
      expect(payload).not.toHaveProperty('source')
    })

    it('should send auto-deploy and auto-preview but no flat image fields and no source for a Git container', () => {
      const payload = toWire(buildEditServicePayload({ service: gitContainer }))

      expect(payload).toMatchObject({ name: 'api', cpu: 500, auto_deploy: false, auto_preview: false })
      expect(payload).not.toHaveProperty('registry_id')
      expect(payload).not.toHaveProperty('image_name')
      expect(payload).not.toHaveProperty('tag')
      expect(payload).not.toHaveProperty('source')
      expect(payload).not.toHaveProperty('build_settings')
    })

    it('should send the requested auto-deploy and the stored auto-preview of a Git container', () => {
      const payload = toWire(buildEditServicePayload({ service: gitContainer, request: { auto_deploy: true } }))

      expect(payload).toMatchObject({ auto_deploy: true, auto_preview: false })
    })

    it.each([
      ['an image', imageContainer],
      ['a Git', gitContainer],
    ])('should send the stored ephemeral storage of %s container', (_, container) => {
      const payload = toWire(buildEditServicePayload({ service: { ...container, ephemeral_storage_in_gib: 20 } }))

      expect(payload).toMatchObject({ ephemeral_storage_in_gib: 20 })
    })

    it('should drop the image fields and source of a Git container even when the request spreads the service', () => {
      const request = { ...gitContainer, auto_preview: true, ports: [] } as Partial<ContainerRequest>
      const payload = toWire(buildEditServicePayload({ service: gitContainer, request }))

      expect(payload).toMatchObject({ ports: [], auto_preview: true })
      expect(payload).not.toHaveProperty('image_name')
      expect(payload).not.toHaveProperty('tag')
      expect(payload).not.toHaveProperty('source')
      expect(payload).not.toHaveProperty('build_settings')
    })
  })

  it('should remove useless database values', () => {
    const response: Database = {
      id: '1',
      name: 'hello',
      description: 'test',
      service_type: 'DATABASE',
      serviceType: 'DATABASE',
      icon_uri: 'app://qovery-console/database',
      type: DatabaseTypeEnum.POSTGRESQL,
      mode: DatabaseModeEnum.CONTAINER,
      created_at: '',
      updated_at: '',
      environment: {
        id: '1',
      },
      accessibility: DatabaseAccessibilityEnum.PRIVATE,
      cpu: 1024,
      memory: 1024,
      storage: 1024,
      instance_type: 't2.small',
      version: '12',
    }

    expect(buildEditServicePayload({ service: response })).toEqual({
      serviceType: 'DATABASE',
      icon_uri: 'app://qovery-console/database',
      name: 'hello',
      description: 'test',
      version: '12',
      accessibility: DatabaseAccessibilityEnum.PRIVATE,
      type: DatabaseTypeEnum.POSTGRESQL,
      mode: DatabaseModeEnum.CONTAINER,
      cpu: 1024,
      memory: 1024,
      storage: 1024,
      instance_type: 't2.small',
    })
  })

  it('should remove useless job values', () => {
    const job: Job = {
      id: '0',
      created_at: '',
      updated_at: '',
      name: 'my-job',
      job_type: 'CRON',
      service_type: 'JOB',
      serviceType: 'JOB',
      icon_uri: 'app://qovery-console/cron-job',
      description: '',
      cpu: 500,
      memory: 512,
      gpu: 0,
      auto_preview: true,
      max_duration_seconds: 300,
      port: null,
      max_nb_restart: 0,
      source: {
        docker: {
          dockerfile_path: 'Dockerfile',
          git_repository: {
            url: 'https://github.com',
            branch: 'master',
            root_path: '/',
            provider: 'GITHUB',
            owner: 'Foobar',
            name: '',
          },
        },
      },
      schedule: {
        cronjob: {
          arguments: [],
          scheduled_at: '5 4 * * *',
          timezone: 'UTC',
        },
      },
      environment: {
        id: '1',
      },
      healthchecks: {},
      maximum_cpu: 10,
      maximum_memory: 10,
      maximum_gpu: 0,
      cpu_architecture: 'AMD64',
    }

    expect(buildEditServicePayload({ service: job })).toEqual({
      serviceType: 'JOB',
      icon_uri: 'app://qovery-console/cron-job',
      name: 'my-job',
      description: '',
      cpu: 500,
      memory: 512,
      gpu: 0,
      auto_preview: true,
      max_duration_seconds: 300,
      port: null,
      max_nb_restart: 0,
      healthchecks: {},
      cpu_architecture: 'AMD64',
      source: {
        docker: {
          dockerfile_path: 'Dockerfile',
          git_repository: {
            url: 'https://github.com',
            branch: 'master',
            root_path: '/',
            provider: 'GITHUB',
            owner: 'Foobar',
            name: '',
          },
        },
      },
      schedule: {
        cronjob: {
          arguments: [],
          scheduled_at: '5 4 * * *',
          timezone: 'UTC',
        },
      },
    })
  })
})
