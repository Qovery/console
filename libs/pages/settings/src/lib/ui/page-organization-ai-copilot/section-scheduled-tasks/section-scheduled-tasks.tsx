import { type RecurringTask } from '@qovery/shared/devops-copilot/data-access'
import {
  Badge,
  BlockContent,
  Button,
  Heading,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Section,
  useModal,
} from '@qovery/shared/ui'

export type { RecurringTask }

export interface SectionScheduledTasksProps {
  tasks: RecurringTask[]
  isLoading?: boolean
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export function SectionScheduledTasks({ tasks, isLoading, onToggleTask, onDeleteTask }: SectionScheduledTasksProps) {
  const { openModal, closeModal } = useModal()

  return (
    <Section>
      <div className="mb-8">
        <Heading className="mb-2">Scheduled Tasks</Heading>
        <p className="text-xs text-neutral-400">Recurring tasks configured for your organization</p>
      </div>
      <BlockContent title="Tasks List" classNameContent="p-0">
        {isLoading ? (
          <div className="flex justify-center p-5">
            <LoaderSpinner className="w-5" />
          </div>
        ) : tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center border-b border-neutral-250 px-5 py-4 last:border-0">
                <div className="flex-1">
                  <p className="mb-1 text-xs font-medium text-neutral-400">{task.user_intent}</p>
                  <p className="text-xs text-neutral-350">
                    <span className="inline-block">Schedule: {task.cron_expression}</span>
                    {task.last_run_at && (
                      <span className="ml-3 inline-block">Last run: {new Date(task.last_run_at).toLocaleString()}</span>
                    )}
                    {task.error_count > 0 && (
                      <span className="ml-3 inline-block text-red-500">Errors: {task.error_count}</span>
                    )}
                  </p>
                  {task.last_error && <p className="mt-1 text-xs text-red-500">{task.last_error}</p>}
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <Badge variant="surface" color={task.enabled ? 'green' : 'neutral'} size="sm">
                    {task.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                  <Button
                    variant="surface"
                    color="neutral"
                    size="md"
                    onClick={() => onToggleTask(task.id)}
                    title={task.enabled ? 'Pause task' : 'Resume task'}
                  >
                    <Icon iconName={task.enabled ? 'pause' : 'play'} iconStyle="regular" />
                  </Button>
                  <Button
                    variant="surface"
                    color="neutral"
                    size="md"
                    onClick={() => {
                      openModal({
                        content: (
                          <div className="p-6">
                            <h2 className="h4 mb-2 text-neutral-400">Delete Task</h2>
                            <p className="mb-6 text-sm text-neutral-350">
                              Are you sure you want to delete this task? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                              <Button
                                type="button"
                                color="neutral"
                                variant="plain"
                                size="lg"
                                onClick={() => closeModal()}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="lg"
                                color="red"
                                onClick={() => {
                                  closeModal()
                                  onDeleteTask(task.id)
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ),
                      })
                    }}
                  >
                    <Icon iconName="trash-can" iconStyle="regular" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex justify-center p-5">
            <p className="text-sm text-neutral-350">No scheduled tasks configured yet.</p>
          </div>
        )}
      </BlockContent>
    </Section>
  )
}

export default SectionScheduledTasks
