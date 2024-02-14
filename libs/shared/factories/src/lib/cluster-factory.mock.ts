import { Chance } from 'chance'
import { CloudProviderEnum, type Cluster, ClusterStateEnum, KubernetesEnum } from 'qovery-typescript-axios'

const chance = new Chance('123')

export const clusterFactoryMock = (howMany: number, customCloudProvider?: CloudProviderEnum): Cluster[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    organization: {
      id: '123',
    },
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    region: chance.name(),
    cloud_provider: customCloudProvider ? customCloudProvider : chance.pickone(Object.values(CloudProviderEnum)),
    min_running_nodes: 1,
    max_running_nodes: 5,
    disk_size: 20,
    status: chance.pickone(Object.values(ClusterStateEnum)),
    is_default: false,
    version: '1.22',
    instance_type: chance.name(),
    kubernetes: KubernetesEnum.MANAGED,
    ssh_keys: [
      'ssh-rsa AAAAB3sdasC1yc2EAAAADAQABAAABAQDxtW6w8oPL8AR6asdYDk5DFfmqWoqrWHJp6QYq94c9PYdt9bhtxDfyMnNKDnyz4zWwdknqjyK6Wqwn3sjZYkwovkx+9KpxvpWozoIuMnUAJvVr0FT6Tf9/lo5ikUPkaG2tEhDYWL5BccVE5jES8LPsy6h/gIEWcGOmWcu9p9rQWWQpKGFkkuuaLHADfei3tf39o6s3o6p3nN549jTJ7ZIidXyA1CcA0s2KHtzc5y7ZEtfWeM17BEkXoCh67HnVNcmfrcvuYEUGdZVNxWse6inZuq5K2rEK/uBvIfyWWQ9tUWq7RhNxA9rX0KgETvNJxlI5X4cYaJK3crEL qovery@qovery.home',
    ],
  }))
