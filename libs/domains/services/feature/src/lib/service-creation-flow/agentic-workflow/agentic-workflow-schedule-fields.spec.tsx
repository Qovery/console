import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AgenticWorkflowScheduleFields, isAgenticWorkflowScheduleValid } from './agentic-workflow-schedule-fields'

describe('AgenticWorkflowScheduleFields', () => {
  it('links to the CRON expression builder when scheduling is enabled', () => {
    renderWithProviders(
      wrapWithReactHookForm(<AgenticWorkflowScheduleFields />, {
        defaultValues: {
          scheduleEnabled: true,
          scheduleCronExpression: '0 8 * * 1-5',
          timezone: 'Etc/UTC',
        },
      })
    )

    expect(screen.getByRole('link', { name: 'CRON expression builder' })).toHaveAttribute(
      'href',
      'https://crontab.guru/'
    )
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
