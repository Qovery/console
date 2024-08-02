import { Chance } from 'chance'
import {
  type ClusterCredentials,
  ContainerRegistryKindEnum,
  type ContainerRegistryResponse,
  EnvironmentModeEnum,
  HelmRepositoryKindEnum,
  type HelmRepositoryResponse,
  type InviteMember,
  InviteMemberRoleEnum,
  InviteStatusEnum,
  type Member,
  type Organization,
  type OrganizationCustomRole,
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleProjectPermission,
  PlanEnum,
} from 'qovery-typescript-axios'

const chance = new Chance('123')

export const organizationFactoryMock = (howMany: number): Organization[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    plan: chance.pickone(Object.values([PlanEnum.FREE])),
    website_url: chance.url(),
    repository: chance.name(),
    logo_url: chance.url(),
    icon_url: chance.url(),
    admin_emails: ['test@test.com'],
    owner: chance.name(),
  }))

export const availableRolesMock = [
  {
    id: '0',
    name: 'Admin',
  },
  {
    id: '1',
    name: 'Owner',
  },
]

export const credentialsMock = (howMany: number): ClusterCredentials[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    name: chance.name(),
    object_type: 'OTHER',
  }))

export const membersMock = (howMany: number, roleName = 'Admin', customIndex?: string): Member[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${customIndex ? customIndex : index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    nickname: chance.name(),
    email: chance.email(),
    description: chance.word({ length: 10 }),
    last_activity_at: new Date().toString(),
    role: chance.pickone(Object.values(InviteMemberRoleEnum)),
    role_name: roleName,
    role_id: chance.guid(),
  }))

export const inviteMembersMock = (howMany: number): InviteMember[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: chance.guid(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    invitation_link: 'https://qovery.com',
    invitation_status: InviteStatusEnum.PENDING,
    inviter: chance.name(),
    email: chance.email(),
    role: chance.pickone(Object.values(InviteMemberRoleEnum)),
    role_name: 'Admin',
    role_id: chance.guid(),
  }))

export const helmRepositoriesMock = (howMany: number): HelmRepositoryResponse[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    kind: chance.pickone(Object.values([HelmRepositoryKindEnum.HTTPS])),
    description: chance.word({ length: 10 }),
    url: chance.url(),
  }))

export const containerRegistriesMock = (howMany: number): ContainerRegistryResponse[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    kind: chance.pickone(Object.values([ContainerRegistryKindEnum.DOCKER_HUB])),
    description: chance.word({ length: 10 }),
    url: chance.url(),
    cluster: undefined,
  }))

export const containerRegistriesByOrganizationIdMock = containerRegistriesMock(2)

export const customRolesMock = (howMany: number): OrganizationCustomRole[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    name: chance.name(),
    description: chance.word({ length: 10 }),
    cluster_permissions: [
      {
        cluster_id: '1',
        cluster_name: 'aws',
        permission: OrganizationCustomRoleClusterPermission.ADMIN,
      },
    ],
    project_permissions: [
      {
        project_id: '1',
        project_name: 'test',
        is_admin: false,
        permissions: [
          {
            environment_type: EnvironmentModeEnum.DEVELOPMENT,
            permission: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          },
          {
            environment_type: EnvironmentModeEnum.PREVIEW,
            permission: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          },
          {
            environment_type: EnvironmentModeEnum.STAGING,
            permission: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          },
          {
            environment_type: EnvironmentModeEnum.PRODUCTION,
            permission: OrganizationCustomRoleProjectPermission.NO_ACCESS,
          },
        ],
      },
    ],
  }))
