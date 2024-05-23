import { type OrganizationAnnotationsGroupResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import {
  AnnotationCreateEditModal,
  AnnotationItemsListModal,
  useAnnotationsGroups,
  useDeleteAnnotationsGroup,
} from '@qovery/domains/organizations/feature'
import {
  BlockContent,
  Button,
  Heading,
  Icon,
  LoaderSpinner,
  Section,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageOrganizationLabelsAnnotationsFeature() {
  useDocumentTitle('Annotations - Organization settings')
  const { organizationId = '' } = useParams()
  const { data: annotationsGroups = [], isFetched: isFetchedAnnotations } = useAnnotationsGroups({ organizationId })
  const { mutateAsync: deleteAnnotationsGroup } = useDeleteAnnotationsGroup()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const openAddModal = () => {
    openModal({
      content: <AnnotationCreateEditModal organizationId={organizationId} onClose={closeModal} />,
    })
  }

  const openEditModal = (annotationsGroup: OrganizationAnnotationsGroupResponse) => {
    openModal({
      content: (
        <AnnotationCreateEditModal
          isEdit
          organizationId={organizationId}
          annotationsGroup={annotationsGroup}
          onClose={closeModal}
        />
      ),
    })
  }

  const openDeleteModal = (annotationsGroup: OrganizationAnnotationsGroupResponse) => {
    openModalConfirmation({
      title: 'Delete webhook',
      isDelete: true,
      name: annotationsGroup.name,
      action: () => {
        try {
          deleteAnnotationsGroup({ organizationId, annotationsGroupId: annotationsGroup.id })
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <div className="mb-8 flex justify-between gap-3">
          <div>
            <Heading className="mb-2">Annotations</Heading>
            <p className="text-xs text-neutral-400">
              Define and manage the annotations to be used within your organization.
            </p>
          </div>
          <Button size="lg" className="shrink-0 gap-2" onClick={openAddModal}>
            Add annotation
            <Icon iconName="circle-plus" />
          </Button>
        </div>
        <BlockContent title="Annotations groups" classNameContent="p-0">
          {!isFetchedAnnotations ? (
            <div className="flex justify-center p-5">
              <LoaderSpinner className="w-6" />
            </div>
          ) : annotationsGroups && annotationsGroups.length > 0 ? (
            <ul>
              {annotationsGroups.map((annotationsGroup) => (
                <li
                  key={annotationsGroup.id}
                  className="flex items-center justify-between border-b border-neutral-250 px-5 py-4 last:border-0"
                >
                  <div className="flex flex-col">
                    <h2 className="mb-1 flex text-xs font-medium text-neutral-400">
                      <Truncate truncateLimit={60} text={annotationsGroup.name} />
                    </h2>
                    <div className="flex text-xs text-neutral-350">
                      <p>
                        Created:{' '}
                        <span className="text-neutral-400">{dateMediumLocalFormat(annotationsGroup.created_at)}</span>
                      </p>
                      {annotationsGroup.updated_at && (
                        <p className="ml-3">
                          Updated:{' '}
                          <span className="text-neutral-400">{timeAgo(new Date(annotationsGroup.updated_at))}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      color="neutral"
                      size="md"
                      className="relative mr-2"
                      disabled={annotationsGroup.associated_items_count === 0}
                      onClick={() => {
                        openModal({
                          content: (
                            <AnnotationItemsListModal
                              organizationId={organizationId}
                              annotationsGroupId={annotationsGroup.id}
                              onClose={closeModal}
                              associatedItemsCount={annotationsGroup.associated_items_count ?? 0}
                            />
                          ),
                        })
                      }}
                    >
                      <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 text-3xs font-bold leading-[0] text-white">
                        {annotationsGroup.associated_items_count}
                      </span>
                      <Icon iconName="layer-group" />
                    </Button>
                    <Button size="md" variant="outline" color="neutral" onClick={() => openEditModal(annotationsGroup)}>
                      <Icon iconName="gear" />
                    </Button>
                    <Tooltip
                      content="Annotations group still in used"
                      disabled={annotationsGroup.associated_items_count === 0}
                    >
                      <Button
                        size="md"
                        variant="outline"
                        color="neutral"
                        disabled={annotationsGroup.associated_items_count !== 0}
                        onClick={() => openDeleteModal(annotationsGroup)}
                      >
                        <Icon iconName="trash" />
                      </Button>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="my-4 px-5 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="mt-1 text-xs font-medium text-neutral-350">
                No annotation found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>
      </Section>
    </div>
  )
}

export default PageOrganizationLabelsAnnotationsFeature
