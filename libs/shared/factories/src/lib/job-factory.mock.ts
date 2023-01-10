import { Chance } from 'chance'
import { GitProviderEnum, StorageTypeEnum } from 'qovery-typescript-axios'
import { JobApplicationEntity } from '@qovery/shared/interfaces'

const chance = new Chance()

export const cronjobFactoryMock = (howMany: number, withContainer = false): JobApplicationEntity[] =>
  Array.from({ length: howMany }).map((_, index) => {
    let source
    if (!withContainer) {
      source = {
        docker: {
          git_repository: {
            has_access: true,
            deployed_commit_id: '8a21ddb195d821781d46eb1d8f26d5ae13609dd1',
            deployed_commit_date: '2022-12-19T11:57:07.425715Z',
            deployed_commit_contributor: 'TAGS_NOT_IMPLEMENTED',
            deployed_commit_tag: 'TAGS_NOT_IMPLEMENTED',
            provider: GitProviderEnum.GITHUB,
            owner: 'bdebon',
            url: 'https://github.com/Qovery/admin-ui.git',
            name: 'Qovery/admin-ui',
            branch: 'develop',
            root_path: '/',
          },
          dockerfile_path: 'Dockerfile',
        },
      }
    } else {
      source = {
        image: {
          name: 'nginx',
          image_name: 'nginx/nginx',
          registry_id: chance.guid(),
        },
      }
    }

    return {
      id: `${index}`,
      created_at: new Date().toString(),
      updated_at: new Date().toString(),
      storage: [
        {
          id: chance.guid(),
          type: chance.pickone(Object.values([StorageTypeEnum.FAST_SSD])),
          size: 10,
          mount_point: '',
        },
      ],
      environment: {
        id: chance.guid(),
      },
      maximum_cpu: 10,
      maximum_memory: 10,
      name: chance.name(),
      description: chance.word({ length: 10 }),
      max_duration_seconds: 10,
      max_nb_restart: 10,
      port: 80,
      cpu: 1000,
      memory: 1024,
      auto_preview: false,
      source,
      schedule: {
        cronjob: {
          scheduled_at: '0 0 * * *',
          entrypoint: '/',
          arguments: [],
        },
      },
      registry: {
        id: chance.guid(),
      },
    }
  })

export const lifecycleJobFactoryMock = (howMany: number, withContainer = false): JobApplicationEntity[] =>
  Array.from({ length: howMany }).map((_, index) => {
    let source
    if (!withContainer) {
      source = {
        docker: {
          git_repository: {
            has_access: true,
            deployed_commit_id: '8a21ddb195d821781d46eb1d8f26d5ae13609dd1',
            deployed_commit_date: '2022-12-19T11:57:07.425715Z',
            deployed_commit_contributor: 'TAGS_NOT_IMPLEMENTED',
            deployed_commit_tag: 'TAGS_NOT_IMPLEMENTED',
            provider: GitProviderEnum.GITHUB,
            owner: 'bdebon',
            url: 'https://github.com/Qovery/admin-ui.git',
            name: 'Qovery/admin-ui',
            branch: 'develop',
            root_path: '/',
          },
          dockerfile_path: 'Dockerfile',
        },
      }
    } else {
      source = {
        image: {
          name: 'nginx',
          image_name: 'nginx/nginx',
          registry_id: chance.guid(),
        },
      }
    }

    return {
      id: `${index}`,
      created_at: new Date().toString(),
      updated_at: new Date().toString(),
      storage: [
        {
          id: chance.guid(),
          type: chance.pickone(Object.values([StorageTypeEnum.FAST_SSD])),
          size: 10,
          mount_point: '',
        },
      ],
      environment: {
        id: chance.guid(),
      },
      maximum_cpu: 10,
      maximum_memory: 10,
      name: chance.name(),
      description: chance.word({ length: 10 }),
      max_duration_seconds: 10,
      max_nb_restart: 10,
      port: 80,
      cpu: 1000,
      memory: 1024,
      auto_preview: false,
      source,
      schedule: {
        on_start: {
          arguments: [],
        },
      },
      registry: {
        id: chance.guid(),
      },
    }
  })
