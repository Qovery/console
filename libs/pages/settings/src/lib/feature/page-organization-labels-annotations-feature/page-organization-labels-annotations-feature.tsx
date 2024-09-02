import { useParams } from 'react-router-dom'
import {
  AnnotationCreateEditModal,
  LabelAnnotationItemsListModal,
  LabelCreateEditModal,
  useAnnotationsGroups,
  useDeleteAnnotationsGroup,
  useDeleteLabelsGroup,
  useLabelsGroups,
} from '@qovery/domains/organizations/feature'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import {
  BlockContent,
  Button,
  DropdownMenu,
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
  const { data: labelsGroups = [], isFetched: isFetchedLabels } = useLabelsGroups({ organizationId })
  const { mutateAsync: deleteAnnotationsGroup } = useDeleteAnnotationsGroup()
  const { mutateAsync: deleteLabelsGroup } = useDeleteLabelsGroup()

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <div className="mb-8 flex justify-between gap-3">
          <div className="space-y-3">
            <Heading>Labels & Annotations</Heading>
            <p className="text-xs text-neutral-400">
              Define and manage the labels & annotations to be used within your organization.
            </p>
            <NeedHelp />
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button size="md" className="shrink-0 gap-2">
                Add new
                <Icon iconName="circle-plus" iconStyle="regular" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                icon={<Icon iconName="plus" />}
                onClick={() => {
                  openModal({
                    content: <LabelCreateEditModal organizationId={organizationId} onClose={closeModal} />,
                  })
                }}
              >
                Add labels group
              </DropdownMenu.Item>
              <DropdownMenu.Item
                icon={<Icon iconName="plus" />}
                onClick={() => {
                  openModal({
                    content: <AnnotationCreateEditModal organizationId={organizationId} onClose={closeModal} />,
                  })
                }}
              >
                Add annotations group
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <BlockContent title="Labels groups" classNameContent="p-0">
          {!isFetchedLabels ? (
            <div className="flex justify-center p-5">
              <LoaderSpinner className="w-6" />
            </div>
          ) : labelsGroups && labelsGroups.length > 0 ? (
            <ul>
              {labelsGroups.map((labelsGroup) => (
                <li
                  key={labelsGroup.id}
                  className="flex items-center justify-between border-b border-neutral-250 px-5 py-4 last:border-0"
                >
                  <div className="flex flex-col">
                    <h2 className="mb-1 flex text-xs font-medium text-neutral-400">
                      <Truncate truncateLimit={60} text={labelsGroup.name} />
                    </h2>
                    <div className="flex text-xs text-neutral-350">
                      <p>
                        Created:{' '}
                        <span className="text-neutral-400">{dateMediumLocalFormat(labelsGroup.created_at)}</span>
                      </p>
                      {labelsGroup.updated_at && (
                        <p className="ml-3">
                          Updated: <span className="text-neutral-400">{timeAgo(new Date(labelsGroup.updated_at))}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="surface"
                      color="neutral"
                      size="md"
                      className="relative mr-2"
                      disabled={labelsGroup.associated_items_count === 0}
                      onClick={() => {
                        openModal({
                          content: (
                            <LabelAnnotationItemsListModal
                              type="label"
                              organizationId={organizationId}
                              groupId={labelsGroup.id}
                              onClose={closeModal}
                              associatedItemsCount={labelsGroup.associated_items_count ?? 0}
                            />
                          ),
                        })
                      }}
                    >
                      <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 text-3xs font-bold leading-[0] text-white">
                        {labelsGroup.associated_items_count}
                      </span>
                      <Icon iconName="layer-group" iconStyle="regular" />
                    </Button>
                    <Button
                      size="md"
                      variant="surface"
                      color="neutral"
                      onClick={() => {
                        openModal({
                          content: (
                            <LabelCreateEditModal
                              isEdit
                              organizationId={organizationId}
                              labelsGroup={labelsGroup}
                              onClose={closeModal}
                            />
                          ),
                        })
                      }}
                    >
                      <Icon iconName="gear" iconStyle="regular" />
                    </Button>
                    <Tooltip content="Labels group still in used" disabled={labelsGroup.associated_items_count === 0}>
                      <Button
                        size="md"
                        variant="surface"
                        color="neutral"
                        disabled={labelsGroup.associated_items_count !== 0}
                        onClick={() => {
                          openModalConfirmation({
                            title: 'Delete labels group',
                            isDelete: true,
                            name: labelsGroup.name,
                            action: () => {
                              try {
                                deleteLabelsGroup({ organizationId, labelsGroupId: labelsGroup.id })
                              } catch (error) {
                                console.error(error)
                              }
                            },
                          })
                        }}
                      >
                        <Icon iconName="trash-can" iconStyle="regular" />
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
                No labels group found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>
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
                      variant="surface"
                      color="neutral"
                      size="md"
                      className="relative mr-2"
                      disabled={annotationsGroup.associated_items_count === 0}
                      onClick={() => {
                        openModal({
                          content: (
                            <LabelAnnotationItemsListModal
                              type="annotation"
                              organizationId={organizationId}
                              groupId={annotationsGroup.id}
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
                      <Icon iconName="layer-group" iconStyle="regular" />
                    </Button>
                    <Button
                      size="md"
                      variant="surface"
                      color="neutral"
                      onClick={() => {
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
                      }}
                    >
                      <Icon iconName="gear" iconStyle="regular" />
                    </Button>
                    <Tooltip
                      content="Annotations group still in used"
                      disabled={annotationsGroup.associated_items_count === 0}
                    >
                      <Button
                        size="md"
                        variant="surface"
                        color="neutral"
                        disabled={annotationsGroup.associated_items_count !== 0}
                        onClick={() => {
                          openModalConfirmation({
                            title: 'Delete annotations group',
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
                        }}
                      >
                        <Icon iconName="trash-can" iconStyle="regular" />
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
                No annotations group found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>
      </Section>
    </div>
  )
}

export default PageOrganizationLabelsAnnotationsFeature
