import { Chance } from 'chance'
import { type Terraform } from '@qovery/domains/services/data-access'

const chance = new Chance('123')

export const terraformFactoryMock = (howMany: number): Terraform[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: chance.date({ year: 2025, string: true }).toString(),
    updated_at: chance.date({ year: 2025, string: true }).toString(),
    service_type: 'TERRAFORM',
    environment: {
      id: chance.guid(),
    },
    name: chance.name(),
    description: chance.sentence(),
    auto_approve: false,
    auto_deploy: false,
    backend: {
      kubernetes: {},
    },
    terraform_files_source: {
      git: {
        git_repository: {
          provider: 'GITHUB',
          owner: chance.name(),
          name: chance.name(),
          url: 'https://github.com/Qovery/terraform_service_engine_testing.git',
          branch: 'main',
          root_path: '/simple_terraform',
          git_token_id: chance.guid(),
        },
      },
    },
    terraform_variables_source: {
      tf_vars: [],
      tf_var_file_paths: [],
    },
    engine: 'TERRAFORM',
    provider_version: {
      read_from_terraform_block: false,
      explicit_version: '1.13.2',
    },
    timeout_sec: 3600,
    icon_uri: 'app://qovery-console/terraform',
    job_resources: {
      cpu_milli: 500,
      ram_mib: 512,
      storage_gib: 1,
      gpu: 0,
    },
    use_cluster_credentials: true,
    serviceType: 'TERRAFORM',
    action_extra_arguments: {},
  }))
