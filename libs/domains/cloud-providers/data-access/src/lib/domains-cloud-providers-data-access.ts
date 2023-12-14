import { createQueryKeys } from '@lukemorales/query-key-factory'
import {
  type AwsCredentialsRequest,
  CloudProviderApi,
  CloudProviderCredentialsApi,
  type CloudProviderEnum,
  type DoCredentialsRequest,
  type GcpCredentialsRequest,
  type KubernetesEnum,
  type ScalewayCredentialsRequest,
} from 'qovery-typescript-axios'
import { type DistributiveOmit } from 'react-redux'
import { match } from 'ts-pattern'

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
      cloudProvider: Extract<CloudProviderEnum, 'DO'>
      payload: DoCredentialsRequest
      credentialId: string
    }
  | {
      organizationId: string
      cloudProvider: Extract<CloudProviderEnum, 'GCP'>
      payload: GcpCredentialsRequest
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
        .with('DO', () => cloudProviderApi.listDOFeatures())
        .with('SCW', () => cloudProviderApi.listScalewayFeatures())
        .with('GCP', () => cloudProviderApi.listGcpFeatures())
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
          cloudProvider: Extract<CloudProviderEnum, 'DO'>
          clusterType: Extract<KubernetesEnum, 'MANAGED'>
        }
      | {
          cloudProvider: Extract<CloudProviderEnum, 'GCP'>
          clusterType: Extract<KubernetesEnum, 'MANAGED'>
        }
  ) => ({
    queryKey: [args.cloudProvider, args.clusterType],
    async queryFn() {
      const response = await match(args)
        .with({ cloudProvider: 'AWS', clusterType: 'K3S' }, ({ region }) =>
          cloudProviderApi.listAWSEc2InstanceType(region)
        )
        .with({ cloudProvider: 'AWS', clusterType: 'MANAGED' }, ({ region }) =>
          cloudProviderApi.listAWSEKSInstanceType(region)
        )
        .with({ cloudProvider: 'AWS', clusterType: 'SELF_MANAGED' }, ({ region }) =>
          cloudProviderApi.listAWSEKSInstanceType(region)
        )
        .with({ cloudProvider: 'SCW' }, ({ region }) => cloudProviderApi.listScalewayKapsuleInstanceType(region))
        .with({ cloudProvider: 'DO' }, () => cloudProviderApi.listDOInstanceType())
        .with({ cloudProvider: 'GCP' }, () => Promise.resolve({ data: { results: [] } }))
        .exhaustive()
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
        /*
         * @deprecated Digital Ocean is not supported anymore (should be remove on the API doc)
         */
        .with('DO', async () => {
          const response = await cloudProviderCredentialsApi.listDOCredentials(organizationId)
          return response.data.results
        })
        .exhaustive()

      return cloudProviders
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
        const response = await cloudProviderCredentialsApi.createGCPCredentials(organizationId, payload)
        return response.data
      })
      /*
       * @deprecated Digital Ocean is not supported anymore (should be remove on the API doc)
       */
      .with({ cloudProvider: 'DO' }, async ({ organizationId, payload }) => {
        const response = await cloudProviderCredentialsApi.createDOCredentials(organizationId, payload)
        return response.data
      })
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
      /*
       * @deprecated Digital Ocean is not supported anymore (should be remove on the API doc)
       */
      .with({ cloudProvider: 'DO' }, async ({ organizationId, credentialId, payload }) => {
        const response = await cloudProviderCredentialsApi.editDOCredentials(organizationId, credentialId, payload)
        return response.data
      })
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
      /*
       * @deprecated Digital Ocean is not supported anymore (should be remove on the API doc)
       */
      .with({ cloudProvider: 'DO' }, async ({ organizationId, credentialId }) => {
        const response = await cloudProviderCredentialsApi.deleteDOCredentials(credentialId, organizationId)
        return response.data
      })
      .exhaustive()

    return cloudProviderCredential
  },
}
