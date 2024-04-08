import { type OrganizationAnnotationsGroupResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import {
  AnnotationCreateEditModal,
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

  const openEditModal = (annotation: OrganizationAnnotationsGroupResponse) => {
    openModal({
      content: (
        <AnnotationCreateEditModal organizationId={organizationId} annotation={annotation} onClose={closeModal} />
      ),
    })
  }

  const openDeleteModal = (annotation: OrganizationAnnotationsGroupResponse) => {
    openModalConfirmation({
      title: 'Delete webhook',
      isDelete: true,
      name: annotation.name,
      action: () => {
        try {
          deleteAnnotationsGroup({ organizationId, annotationId: annotation.id })
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8 gap-3">
          <div>
            <Heading className="mb-2">Annotations</Heading>
            <p className="text-neutral-400 text-xs">
              Define and manage the annotations to be used within your organization.
            </p>
          </div>
          <Button size="lg" className="gap-2 shrink-0" onClick={openAddModal}>
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
                  className="flex justify-between items-center px-5 py-4 border-b border-neutral-250 last:border-0"
                >
                  <div className="flex flex-col">
                    <h2 className="flex text-xs text-neutral-400 font-medium mb-1">
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
                    <Button size="md" variant="outline" color="neutral" onClick={() => openEditModal(annotationsGroup)}>
                      <Icon iconName="gear" />
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      color="neutral"
                      onClick={() => openDeleteModal(annotationsGroup)}
                    >
                      <Icon iconName="trash" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center my-4 px-5">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="text-neutral-350 font-medium text-xs mt-1">
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
