import { Chance } from 'chance'
import { ClusterLogs, ClusterLogsStepEnum } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'

const chance = new Chance()

export const clusterLogFactoryMock = (howMany: number, withError?: boolean): ClusterLogs[] =>
  Array.from({ length: howMany }).map(() => ({
    type: chance.pickone(Object.values(LogsType)),
    timestamp: new Date().toString(),
    step: chance.pickone(Object.values(ClusterLogsStepEnum)),
    message: {
      safe_message: chance.name(),
    },
    ...(withError && {
      error: {
        tag: 'tag',
        user_log_message: 'user-log-message',
        hint_message: 'hint-message',
        link: 'https://qovery.com',
        event_details: {
          transmitter: {
            name: 'transmitter-name',
          },
          underlying_error: {
            message: 'underlying-error',
          },
        },
      },
    }),
  }))
