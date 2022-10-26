import { Chance } from 'chance'
import {
  ContainerRegistryKindEnum,
  ContainerRegistryResponse,
  EnvironmentModeEnum,
  InviteMember,
  InviteMemberRoleEnum,
  InviteStatusEnum,
  Member,
  OrganizationCustomRole,
  OrganizationCustomRoleClusterPermission,
  OrganizationCustomRoleProjectPermission,
  PlanEnum,
} from 'qovery-typescript-axios'
import { OrganizationEntity } from '@qovery/shared/interfaces'

const chance = new Chance()

export const organizationFactoryMock = (howMany: number): OrganizationEntity[] =>
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
    owner: chance.name(),
    admin_emails: ['test@test.com'],
    containerRegistries: {
      loadingStatus: 'loaded',
      items: containerRegistriesByOrganizationIdMock,
    },
    customRoles: {
      loadingStatus: 'loaded',
      items: customRolesMock(2),
    },
    members: {
      loadingStatus: 'loaded',
      items: [...membersMock(1, 'Owner', '0'), ...membersMock(1, 'Admin', '1')],
    },
    inviteMembers: {
      loadingStatus: 'loaded',
      items: inviteMembersMock(1),
    },
    availableRoles: {
      loadingStatus: 'loaded',
      items: availableRolesMock,
    },
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

export const containerRegistriesMock = (howMany: number): ContainerRegistryResponse[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    kind: chance.pickone(Object.values([ContainerRegistryKindEnum.DOCKER_HUB])),
    description: chance.word({ length: 10 }),
    url: chance.url(),
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
