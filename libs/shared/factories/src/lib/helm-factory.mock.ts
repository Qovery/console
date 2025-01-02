import { Chance } from 'chance'
import { type Helm } from '@qovery/domains/services/data-access'

const chance = new Chance('123')

export const helmFactoryMock = (howMany: number): Helm[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    service_type: 'HELM',
    icon_uri: 'app://qovery-console/helm',
    created_at: chance.date({ year: 2023, string: true }).toString(),
    updated_at: chance.date({ year: 2024, string: true }).toString(),
    name: chance.name(),
    serviceType: 'HELM' as const,
    description: chance.sentence(),
    environment: {
      id: '1',
    },
    auto_deploy: false,
    auto_preview: false,
    ports: [],
    source: {
      git: {
        git_repository: {
          url: '',
          provider: 'GITHUB',
          owner: chance.name(),
          name: chance.name(),
          branch: '',
          root_path: '',
        },
      },
    },
    arguments: [],
    allow_cluster_wide_resources: false,
    values_override: {},
  }))
