import { Chance } from 'chance'
import {
  ServiceDeploymentStatusEnum,
  type ServiceSubActionEnum,
  StateEnum,
  type Status,
  TerraformDeployRequestActionEnum,
} from 'qovery-typescript-axios'

const chance = new Chance('123')

export const databaseStatusFactoryMock = (howMany: number): Status[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    message: chance.sentence(),
    status_details: {
      action: 'DEPLOY',
      status: 'SUCCESS',
      sub_action: chance.pickone(
        Object.values([
          TerraformDeployRequestActionEnum.PLAN as ServiceSubActionEnum,
          TerraformDeployRequestActionEnum.FORCE_UNLOCK as ServiceSubActionEnum,
          TerraformDeployRequestActionEnum.MIGRATE_STATE as ServiceSubActionEnum,
        ])
      ),
    },
    service_deployment_status: chance.pickone(
      Object.values([
        ServiceDeploymentStatusEnum.UP_TO_DATE,
        ServiceDeploymentStatusEnum.UP_TO_DATE,
        ServiceDeploymentStatusEnum.UP_TO_DATE,
      ])
    ),
    state: chance.pickone(Object.values([StateEnum.DEPLOYED, StateEnum.STOP_ERROR])),
    is_part_last_deployment: false,
    deployment_request_id: chance.guid(),
    deployment_requests_count: 0,
  }))
