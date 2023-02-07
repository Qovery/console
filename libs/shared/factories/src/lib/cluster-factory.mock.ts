import { Chance } from 'chance'
import { CloudProviderEnum, StateEnum } from 'qovery-typescript-axios'
import { ClusterEntity } from '@qovery/shared/interfaces'

const chance = new Chance()

export const clusterFactoryMock = (howMany: number, customCloudProvider?: CloudProviderEnum): ClusterEntity[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    region: chance.name(),
    cloud_provider: customCloudProvider ? customCloudProvider : chance.pickone(Object.values(CloudProviderEnum)),
    min_running_nodes: 1,
    max_running_nodes: 5,
    disk_size: 10,
    status: chance.pickone(Object.values(StateEnum)),
    is_default: false,
    version: '1.22',
    instance_type: chance.name(),
    extendedStatus: {
      loadingStatus: 'loaded',
      status: {
        id: index,
        last_execution_id: chance.name(),
        is_deployed: true,
        status: chance.pickone(Object.values(StateEnum)),
      },
    },
    ssh_keys: [
      'ssh-rsa AAAAB3sdasC1yc2EAAAADAQABAAABAQDxtW6w8oPL8AR6asdYDk5DFfmqWoqrWHJp6QYq94c9PYdt9bhtxDfyMnNKDnyz4zWwdknqjyK6Wqwn3sjZYkwovkx+9KpxvpWozoIuMnUAJvVr0FT6Tf9/lo5ikUPkaG2tEhDYWL5BccVE5jES8LPsy6h/gIEWcGOmWcu9p9rQWWQpKGFkkuuaLHADfei3tf39o6s3o6p3nN549jTJ7ZIidXyA1CcA0s2KHtzc5y7ZEtfWeM17BEkXoCh67HnVNcmfrcvuYEUGdZVNxWse6inZuq5K2rEK/uBvIfyWWQ9tUWq7RhNxA9rX0KgETvNJxlI5X4cYaJK3crEL qovery@qovery.home',
    ],
    cloudProviderInfo: {
      loadingStatus: 'loaded',
      item: {
        cloud_provider: customCloudProvider || CloudProviderEnum.AWS,
        credentials: {
          id: '0',
          name: 'credentials',
        },
        region: 'eu-west',
      },
    },
  }))
