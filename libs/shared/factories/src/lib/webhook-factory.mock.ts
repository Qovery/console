import { Chance } from 'chance'
import {
  EnvironmentModeEnum,
  OrganizationWebhookEventEnum,
  OrganizationWebhookKindEnum,
  type OrganizationWebhookResponse,
} from 'qovery-typescript-axios'

const chance = new Chance('123')

export const webhookFactoryMock = (howMany: number): OrganizationWebhookResponse[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    kind: OrganizationWebhookKindEnum.STANDARD,
    updated_at: chance.date().toISOString(),
    created_at: chance.date().toISOString(),
    enabled: false,
    events: [OrganizationWebhookEventEnum.STARTED],
    target_url: chance.url(),
    description: chance.sentence(),
    project_names_filter: [],
    target_secret_set: false,
    environment_types_filter: [EnvironmentModeEnum.PRODUCTION],
  }))
