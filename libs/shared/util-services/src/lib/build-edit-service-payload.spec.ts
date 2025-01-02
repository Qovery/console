import { DatabaseAccessibilityEnum, DatabaseModeEnum, DatabaseTypeEnum, StorageTypeEnum } from 'qovery-typescript-axios'
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
      name: 'hello-2',
      description: 'test',
      entrypoint: '/',
      cpu: 3000,
      auto_preview: false,
      auto_deploy: false,
      tag: '1',
      ports: [],
      arguments: [],
      memory: 32,
      max_running_instances: 12,
      min_running_instances: 1,
      registry_id: '1',
      registry: {
        id: '1',
        name: 'registry',
        url: 'url',
        kind: 'DOCKER_HUB',
      },
      image_name: 'image_name',
      healthchecks: {},
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
    }

    expect(buildEditServicePayload({ service: job })).toEqual({
      serviceType: 'JOB',
      icon_uri: 'app://qovery-console/cron-job',
      name: 'my-job',
      description: '',
      cpu: 500,
      memory: 512,
      auto_preview: true,
      max_duration_seconds: 300,
      port: null,
      max_nb_restart: 0,
      healthchecks: {},
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
