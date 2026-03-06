import { useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { CloudProviderEnum, type ClusterCredentials, type CredentialCluster } from 'qovery-typescript-axios'
import { Suspense, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { useDeleteCloudProviderCredential } from '@qovery/domains/cloud-providers/feature'
import { ClusterAvatar, ClusterCredentialsModal, CredentialsListClustersModal } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { BlockContent, Section, Skeleton } from '@qovery/shared/ui'
import { Button, DropdownMenu, Icon, Indicator, useModal, useModalConfirmation } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { queries } from '@qovery/state/util-queries'
import { useOrganizationCredentials } from '../hooks/use-organization-credentials/use-organization-credentials'

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
      className="grid w-full grid-cols-[1fr_auto] items-center justify-between gap-3 border-b border-neutral px-5 py-4 last:border-0"
      key={credential.id}
    >
      <div className="grid grid-cols-[32px_1fr] gap-2">
        <ClusterAvatar
          cloudProvider={convertToCloudProviderEnum(credential.object_type)}
          size="sm"
          className="-ml-1.5"
        />
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium text-neutral">{credential.name}</span>

          {'role_arn' in credential && (
            <span className="mt-1 text-xs">
              <span className="text-neutral-subtle">Role ARN: </span>
              <span className="text-neutral">{credential.role_arn}</span>
            </span>
          )}
          {'access_key_id' in credential && (
            <span className="mt-1 text-xs">
              <span className="text-neutral-subtle">Public Access Key: </span>
              <span className="text-neutral">{credential.access_key_id}</span>
            </span>
          )}
          {'scaleway_access_key' in credential && (
            <span className="mt-1 text-xs">
              <span className="text-neutral-subtle">Access Key: </span>
              <span className="text-neutral">{credential.scaleway_access_key}</span>
            </span>
          )}
          {'scaleway_project_id' in credential && (
            <span className="mt-1 text-xs">
              <span className="text-neutral-subtle">Project ID: </span>
              <span className="text-neutral">{credential.scaleway_project_id}</span>
            </span>
          )}
          {'azure_tenant_id' in credential && (
            <span className="mt-1 text-xs">
              <span className="text-neutral-subtle">Tenant ID: </span>
              <span className="text-neutral">{credential.azure_tenant_id}</span>
            </span>
          )}
          {'azure_subscription_id' in credential && (
            <span className="mt-1 text-xs">
              <span className="text-neutral-subtle">Subscription ID: </span>
              <span className="text-neutral">{credential.azure_subscription_id}</span>
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {clusters.length > 0 && (
          <Indicator
            content={
              <span className="relative right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface-brand-solid text-3xs font-bold leading-[0] text-neutralInvert">
                {clusters.length}
              </span>
            }
          >
            <Button
              size="md"
              variant="outline"
              color="neutral"
              onClick={onOpen}
              type="button"
              data-testid="view-credential"
              iconOnly
            >
              <Icon iconName="link" iconStyle="regular" />
            </Button>
          </Indicator>
        )}

        <Button
          size="md"
          variant="outline"
          color="neutral"
          onClick={onEdit}
          type="button"
          iconOnly
          data-testid="edit-credential"
        >
          <Icon iconName="gear" iconStyle="regular" />
        </Button>

        {onDelete && (
          <Button
            size="md"
            variant="outline"
            color="neutral"
            iconOnly
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
  const { organizationId = '' } = useParams({ strict: false })
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
          onClose={() => {
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
      confirmationMethod: 'action',
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
    <>
      {credentialRows.length === 0 && (
        <BlockContent title="Configured credentials" classNameContent="p-0">
          <div className="my-4 px-10 py-5 text-center">
            <Icon iconName="wave-pulse" className="text-neutral-disabled" />
            <p className="mb-3 mt-1 text-xs font-medium text-neutral-subtle">
              All credentials related to your clusters will appear here after creation.
            </p>
          </div>
        </BlockContent>
      )}

      {usedCredentials.length > 0 && (
        <BlockContent title="Configured credentials" classNameContent="p-0">
          {usedCredentials.map((cred) => (
            <CredentialRow key={cred.credential.id} {...cred} />
          ))}
        </BlockContent>
      )}

      {unusedCredentials.length > 0 && (
        <BlockContent title="Unused credentials" classNameContent="p-0">
          {unusedCredentials.map((cred) => (
            <CredentialRow key={cred.credential.id} {...cred} />
          ))}
        </BlockContent>
      )}
    </>
  )
}

const Loader = () => (
  <BlockContent title="Configured credentials" classNameContent="p-0">
    {[0, 1, 2, 3].map((_, i) => (
      <div
        key={i}
        className="grid w-full grid-cols-[1fr_auto] items-center justify-between gap-3 border-b border-neutral px-5 py-4 last:border-0"
      >
        <div className="grid grid-cols-[32px_1fr] gap-2">
          <Skeleton width={32} height={32} show={true} rounded className="-ml-1.5 shrink-0" />
          <div className="flex flex-col justify-center">
            <Skeleton width={140} height={12} show={true} className="mb-2" />
            <Skeleton width={220} height={12} show={true} />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton width={32} height={32} show={true} />
          <Skeleton width={32} height={32} show={true} />
          <Skeleton width={32} height={32} show={true} />
        </div>
      </div>
    ))}
  </BlockContent>
)

export function SettingsCloudCredentials() {
  useDocumentTitle('Cloud Crendentials - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()
  const queryClient = useQueryClient()
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)

  const cloudProviderOptions = [
    {
      label: 'AWS',
      value: CloudProviderEnum.AWS,
    },
    {
      label: 'GCP',
      value: CloudProviderEnum.GCP,
    },
    {
      label: 'Azure',
      value: CloudProviderEnum.AZURE,
    },
    {
      label: 'Scaleway',
      value: CloudProviderEnum.SCW,
    },
  ]

  const openClusterCredentialsModal = (cloudProvider: CloudProviderEnum) => {
    openModal({
      content: (
        <ClusterCredentialsModal
          organizationId={organizationId}
          onClose={(response) => {
            if (response) {
              queryClient.invalidateQueries({
                queryKey: queries.organizations.listCredentials({ organizationId }).queryKey,
              })
            }
            closeModal()
          }}
          cloudProvider={cloudProvider}
        />
      ),
      options: {
        width: 680,
      },
    })
  }

  const onSelectProvider = (cloudProvider: CloudProviderEnum) => {
    setIsCreateMenuOpen(false)
    openClusterCredentialsModal(cloudProvider)
  }

  return (
    <div className="w-full">
      <Section className="p-8">
        <div className="relative">
          <SettingsHeading title="Cloud Credentials" description="Manage your Cloud providers credentials." />

          <DropdownMenu.Root open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
            <DropdownMenu.Trigger asChild>
              <Button size="md" className="absolute right-0 top-0 shrink-0 gap-2">
                <Icon iconName="circle-plus" iconStyle="regular" />
                New credential
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              {cloudProviderOptions.map((option) => (
                <DropdownMenu.Item
                  key={option.value}
                  color="neutral"
                  icon={<Icon name={option.value} width={16} height={16} />}
                  onClick={() => onSelectProvider(option.value)}
                >
                  {option.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <div className="max-w-content-with-navigation-left space-y-8">
          <Suspense fallback={<Loader />}>
            <PageOrganizationCredentials />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}
