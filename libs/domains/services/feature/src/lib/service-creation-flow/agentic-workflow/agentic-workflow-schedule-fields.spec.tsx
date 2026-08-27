import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowScheduleFields, isAgenticWorkflowScheduleValid } from './agentic-workflow-schedule-fields'

describe('AgenticWorkflowScheduleFields', () => {
  it('focuses the schedule toggle when requested', () => {
    renderWithProviders(
      wrapWithReactHookForm(<AgenticWorkflowScheduleFields autoFocus />, {
        defaultValues: {
          scheduleEnabled: false,
          scheduleCronExpression: '0 8 * * 1-5',
          timezone: 'Etc/UTC',
        },
      })
    )

    expect(screen.getByRole('switch', { name: 'Schedule agent task' })).toHaveFocus()
  })

  it('requires a valid cron expression only when scheduling is enabled', () => {
    expect(
      isAgenticWorkflowScheduleValid({
        scheduleEnabled: false,
        scheduleCronExpression: 'invalid',
        timezone: 'Etc/UTC',
      })
    ).toBe(true)
    expect(
      isAgenticWorkflowScheduleValid({
        scheduleEnabled: true,
        scheduleCronExpression: 'invalid',
        timezone: 'Etc/UTC',
      })
    ).toBe(false)
  })
})
