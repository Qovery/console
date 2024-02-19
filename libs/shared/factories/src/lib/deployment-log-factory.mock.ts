import { Chance } from 'chance'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'

const chance = new Chance('123')

export const deploymentLogFactoryMock = (howMany: number, withError?: boolean): EnvironmentLogs[] =>
  Array.from({ length: howMany }).map(() => ({
    type: chance.pickone(Object.values(LogsType)),
    timestamp: chance.date().toString(),
    details: {
      organization_id: '141c07c8',
      cluster_id: 'a8ad0659',
      execution_id: '1b8ecb8a',
      stage: {
        step: chance.pickone(['Deploy', 'Deployed', 'Terminated']),
      },
      transmitter: {
        type: 'Environment',
        id: '1b8ecb8a-7c80-4f82-b8ca-2ef3d3000e33',
        name: 'staging',
      },
    },
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
