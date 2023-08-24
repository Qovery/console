import { Chance } from 'chance'
import {
  OrganizationEventOrigin,
  type OrganizationEventResponse,
  OrganizationEventSubTargetType,
  OrganizationEventTargetType,
  OrganizationEventType,
} from 'qovery-typescript-axios'

const chance = new Chance('123')

export const eventsFactoryMock = (howMany: number): OrganizationEventResponse[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: index.toString(),
    origin: chance.pickone(
      Object.values([OrganizationEventOrigin.API, OrganizationEventOrigin.CLI, OrganizationEventOrigin.CONSOLE])
    ),
    event_type: chance.pickone(
      Object.values([
        OrganizationEventType.ACCEPT,
        OrganizationEventType.DELETE,
        OrganizationEventType.TRIGGER_DELETE,
        OrganizationEventType.TRIGGER_REDEPLOY,
        OrganizationEventType.ACCEPT,
      ])
    ),
    change: JSON.stringify({ hello: 'world' }),
    created_at: chance.date().toString(),
    project_id: chance.guid(),
    project_name: chance.name(),
    target_id: chance.guid(),
    environment_id: chance.guid(),
    environment_name: chance.name(),
    target_name: chance.name(),
    target_type: chance.pickone(
      Object.values([
        OrganizationEventTargetType.ORGANIZATION,
        OrganizationEventTargetType.CONTAINER,
        OrganizationEventTargetType.CLUSTER,
        OrganizationEventTargetType.CONTAINER_REGISTRY,
        OrganizationEventTargetType.WEBHOOK,
        OrganizationEventTargetType.MEMBERS_AND_ROLES,
      ])
    ),
    timestamp: chance.date().toString(),
    triggered_by: chance.name(),
    sub_target_type: chance.pickone(
      Object.values([
        OrganizationEventSubTargetType.CLOUD_PROVIDER_CREDENTIALS,
        OrganizationEventSubTargetType.API_TOKEN,
        OrganizationEventSubTargetType.BILLING_INFO,
        OrganizationEventSubTargetType.ADVANCED_SETTINGS,
        OrganizationEventSubTargetType.ADVANCED_SETTINGS,
        OrganizationEventSubTargetType.CLOUD_PROVIDER_CREDENTIALS,
        OrganizationEventSubTargetType.CLUSTER_ROUTING_TABLE,
      ])
    ),
  }))
