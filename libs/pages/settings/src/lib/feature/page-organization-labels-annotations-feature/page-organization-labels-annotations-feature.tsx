import { useParams } from 'react-router-dom'
import {
  AnnotationCreateEditModal,
  useDeleteWebhook,
  useEditWebhook,
  useWebhooks,
} from '@qovery/domains/organizations/feature'
import {
  BlockContent,
  Button,
  Heading,
  HelpSection,
  Icon,
  Section,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export function PageOrganizationLabelsAnnotationsFeature() {
  useDocumentTitle('Annotations - Organization settings')
  const { organizationId = '' } = useParams()
  const fetchWebhooks = useWebhooks({ organizationId })
  const { mutateAsync: deleteWebhook } = useDeleteWebhook()
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()
  const { mutateAsync: editWebhook } = useEditWebhook()

  const openAddNew = () => {
    openModal({
      content: <AnnotationCreateEditModal organizationId={organizationId} closeModal={closeModal} />,
    })
  }

  const openEdit = (annotation: any) => {
    openModal({
      content: (
        <AnnotationCreateEditModal organizationId={organizationId} webhook={annotation} closeModal={closeModal} />
      ),
    })
  }

  // const onDelete = (webhook: OrganizationWebhookResponse) => {
  //   openModalConfirmation({
  //     title: 'Delete webhook',
  //     isDelete: true,
  //     name: webhook.target_url || '',
  //     action: () => {
  //       try {
  //         deleteWebhook({ organizationId, webhookId: webhook.id })
  //       } catch (error) {
  //         console.error(error)
  //       }
  //     },
  //   })
  // }

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
          <Button size="lg" className="gap-2 shrink-0" onClick={openAddNew}>
            Add new
            <Icon iconName="circle-plus" />
          </Button>
        </div>
        <BlockContent title="Annotations groups" classNameContent="p-0">
          <ul>
            <li className="flex justify-between items-center px-5 py-4 border-b border-neutral-250 last:border-0">
              <div className="flex flex-col">
                <h2 className="flex text-xs text-neutral-400 font-medium mb-1">
                  <Truncate truncateLimit={60} text="my annotations 1" />
                </h2>
                <div className="flex text-xs text-neutral-350">
                  <p>
                    Created: <span className="text-neutral-400">2021-11-16</span>
                  </p>
                  <p className="ml-3">
                    Updated: <span className="text-neutral-400">2d ago</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="md" variant="outline" color="neutral">
                  <Icon iconName="gear" />
                </Button>
                <Button size="md" variant="outline" color="neutral">
                  <Icon iconName="trash" />
                </Button>
              </div>
            </li>
          </ul>
        </BlockContent>
      </Section>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/integration/webhook/',
            linkLabel: 'Managing your Webhooks',
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationLabelsAnnotationsFeature
