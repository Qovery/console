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
import { Button, Icon, Indicator, useModal, useModalConfirmation } from '@qovery/shared/ui'
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

type CredentialRowProps = {
  credential: ClusterCredentials
  clusters: CredentialCluster[]
  onEdit: () => void
  onOpen: () => void
  onDelete: (() => void) | undefined
}

const CredentialRow = ({ credential, clusters, onEdit, onOpen, onDelete }: CredentialRowProps) => {
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
              <span className="text-neutral-400">{credential.role_arn}</span>
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
              data-testid="view-credential"
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

        {onDelete && (
          <Button
            size="md"
            variant="surface"
            color="neutral"
            onClick={onDelete}
            disabled={clusters.length !== 0}
            type="button"
            data-testid="delete-credential"
            className="h-9 w-9 justify-center p-0"
          >
            <Icon iconName="trash-can" iconStyle="regular" />
          </Button>
        )}
      </div>
    </div>
  )
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

  const credentialRows: CredentialRowProps[] = credentials
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
        onDelete: !clusters || clusters.length === 0 ? () => onDelete(credential) : undefined, // Only show delete button if no clusters are associated
      }
    })
    .filter((item) => item !== null)

  const usedCredentials = useMemo(() => {
    return credentialRows
      .filter((cred) => cred.clusters.length > 0)
      .sort((a, b) => a.credential.name.localeCompare(b.credential.name))
  }, [credentialRows])

  const unusedCredentials = useMemo(() => {
    return credentialRows
      .filter((cred) => cred.clusters.length === 0)
      .sort((a, b) => a.credential.name.localeCompare(b.credential.name))
  }, [credentialRows])

  return (
    <div className="space-y-8">
      {credentialRows.length === 0 && (
        <BlockContent title="Configured credentials" classNameContent="p-0" className="mt-8">
          <div className="my-4 px-10 py-5 text-center">
            <Icon iconName="wave-pulse" className="text-neutral-300" />
            <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">
              All credentials related to your clusters will appear here after creation.
            </p>
          </div>
        </BlockContent>
      )}

      {usedCredentials.length > 0 && (
        <BlockContent title="Configured credentials" classNameContent="p-0" className="mt-8">
          {usedCredentials.map((cred) => (
            <CredentialRow key={cred.credential.id} {...cred} />
          ))}
        </BlockContent>
      )}

      {unusedCredentials.length > 0 && (
        <BlockContent title="Unused credentials" classNameContent="p-0" className="mt-8">
          {unusedCredentials.map((cred) => (
            <CredentialRow key={cred.credential.id} {...cred} />
          ))}
        </BlockContent>
      )}
    </div>
  )
}

const Loader = () => (
  <BlockContent title="Configured credentials" classNameContent="p-0" className="mt-8">
    {[0, 1, 2, 3].map((_, i) => (
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
    ))}
  </BlockContent>
)

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

        <Suspense fallback={<Loader />}>
          <PageOrganizationCredentials />
        </Suspense>
      </Section>
    </div>
  )
}

export default PageOrganizationCredentialsFeature
