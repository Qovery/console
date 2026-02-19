import { useParams } from '@tanstack/react-router'
import { type HelmRepositoryResponse } from 'qovery-typescript-axios'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { BlockContent, Button, Icon, Indicator, LoaderSpinner, Section, Tooltip, Truncate } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { HelmRepositoryCreateEditModal } from '../helm-repository-create-edit-modal/helm-repository-create-edit-modal'
import { HelmRepositoryServicesListModal } from '../helm-repository-services-list-modal/helm-repository-services-list-modal'
import { useDeleteHelmRepository } from '../hooks/use-delete-helm-repository/use-delete-helm-repository'
import { useHelmRepositories } from '../hooks/use-helm-repositories/use-helm-repositories'

export interface PageOrganizationHelmRepositoriesProps {
  onOpenServicesAssociatedModal: (repository: HelmRepositoryResponse) => void
  onAddRepository: () => void
  onEdit: (repository: HelmRepositoryResponse) => void
  onDelete: (repository: HelmRepositoryResponse) => void
  helmRepositories?: HelmRepositoryResponse[]
  isFetched?: boolean
}

export function PageOrganizationHelmRepositories({
  helmRepositories,
  isFetched,
  onAddRepository,
  onEdit,
  onDelete,
  onOpenServicesAssociatedModal,
}: PageOrganizationHelmRepositoriesProps) {
  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <div className="relative">
          <SettingsHeading
            title="Helm repositories"
            description="Define and manage the helm repository to be used within your organization to deploy applications."
          />
          <Button size="md" className="absolute right-0 top-0 shrink-0 gap-2" onClick={() => onAddRepository()}>
            Add repository
            <Icon iconName="circle-plus" iconStyle="regular" />
          </Button>
        </div>
        <div className="max-w-content-with-navigation-left">
          <BlockContent title="Helm repositories" classNameContent="p-0">
            {!isFetched ? (
              <div data-testid="repositories-loader" className="flex justify-center p-5">
                <LoaderSpinner className="w-6" />
              </div>
            ) : helmRepositories && helmRepositories.length > 0 ? (
              <ul>
                {helmRepositories?.map((repository: HelmRepositoryResponse) => (
                  <li
                    data-testid={`repositories-list-${repository.id}`}
                    key={repository.id}
                    className="flex items-center justify-between border-b border-neutral px-5 py-4 last:border-0"
                  >
                    <div className="flex">
                      <Icon name={IconEnum.HELM_OFFICIAL} width="20" height="20" />
                      <div className="ml-4">
                        <h2 className="mb-1 flex text-xs font-medium text-neutral">
                          <Truncate
                            truncateLimit={60}
                            text={`${repository.name}${repository.config?.access_key_id ? ` (${repository.config?.access_key_id})` : repository.config?.scaleway_access_key ? ` (${repository.config?.scaleway_access_key})` : repository.config?.username ? ` (${repository.config?.username})` : ''}`}
                          />
                          {repository.description && (
                            <Tooltip content={repository.description}>
                              <div className="ml-1 cursor-pointer">
                                <Icon iconName="circle-info" iconStyle="regular" />
                              </div>
                            </Tooltip>
                          )}
                        </h2>
                        <p className="text-xs text-neutral-subtle">{repository.url}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Indicator
                        content={
                          <span className="relative right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface-brand-solid text-3xs font-bold leading-[0] text-neutralInvert">
                            {repository.associated_services_count}
                          </span>
                        }
                      >
                        <Button
                          variant="outline"
                          color="neutral"
                          iconOnly
                          size="md"
                          disabled={repository.associated_services_count === 0}
                          onClick={() => onOpenServicesAssociatedModal(repository)}
                        >
                          <Icon iconName="layer-group" iconStyle="regular" />
                        </Button>
                      </Indicator>
                      <Button size="md" variant="outline" color="neutral" iconOnly onClick={() => onEdit(repository)}>
                        <Icon iconName="gear" iconStyle="regular" />
                      </Button>
                      <Button size="md" variant="outline" color="neutral" iconOnly onClick={() => onDelete(repository)}>
                        <Icon iconName="trash-can" iconStyle="regular" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="my-4 px-5 text-center">
                <Icon iconName="wave-pulse" className="text-neutral-subtle" />
                <p className="mt-1 text-xs font-medium text-neutral-subtle">
                  No helm repository found. <br /> Please add one.
                </p>
              </div>
            )}
          </BlockContent>
        </div>
      </Section>
    </div>
  )
}

export function SettingsHelmRepositories() {
  const { organizationId = '' } = useParams({ strict: false })

  useDocumentTitle('Helm repositories - Organization settings')

  const { data: helmRepositories = [], isFetched: isFetchedHelmRepositories } = useHelmRepositories({
    organizationId,
  })
  const { mutateAsync: deleteHelmRepository } = useDeleteHelmRepository()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <PageOrganizationHelmRepositories
      helmRepositories={helmRepositories}
      isFetched={isFetchedHelmRepositories}
      onAddRepository={() => {
        openModal({
          content: <HelmRepositoryCreateEditModal organizationId={organizationId} onClose={closeModal} />,
          options: {
            fakeModal: true,
          },
        })
      }}
      onEdit={(repository: HelmRepositoryResponse) => {
        openModal({
          content: (
            <HelmRepositoryCreateEditModal
              organizationId={organizationId}
              onClose={closeModal}
              repository={repository}
              isEdit
            />
          ),
          options: {
            fakeModal: true,
          },
        })
      }}
      onDelete={(repository: HelmRepositoryResponse) => {
        openModalConfirmation({
          title: 'Delete helm repository',
          confirmationMethod: 'action',
          name: repository?.name,
          action: async () => {
            try {
              await deleteHelmRepository({
                organizationId: organizationId,
                helmRepositoryId: repository.id,
              })
            } catch (error) {
              console.error(error)
            }
          },
        })
      }}
      onOpenServicesAssociatedModal={(repository: HelmRepositoryResponse) => {
        openModal({
          content: (
            <HelmRepositoryServicesListModal
              organizationId={organizationId}
              helmRepositoryId={repository.id}
              onClose={closeModal}
              associatedServicesCount={repository.associated_services_count ?? 0}
            />
          ),
        })
      }}
    />
  )
}
