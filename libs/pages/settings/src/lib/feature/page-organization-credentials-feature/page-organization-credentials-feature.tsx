import { CloudProviderEnum, type ClusterCredentials, type CredentialCluster } from 'qovery-typescript-axios'
import { Suspense } from 'react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeleteCloudProviderCredential } from '@qovery/domains/cloud-providers/feature'
import { ClusterAvatar, ClusterCredentialsModal, CredentialsListClustersModal } from '@qovery/domains/clusters/feature'
import { useOrganizationCredentials } from '@qovery/domains/organizations/feature'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { BlockContent, Heading, Section, Skeleton } from '@qovery/shared/ui'
import { Button, Icon, Indicator, Tooltip, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

const convertToCloudProviderEnum = (cloudProvider: ClusterCredentials['object_type']): CloudProviderEnum => {
  return match(cloudProvider)
    .with('AWS', () => CloudProviderEnum.AWS)
    .with('AWS_ROLE', () => CloudProviderEnum.AWS)
    .with('AZURE', () => CloudProviderEnum.AZURE)
    .with('SCW', () => CloudProviderEnum.SCW)
    .with('OTHER', () => CloudProviderEnum.ON_PREMISE)
    .with('GCP', () => CloudProviderEnum.GCP)
    .exhaustive()
}

const PageOrganizationCredentials = () => {
  const { openModal, closeModal } = useModal()
  const { organizationId = '' } = useParams()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutate: deleteCloudProviderCredential } = useDeleteCloudProviderCredential()

  const { data: organizationCredentials = [] } = useOrganizationCredentials({
    organizationId,
  })
  const credentials = useMemo(
    () => organizationCredentials.filter((item) => item.credential?.object_type !== 'OTHER'),
    [organizationCredentials]
  )

  const onEdit = (credential: ClusterCredentials) => {
    openModal({
      content: (
        <ClusterCredentialsModal
          organizationId={organizationId}
          onClose={(response) => {
            closeModal()
          }}
          credential={credential}
          cloudProvider={convertToCloudProviderEnum(credential.object_type)}
        />
      ),
      options: {
        width: 680,
      },
    })
  }

  const onOpen = (credential: ClusterCredentials, clusters: CredentialCluster[]) => {
    openModal({
      content: (
        <CredentialsListClustersModal
          clusters={clusters}
          credential={credential}
          onClose={() => closeModal()}
          organizationId={organizationId}
        />
      ),
      options: {
        width: 480,
      },
    })
  }

  const onDelete = async (credential: ClusterCredentials) => {
    openModalConfirmation({
      title: 'Delete credential',
      description: (
        <p>
          To confirm the deletion of <strong>{credential.name}</strong>, please type "delete"
        </p>
      ),
      name: credential.name,
      isDelete: true,
      action: () =>
        deleteCloudProviderCredential({
          organizationId,
          cloudProvider: convertToCloudProviderEnum(credential.object_type),
          credentialId: credential.id,
        }),
    })
  }

  const buildCredentials: {
    credential: ClusterCredentials
    clusters: CredentialCluster[]
    onEdit: () => void
    onOpen: () => void
    onDelete: () => void
  }[] = credentials
    ?.map((item) => {
      const { credential, clusters } = item

      if (!credential) {
        return null
      }

      return {
        credential,
        clusters: clusters ?? [],
        onEdit: () => onEdit(credential),
        onOpen: () => onOpen(credential, clusters ?? []),
        onDelete: () => onDelete(credential),
      }
    })
    .filter((item) => item !== null)

  return buildCredentials.length > 0 ? (
    buildCredentials.map((cred) => {
      const { credential, clusters, onEdit, onOpen, onDelete } = cred

      return (
        <div
          className="grid w-full grid-cols-[1fr_auto] items-center justify-between gap-3 border-b border-neutral-250 px-5 py-4 last:border-0"
          key={credential.id}
        >
          <div className="grid grid-cols-[32px_1fr] gap-2">
            <ClusterAvatar
              cloudProvider={convertToCloudProviderEnum(credential.object_type)}
              size="sm"
              className="-ml-1.5"
            />
            <div className="flex flex-col justify-center">
              <span className="text-xs font-medium text-neutral-400">{credential.name}</span>

              {'role_arn' in credential && (
                <span className="mt-1 text-xs">
                  <span className="text-neutral-350">Role ARN: </span>
                  <span className="text-neutral-400">{credential.role_arn || ''}</span>
                </span>
              )}
              {'access_key_id' in credential && (
                <span className="mt-1 text-xs">
                  <span className="text-neutral-350">Public Access Key: </span>
                  <span className="text-neutral-400">{credential.access_key_id}</span>
                </span>
              )}
              {'scaleway_access_key' in credential && (
                <span className="mt-1 text-xs">
                  <span className="text-neutral-350">Access Key: </span>
                  <span className="text-neutral-400">{credential.scaleway_access_key}</span>
                </span>
              )}
              {'scaleway_project_id' in credential && (
                <span className="mt-1 text-xs">
                  <span className="text-neutral-350">Project ID: </span>
                  <span className="text-neutral-400">{credential.scaleway_project_id}</span>
                </span>
              )}
              {'azure_tenant_id' in credential && (
                <span className="mt-1 text-xs">
                  <span className="text-neutral-350">Tenant ID: </span>
                  <span className="text-neutral-400">{credential.azure_tenant_id}</span>
                </span>
              )}
              {'azure_subscription_id' in credential && (
                <span className="mt-1 text-xs">
                  <span className="text-neutral-350">Subscription ID: </span>
                  <span className="text-neutral-400">{credential.azure_subscription_id}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {clusters.length > 0 && (
              <Indicator
                content={
                  <span className="relative right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 text-3xs font-bold leading-[0] text-white">
                    {clusters.length}
                  </span>
                }
              >
                <Button
                  size="md"
                  variant="surface"
                  color="neutral"
                  onClick={onOpen}
                  type="button"
                  data-testid="edit-credential"
                  className="h-9 w-9 justify-center p-0"
                >
                  <Icon iconName="link" iconStyle="regular" />
                </Button>
              </Indicator>
            )}

            <Button
              size="md"
              variant="surface"
              color="neutral"
              onClick={onEdit}
              type="button"
              data-testid="edit-credential"
              className="h-9 w-9 justify-center p-0"
            >
              <Icon iconName="gear" iconStyle="regular" />
            </Button>

            <Tooltip content="Attached credentials cannot be deleted" side="top" disabled={clusters.length === 0}>
              <Button
                size="md"
                variant="surface"
                color="neutral"
                onClick={onDelete}
                disabled={clusters.length !== 0}
                type="button"
                data-testid="remove-credential"
                className="h-9 w-9 justify-center p-0"
              >
                <Icon iconName="trash-can" iconStyle="regular" />
              </Button>
            </Tooltip>
          </div>
        </div>
      )
    })
  ) : (
    <div className="my-4 px-10 py-5 text-center">
      <Icon iconName="wave-pulse" className="text-neutral-300" />
      <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">
        All credentials related to your clusters will appear here after creation.
      </p>
    </div>
  )
}

const Loader = () =>
  [0, 1, 2, 3].map((_, i) => (
    <div
      key={i}
      className="flex w-full items-center justify-between gap-3 border-b border-neutral-250 px-5 py-4 last:border-0"
    >
      <Skeleton width={200} height={36} show={true} />
      <div className="flex gap-2">
        <Skeleton width={36} height={36} show={true} />
        <Skeleton width={36} height={36} show={true} />
      </div>
    </div>
  ))

export function PageOrganizationCredentialsFeature() {
  useDocumentTitle('Cloud Crendentials - Organization settings')

  return (
    <div className="w-full">
      <Section className="flex max-w-content-with-navigation-left flex-col p-8">
        <div className="space-y-3">
          <Heading>Cloud Credentials</Heading>
          <p className="text-xs text-neutral-400">Manage your Cloud providers credentials</p>
          <NeedHelp />
        </div>

        <BlockContent title="Configured credentials" classNameContent="p-0" className="mt-8">
          <Suspense fallback={<Loader />}>
            <PageOrganizationCredentials />
          </Suspense>
        </BlockContent>
      </Section>
    </div>
  )
}

export default PageOrganizationCredentialsFeature
