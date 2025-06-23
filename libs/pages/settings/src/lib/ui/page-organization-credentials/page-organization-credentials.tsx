import { CloudProviderEnum, type ClusterCredentials, type CredentialCluster } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeleteCloudProviderCredential } from '@qovery/domains/cloud-providers/feature'
import { ClusterAvatar, ClusterCredentialsModal, CredentialsListClustersModal } from '@qovery/domains/clusters/feature'
import { useOrganizationCredentials } from '@qovery/domains/organizations/feature'
import { Button, Icon, Indicator, Tooltip, useModal, useModalConfirmation } from '@qovery/shared/ui'

const toCloudProvider = (cloudProvider: ClusterCredentials['object_type']): CloudProviderEnum => {
  return match(cloudProvider)
    .with('AWS', () => CloudProviderEnum.AWS)
    .with('AWS_ROLE', () => CloudProviderEnum.AWS)
    .with('AZURE', () => CloudProviderEnum.AZURE)
    .with('SCW', () => CloudProviderEnum.SCW)
    .with('OTHER', () => CloudProviderEnum.ON_PREMISE)
    .exhaustive()
}

export const PageOrganizationCredentials = () => {
  const { openModal, closeModal } = useModal()
  const { organizationId = '' } = useParams()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: deleteCloudProviderCredential } = useDeleteCloudProviderCredential()

  const { data: organizationCredentials = [] } = useOrganizationCredentials({
    organizationId,
  })
  const credentials = useMemo(
    () => organizationCredentials.filter((item) => item.credential?.object_type !== 'OTHER'),
    [organizationCredentials]
  )

  const onEdit = (credential: ClusterCredentials, clusters: CredentialCluster[]) => {
    openModal({
      content: (
        <ClusterCredentialsModal
          organizationId={organizationId}
          // clusterId="" // TODO [QOV-714] this value needs to be passed down
          onClose={(response) => {
            // response && onChange?.(response.id)
            closeModal()
          }}
          credential={credential}
          cloudProvider={toCloudProvider(credential.object_type)}
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
        width: 680,
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
      action: async () => {
        if (credential.id) {
          try {
            await deleteCloudProviderCredential({
              organizationId,
              cloudProvider: toCloudProvider(credential.object_type),
              credentialId: credential.id,
            })
            // onClose()
          } catch (error) {
            console.error(error)
          }
        }
      },
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
        onEdit: () => onEdit(credential, clusters ?? []),
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
          className="flex w-full items-center justify-between gap-3 border-b border-neutral-250 px-5 py-4 last:border-0"
          key={credential.id}
        >
          <div className="flex items-start gap-4">
            <ClusterAvatar cloudProvider={toCloudProvider(credential.object_type)} size="sm" />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-400">{credential.name}</span>
              <div className="flex gap-2">
                {'role_arn' in credential && (
                  <div className="text-xs text-neutral-350">
                    <span>Role ARN: </span>
                    <span className="text-neutral-400">{credential.role_arn || ''}</span>
                  </div>
                )}
                {'access_key_id' in credential && (
                  <div className=" text-xs text-neutral-350">
                    <span>Public Access Key: </span>
                    <span className="text-neutral-400">{credential.access_key_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {clusters.length > 0 && (
              <Indicator
                align="end"
                content={
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-center text-xs text-white">
                    {clusters.length}
                  </span>
                }
                side="top"
              >
                <Button
                  size="md"
                  variant="surface"
                  color="neutral"
                  onClick={onOpen}
                  type="button"
                  data-testid="edit-credential"
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
              >
                <Icon iconName="trash" iconStyle="regular" />
              </Button>
            </Tooltip>
          </div>
        </div>
      )
    })
  ) : (
    // TODO [QOV-714] check if an empty state exists on the Figma screen
    <div className="my-4 px-10 py-5 text-center">
      <Icon iconName="wave-pulse" className="text-neutral-300" />
      <p className="mb-3 mt-1 text-xs font-medium text-neutral-350">No credentials are set.</p>
    </div>
  )
}
