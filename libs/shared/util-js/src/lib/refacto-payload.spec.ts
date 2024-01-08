import { CloudProviderEnum, OrganizationCustomRoleClusterPermission } from 'qovery-typescript-axios'
import {
  refactoClusterPayload,
  refactoOrganizationCustomRolePayload,
  refactoOrganizationPayload,
  refactoPayload,
} from './refacto-payload'

describe('testing payload refactoring', () => {
  it('should remove default values (id, created_at and updated_at)', () => {
    const response = {
      id: '1',
      created_at: '2022-07-21T09:59:42.01426Z',
      updated_at: '2022-07-21T09:59:42.014261Z',
      name: 'hello',
      description: 'test',
    }

    expect(refactoPayload(response)).toEqual({ name: 'hello', description: 'test' })
  })

  it('should remove useless organization values', () => {
    const response = {
      id: '1',
      created_at: '',
      updated_at: '',
      name: 'hello',
      description: 'hello world',
      logo_url: 'https://qovery.com',
      website_url: 'https://qovery.com',
      admin_emails: ['test@test.com'],
    }

    expect(refactoOrganizationPayload(response)).toEqual({
      name: 'hello',
      description: 'hello world',
      logo_url: 'https://qovery.com',
      website_url: 'https://qovery.com',
      admin_emails: ['test@test.com'],
    })
  })

  it('should remove useless organization custom roles values', () => {
    const response = {
      id: '1',
      name: 'hello',
      description: 'hello world',
      cluster_permissions: [
        {
          cluster_name: 'my cluster',
          cluster_id: '1',
          permission: OrganizationCustomRoleClusterPermission.VIEWER,
        },
      ],
      project_permissions: [
        {
          project_id: '1',
          project_name: 'my project',
          is_admin: true,
          permissions: [],
        },
      ],
    }

    expect(refactoOrganizationCustomRolePayload(response)).toEqual({
      name: 'hello',
      description: 'hello world',
      cluster_permissions: [
        {
          cluster_id: '1',
          permission: OrganizationCustomRoleClusterPermission.VIEWER,
        },
      ],
      project_permissions: [
        {
          project_id: '1',
          is_admin: true,
          permissions: [],
        },
      ],
    })
  })

  it('should remove useless cluster values', () => {
    const response = {
      id: '1',
      created_at: '',
      updated_at: '',
      name: 'hello',
      description: 'hello world',
      region: 'est',
      cloud_provider: CloudProviderEnum.AWS,
      production: false,
    }

    expect(refactoClusterPayload(response)).toEqual({
      name: 'hello',
      description: 'hello world',
      region: 'est',
      cloud_provider: CloudProviderEnum.AWS,
      production: false,
    })
  })
})
