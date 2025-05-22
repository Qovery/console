import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type AwsCredentialsRequest,
  type AzureCredentialsRequest,
  CloudProviderApi,
  CloudProviderCredentialsApi,
  type CloudProviderEnum,
  type CloudVendorEnum,
  type GcpCredentialsRequest,
  type KubernetesEnum,
  type ScalewayCredentialsRequest,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type DistributiveOmit } from '@qovery/shared/util-types'

const cloudProviderApi = new CloudProviderApi()
const cloudProviderCredentialsApi = new CloudProviderCredentialsApi()

type CredentialRequest =
  | {
      organizationId: string
      cloudProvider: Extract<CloudProviderEnum, 'AWS'>
      payload: AwsCredentialsRequest
      credentialId: string
    }
  | {
      organizationId: string
      cloudProvider: Extract<CloudProviderEnum, 'SCW'>
      payload: ScalewayCredentialsRequest
      credentialId: string
    }
  | {
      organizationId: string
      cloudProvider: Extract<CloudProviderEnum, 'GCP'>
      payload: GcpCredentialsRequest
      credentialId: string
    }
  | {
      organizationId: string
      cloudProvider: Extract<CloudProviderEnum, 'AZURE'>
      payload: AzureCredentialsRequest
      credentialId: string
    }
  | {
      organizationId: string
      cloudProvider: Extract<CloudProviderEnum, 'ON_PREMISE'>
      payload: undefined
      credentialId: string
    }

export const cloudProviders = createQueryKeys('cloudProviders', {
  list: {
    queryKey: null,
    async queryFn() {
      const response = await cloudProviderApi.listCloudProvider()
      return response.data.results
    },
  },
  features: ({ cloudProvider }: { cloudProvider: CloudProviderEnum }) => ({
    queryKey: [cloudProvider],
    async queryFn() {
      const response = await match(cloudProvider)
        .with('AWS', () => cloudProviderApi.listAWSFeatures())
        .with('SCW', () => cloudProviderApi.listScalewayFeatures())
        .with('GCP', () => cloudProviderApi.listGcpFeatures())
        .with('AZURE', () => cloudProviderApi.listAzureFeatures())
        .with('ON_PREMISE', () => Promise.resolve({ data: { results: [] } }))
        .exhaustive()
      return response.data.results
    },
  }),
  listInstanceTypes: (
    args:
      | {
          cloudProvider: Extract<CloudProviderEnum, 'AWS'>
          clusterType: (typeof KubernetesEnum)[keyof typeof KubernetesEnum]
          region: string
        }
      | {
          cloudProvider: Extract<CloudProviderEnum, 'SCW'>
          clusterType: Extract<KubernetesEnum, 'MANAGED'>
          region: string
        }
      | {
          cloudProvider: Extract<CloudProviderEnum, 'GCP'>
          clusterType: Extract<KubernetesEnum, 'MANAGED'>
        }
      | {
          cloudProvider: Extract<CloudProviderEnum, 'AZURE'>
          clusterType: Extract<KubernetesEnum, 'MANAGED'>
          region: string
        }
      | {
          cloudProvider: Extract<CloudProviderEnum, 'ON_PREMISE'>
          clusterType: Extract<KubernetesEnum, 'MANAGED'>
        }
  ) => ({
    queryKey: [args.cloudProvider, args.clusterType],
    async queryFn() {
      const response = await match(args)
        .with({ cloudProvider: 'AWS', clusterType: 'MANAGED' }, ({ region }) =>
          cloudProviderApi.listAWSEKSInstanceType(region, true, true)
        )
        .with({ cloudProvider: 'AWS', clusterType: 'SELF_MANAGED' }, ({ region }) =>
          cloudProviderApi.listAWSEKSInstanceType(region, true)
        )
        .with({ cloudProvider: 'SCW' }, ({ region }) => cloudProviderApi.listScalewayKapsuleInstanceType(region))
        .with({ cloudProvider: 'GCP' }, () => Promise.resolve({ data: { results: [] } }))
        .with({ cloudProvider: 'AZURE' }, ({ region }) => cloudProviderApi.listAzureAKSInstanceType(region))
        .with({ cloudProvider: 'ON_PREMISE' }, () => Promise.resolve({ data: { results: [] } }))
        .exhaustive()
      return response.data.results
    },
  }),
  listInstanceTypesKarpenter: (
    args:
      | {
          cloudProvider: Extract<CloudVendorEnum, 'AWS'>
          region: string
        }
      | {
          cloudProvider: Extract<CloudVendorEnum, 'SCW'>
          region: string
        }
      | {
          cloudProvider: Extract<CloudVendorEnum, 'GCP'>
        }
      | {
          cloudProvider: Extract<CloudVendorEnum, 'AZURE'>
          region: string
        }
      | {
          cloudProvider: Extract<CloudVendorEnum, 'ON_PREMISE'>
        }
  ) => ({
    queryKey: [args.cloudProvider],
    async queryFn() {
      const response = await match(args)
        .with({ cloudProvider: 'AWS' }, ({ region }) => cloudProviderApi.listAWSEKSInstanceType(region, false, false))
        .with({ cloudProvider: 'AZURE' }, () => Promise.resolve({ data: { results: [] } }))
        .with({ cloudProvider: 'GCP' }, () => Promise.resolve({ data: { results: [] } }))
        .with({ cloudProvider: 'SCW' }, () => Promise.resolve({ data: { results: [] } }))
        .with({ cloudProvider: 'ON_PREMISE' }, () => Promise.resolve({ data: { results: [] } }))
        .run()
      return response.data.results
    },
  }),
  credentials: ({ organizationId, cloudProvider }: { organizationId: string; cloudProvider: CloudProviderEnum }) => ({
    queryKey: [organizationId, cloudProvider],
    async queryFn() {
      const cloudProviders = await match(cloudProvider)
        .with('AWS', async () => {
          const response = await cloudProviderCredentialsApi.listAWSCredentials(organizationId)
          return response.data.results
        })
        .with('SCW', async () => {
          const response = await cloudProviderCredentialsApi.listScalewayCredentials(organizationId)
          return response.data.results
        })
        .with('GCP', async () => {
          const response = await cloudProviderCredentialsApi.listGcpCredentials(organizationId)
          return response.data.results
        })
        .with('AZURE', async () => {
          const response = await cloudProviderCredentialsApi.listAzureCredentials(organizationId)
          return response.data.results
        })
        .with('ON_PREMISE', async () => undefined)
        .exhaustive()

      return cloudProviders
    },
  }),
  listDatabaseInstanceTypes: (
    args:
      | {
          cloudProvider: Extract<CloudVendorEnum, 'AWS'>
          databaseType: string
          region: string
        }
      | {
          cloudProvider: Extract<CloudVendorEnum, 'SCW'>
          databaseType: string
        }
      | {
          cloudProvider: Extract<CloudVendorEnum, 'GCP'>
          databaseType: string
        }
      | {
          cloudProvider: Extract<CloudVendorEnum, 'AZURE'>
          databaseType: string
        }
      | {
          cloudProvider: Extract<CloudVendorEnum, 'ON_PREMISE'>
          databaseType: string
        }
  ) => ({
    queryKey: [args.cloudProvider, args.databaseType],
    async queryFn() {
      return match(args)
        .with(
          { cloudProvider: 'AWS' },
          async ({ region, databaseType }) =>
            (await cloudProviderApi.listAWSManagedDatabaseInstanceType(region, databaseType)).data.results
        )
        .with({ cloudProvider: 'SCW' }, async () => (await cloudProviderApi.listSCWManagedDatabaseType()).data.results)
        .with({ cloudProvider: 'GCP' }, () => undefined)
        .with({ cloudProvider: 'AZURE' }, () => undefined)
        .with({ cloudProvider: 'ON_PREMISE' }, () => undefined)
        .exhaustive()
    },
  }),
})

export const mutations = {
  async createCloudProviderCredential(request: DistributiveOmit<CredentialRequest, 'credentialId'>) {
    const cloudProviderCredential = await match(request)
      .with({ cloudProvider: 'AWS' }, async ({ organizationId, payload }) => {
        const response = await cloudProviderCredentialsApi.createAWSCredentials(organizationId, payload)
        return response.data
      })
      .with({ cloudProvider: 'SCW' }, async ({ organizationId, payload }) => {
        const response = await cloudProviderCredentialsApi.createScalewayCredentials(organizationId, payload)
        return response.data
      })
      .with({ cloudProvider: 'GCP' }, async ({ organizationId, payload }) => {
        const response = await cloudProviderCredentialsApi.createGcpCredentials(organizationId, payload)
        return response.data
      })
      .with({ cloudProvider: 'AZURE' }, async ({ organizationId, payload }) => {
        const response = await cloudProviderCredentialsApi.createAzureCredentials(organizationId, payload)
        return response.data
      })
      .with({ cloudProvider: 'ON_PREMISE' }, () => undefined)
      .exhaustive()

    return cloudProviderCredential
  },
  async editCloudProviderCredential(request: CredentialRequest) {
    const cloudProviderCredential = await match(request)
      .with({ cloudProvider: 'AWS' }, async ({ organizationId, credentialId, payload }) => {
        const response = await cloudProviderCredentialsApi.editAWSCredentials(organizationId, credentialId, payload)
        return response.data
      })
      .with({ cloudProvider: 'SCW' }, async ({ organizationId, credentialId, payload }) => {
        const response = await cloudProviderCredentialsApi.editScalewayCredentials(
          organizationId,
          credentialId,
          payload
        )
        return response.data
      })
      .with({ cloudProvider: 'GCP' }, async ({ organizationId, credentialId, payload }) => {
        const response = await cloudProviderCredentialsApi.editGcpCredentials(organizationId, credentialId, payload)
        return response.data
      })
      .with({ cloudProvider: 'AZURE' }, async ({ organizationId, credentialId, payload }) => {
        const response = await cloudProviderCredentialsApi.editAzureCredentials(organizationId, credentialId, payload)
        return response.data
      })
      .with({ cloudProvider: 'ON_PREMISE' }, () => undefined)
      .exhaustive()

    return cloudProviderCredential
  },
  async deleteCloudProviderCredential(request: DistributiveOmit<CredentialRequest, 'payload'>) {
    const cloudProviderCredential = await match(request)
      .with({ cloudProvider: 'AWS' }, async ({ organizationId, credentialId }) => {
        const response = await cloudProviderCredentialsApi.deleteAWSCredentials(credentialId, organizationId)
        return response.data
      })
      .with({ cloudProvider: 'SCW' }, async ({ organizationId, credentialId }) => {
        const response = await cloudProviderCredentialsApi.deleteScalewayCredentials(credentialId, organizationId)
        return response.data
      })
      .with({ cloudProvider: 'GCP' }, async ({ organizationId, credentialId }) => {
        const response = await cloudProviderCredentialsApi.deleteGcpCredentials(credentialId, organizationId)
        return response.data
      })
      .with({ cloudProvider: 'AZURE' }, async ({ organizationId, credentialId }) => {
        const response = await cloudProviderCredentialsApi.deleteAzureCredentials(credentialId, organizationId)
        return response.data
      })
      .with({ cloudProvider: 'ON_PREMISE' }, () => undefined)
      .exhaustive()

    return cloudProviderCredential
  },
}
