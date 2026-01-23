import { type AlertReceiverResponse, type EmailAlertReceiverResponse } from 'qovery-typescript-axios'
import { useParams } from 'react-router-dom'
import {
  Button,
  Chart,
  Heading,
  Icon,
  Section,
  TablePrimitives,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useAlertReceivers } from '../../hooks/use-alert-receivers/use-alert-receivers'
import { useDeleteAlertReceiver } from '../../hooks/use-delete-alert-receiver/use-delete-alert-receiver'
import { NotificationChannelModal } from '../notification-channel-modal/notification-channel-modal'

const { Table } = TablePrimitives

export function NotificationChannelOverview() {
  const { organizationId = '' } = useParams()
  useDocumentTitle('Notification channel - Alerting')
  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const { data: alertReceivers = [], isLoading: isLoadingAlertReceivers } = useAlertReceivers({
    organizationId,
  })
  const { mutateAsync: deleteAlertReceiver } = useDeleteAlertReceiver({ organizationId })

  const slackReceivers = alertReceivers.filter((r) => r.type === 'SLACK')
  const emailReceivers = alertReceivers.filter((r) => r.type === 'EMAIL')

  const createSlackChannelModal = () => {
    openModal({
      content: <NotificationChannelModal type="SLACK" onClose={closeModal} organizationId={organizationId} />,
    })
  }

  const createEmailChannelModal = () => {
    openModal({
      content: <NotificationChannelModal type="EMAIL" onClose={closeModal} organizationId={organizationId} />,
    })
  }

  const editAlertReceiverModal = (alertReceiver: AlertReceiverResponse) => {
    openModal({
      content: (
        <NotificationChannelModal onClose={closeModal} organizationId={organizationId} alertReceiver={alertReceiver} />
      ),
    })
  }

  const deleteAlertReceiverModal = (alertReceiver: AlertReceiverResponse) => {
    openModalConfirmation({
      title: 'Confirm delete alert receiver',
      description: 'To confirm the deletion of your alert receiver, please type the name:',
      confirmationMethod: 'action',
      confirmationAction: 'delete',
      name: alertReceiver.name,
      action: () => deleteAlertReceiver({ alertReceiverId: alertReceiver.id }),
    })
  }

  if (isLoadingAlertReceivers) {
    return (
      <div className="flex h-full w-full items-center justify-center p-5">
        <Chart.Loader />
      </div>
    )
  }

  return (
    <Section className="w-full px-8 py-6">
      <div className="border-b border-neutral-250">
        <div className="flex w-full items-center justify-between pb-5">
          <Heading level={1}>Notification channel</Heading>
        </div>
      </div>
      {/* Slack Section */}
      <div className="mt-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Heading level={2}>Slack channels</Heading>
          <Button variant="plain" color="brand" size="md" className="gap-1.5" onClick={createSlackChannelModal}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add channel
          </Button>
        </div>
        {slackReceivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center overflow-hidden rounded border border-dashed border-neutral-250 bg-neutral-100 p-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-neutral-250">
              <Icon name="SLACK" width={20} height={20} />
            </div>
            <p className="font-medium">No slack channel added yet</p>
            <p className="mb-3 text-sm text-neutral-350">Add your first channel to start sending notifications</p>
            <Button size="md" variant="outline" color="neutral" className="gap-1.5" onClick={createSlackChannelModal}>
              <Icon iconName="circle-plus" iconStyle="regular" />
              Add channel
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-neutral-250">
            <Table.Root className="divide-y divide-neutral-250">
              <Table.Header>
                <Table.Row className="font-code text-xs">
                  <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">
                    Display name
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-9 text-right font-normal text-neutral-350">
                    Actions
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body className="divide-y divide-neutral-250">
                {slackReceivers.map((alertReceiver) => {
                  return (
                    <Table.Row key={alertReceiver.id}>
                      <Table.RowHeaderCell>{alertReceiver.name}</Table.RowHeaderCell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="Edit">
                            <Button
                              variant="outline"
                              color="neutral"
                              size="xs"
                              className="w-6 justify-center"
                              onClick={() => editAlertReceiverModal(alertReceiver)}
                            >
                              <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete channel">
                            <Button
                              variant="outline"
                              color="neutral"
                              size="xs"
                              className="w-6 justify-center"
                              onClick={() => deleteAlertReceiverModal(alertReceiver)}
                            >
                              <Icon iconName="trash-can" iconStyle="regular" className="text-xs" />
                            </Button>
                          </Tooltip>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </div>
        )}
      </div>

      {/* Email Section */}
      <div className="mt-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Heading level={2}>Email</Heading>
          <Button variant="plain" color="brand" size="md" className="gap-1.5" onClick={createEmailChannelModal}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            New email
          </Button>
        </div>
        {emailReceivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center overflow-hidden rounded border border-dashed border-neutral-250 bg-neutral-100 p-10 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-neutral-250">
              <Icon iconName="envelope" iconStyle="regular" className="text-xl text-neutral-350" />
            </div>
            <p className="font-medium">No email group added yet</p>
            <p className="mb-3 text-sm text-neutral-350">Add your first email to start sending notifications</p>
            <Button size="md" variant="outline" color="neutral" className="gap-1.5" onClick={createEmailChannelModal}>
              <Icon iconName="circle-plus" iconStyle="regular" />
              Add email group
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-neutral-250">
            <Table.Root className="divide-y divide-neutral-250">
              <Table.Header>
                <Table.Row className="font-code text-xs">
                  <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">
                    Email address
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-9 font-normal text-neutral-350">
                    Display name
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-9 text-right font-normal text-neutral-350">
                    Actions
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body className="divide-y divide-neutral-250">
                {emailReceivers.map((receiver) => {
                  const emailReceiver = receiver as EmailAlertReceiverResponse
                  return (
                    <Table.Row key={receiver.id}>
                      <Table.RowHeaderCell>{emailReceiver.to}</Table.RowHeaderCell>
                      <Table.Cell>{receiver.name}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="Edit">
                            <Button
                              variant="outline"
                              color="neutral"
                              size="xs"
                              className="w-6 justify-center"
                              onClick={() => editAlertReceiverModal(receiver)}
                            >
                              <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete channel">
                            <Button
                              variant="outline"
                              color="neutral"
                              size="xs"
                              className="w-6 justify-center"
                              onClick={() => deleteAlertReceiverModal(receiver)}
                            >
                              <Icon iconName="trash-can" iconStyle="regular" className="text-xs" />
                            </Button>
                          </Tooltip>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table.Root>
          </div>
        )}
      </div>
    </Section>
  )
}

export default NotificationChannelOverview
