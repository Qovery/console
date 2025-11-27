import {
  BlockContent,
  Button,
  Heading,
  Icon,
  IconAwesomeEnum,
  InputToggle,
  LoaderSpinner,
  Section,
  useModal,
} from '@qovery/shared/ui'

export interface RecurringTask {
  id: string
  user_id: string
  user_intent: string
  cron_expression: string
  enabled: boolean
  environment: string
  created_at: string
  updated_at: string
  last_run_at?: string
  next_run_at?: string
  error_count: number
  last_error?: string
}

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
        <Heading>Scheduled Tasks</Heading>
        <p className="mt-3 text-xs text-neutral-400">Recurring tasks configured for your organization</p>
      </div>
      <BlockContent title="Tasks List" classNameContent="p-0">
        {isLoading ? (
          <div className="flex justify-center p-5">
            <LoaderSpinner className="w-5" />
          </div>
        ) : tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between border-b border-neutral-250 px-5 py-4 last:border-0"
              >
                <div className="flex">
                  <Icon
                    name={task.enabled ? IconAwesomeEnum.CLOCK : IconAwesomeEnum.PAUSE}
                    className={task.enabled ? 'text-brand-500' : 'text-neutral-350'}
                    width="20px"
                    height="20px"
                  />
                  <div className="ml-4">
                    <p className="mb-1 flex text-xs font-medium text-neutral-400">{task.user_intent}</p>
                    <p className="text-xs text-neutral-350">
                      <span className="inline-block">Schedule: {task.cron_expression}</span>
                      {task.last_run_at && (
                        <span className="ml-3 inline-block">
                          Last run: {new Date(task.last_run_at).toLocaleString()}
                        </span>
                      )}
                      {task.error_count > 0 && (
                        <span className="ml-3 inline-block text-red-500">Errors: {task.error_count}</span>
                      )}
                    </p>
                    {task.last_error && <p className="mt-1 text-xs text-red-500">{task.last_error}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <InputToggle
                    title={`${task.enabled ? 'Enabled' : 'Disabled'}`}
                    className="mr-5"
                    value={task.enabled}
                    small
                    onChange={() => onToggleTask(task.id)}
                  />
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
