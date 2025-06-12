import { type ClusterCredentials } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import { useCloudProviderCredentials } from '@qovery/domains/cloud-providers/feature'
import { ClusterCredentialsModal } from '@qovery/domains/clusters/feature'
import { Button, Icon, useModal } from '@qovery/shared/ui'

export const PageOrganizationCredentials = () => {
  const { openModal, closeModal } = useModal()
  const { organizationId = '' } = useParams()
  const cloudProvider = 'AWS' // TODO [QOV-714] we need a way to get the list of cloud providers

  const { data: credentials = [] } = useCloudProviderCredentials({
    organizationId,
    cloudProvider,
  })
  console.log('credentials', credentials)

  const openCredentialsModal = (id?: string, onChange?: (e: string | string[]) => void) => {
    openModal({
      content: (
        <ClusterCredentialsModal
          organizationId={organizationId}
          clusterId="" // TODO [QOV-714] this value needs to be passed down
          onClose={(response) => {
            response && onChange?.(response.id)
            closeModal()
          }}
          credential={credentials.find((currentCredentials: ClusterCredentials) => currentCredentials.id === id)}
          cloudProvider={cloudProvider}
        />
      ),
      options: {
        width: 680,
      },
    })
  }

  const buildCredentials = credentials?.map((item: ClusterCredentials) => ({
    credential: item,
    onClickEditable: () => openCredentialsModal(item.id),
  }))

  return buildCredentials.length > 0 ? (
    buildCredentials.map((cred) => {
      const { credential, onClickEditable } = cred
      return (
        <div
          className="flex w-full items-center justify-between gap-3 border-b border-neutral-250 px-5 py-4 last:border-0"
          key={credential.id}
        >
          <div className="flex items-start gap-4">
            <Icon name={credential.object_type.split('_')[0]} className="mt-2 text-sm text-neutral-400" />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-400">{credential.name}</span>
              <div className="flex gap-2">
                {'role_arn' in credential && (
                  <div className="text-xs text-neutral-350">
                    <span>Role ARN: </span>
                    <span className="text-neutral-400">{credential.role_arn}</span>
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
            <Button
              size="md"
              variant="surface"
              color="neutral"
              onClick={() => onClickEditable()}
              type="button"
              data-testid="edit-port"
            >
              <Icon iconName="gear" iconStyle="regular" />
            </Button>
            <Button
              size="md"
              variant="surface"
              color="neutral"
              onClick={() => console.log('remove')}
              type="button"
              data-testid="remove-port"
            >
              <Icon iconName="trash" iconStyle="regular" />
            </Button>
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
