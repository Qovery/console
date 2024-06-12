import { type Job } from '@qovery/domains/services/data-access'
import * as servicesDomain from '@qovery/domains/services/feature'
import { cronjobFactoryMock, lifecycleJobFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import PageSettingsConfigureJobFeature from './page-settings-configure-job-feature'

const useServiceSpy = jest.spyOn(servicesDomain, 'useService') as jest.Mock
const useEditServiceSpy = jest.spyOn(servicesDomain, 'useEditService') as jest.Mock

const mockJobApplication = cronjobFactoryMock(1)[0] as Job
const mockLifecycleJobApplication = lifecycleJobFactoryMock(1)[0] as Job
const mockEditService = jest.fn()

describe('PageSettingsPortsFeature with CRON JOB service', () => {
  beforeEach(() => {
    useServiceSpy.mockReturnValue({
      data: mockJobApplication,
    })
    useEditServiceSpy.mockReturnValue({
      mutate: mockEditService,
      isLoading: false,
    })
  })

  it('should call edit service with correct payload', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsConfigureJobFeature />)

    const inputCron = screen.getByLabelText('Schedule - Cron expression')
    const inputNbRestarts = screen.getByLabelText('Number of restarts')
    const inputMaxDuration = screen.getByLabelText('Max duration in seconds')
    const inputPort = screen.getByLabelText('Port')

    await userEvent.clear(inputCron)
    await userEvent.type(inputCron, '9 * * * *')

    await userEvent.clear(inputNbRestarts)
    await userEvent.type(inputNbRestarts, '12')

    await userEvent.clear(inputMaxDuration)
    await userEvent.type(inputMaxDuration, '123')

    await userEvent.clear(inputPort)
    await userEvent.type(inputPort, '123')

    const submitButton = screen.getByRole('button', { name: 'Save' })
    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)

    expect(mockEditService.mock.calls[0][0].payload.schedule).toEqual({
      cronjob: {
        arguments: [],
        entrypoint: '/',
        scheduled_at: '9 * * * *',
        timezone: 'UTC',
      },
    })
    expect(mockEditService.mock.calls[0][0].payload.max_duration_seconds).toBe('123')
    expect(mockEditService.mock.calls[0][0].payload.max_nb_restart).toBe('12')
    expect(mockEditService.mock.calls[0][0].payload.port).toBe('123')
  })
})

describe('PageSettingsPortsFeature with LIFECYCLE JOB service', () => {
  beforeEach(() => {
    useServiceSpy.mockReturnValue({
      data: mockLifecycleJobApplication,
    })
    useEditServiceSpy.mockReturnValue({
      mutate: mockEditService,
      isLoading: false,
    })
  })
  it('should call edit service with correct payload', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsConfigureJobFeature />)

    const checkboxDelete = screen.getByLabelText('Delete')
    await userEvent.click(checkboxDelete)

    const entrypoints = screen.getAllByLabelText('Image Entrypoint')
    const cmds = screen.getAllByLabelText('CMD Arguments')

    await userEvent.clear(entrypoints[0])
    await userEvent.type(entrypoints[0], '/')

    await userEvent.clear(cmds[0])

    const inputNbRestarts = screen.getByLabelText('Number of restarts')
    const inputMaxDuration = screen.getByLabelText('Max duration in seconds')
    const inputPort = screen.getByLabelText('Port')

    await userEvent.clear(inputNbRestarts)
    await userEvent.type(inputNbRestarts, '12')

    await userEvent.clear(inputMaxDuration)
    await userEvent.type(inputMaxDuration, '123')

    await userEvent.clear(inputPort)
    await userEvent.type(inputPort, '123')

    const submitButton = screen.getByRole('button', { name: 'Save' })
    await userEvent.click(submitButton)

    waitFor(() => {
      expect(mockEditService.mock.calls[0][0].payload.schedule).toEqual({
        on_start: {
          entrypoint: '/',
          arguments: '',
        },
        on_stop: {
          entrypoint: '/',
          arguments: '["arg1","arg2"]',
        },
      })

      expect(mockEditService.mock.calls[0][0].payload.max_duration_seconds).toBe('123')
      expect(mockEditService.mock.calls[0][0].payload.max_nb_restart).toBe('12')
      expect(mockEditService.mock.calls[0][0].payload.port).toBe('123')
    })
  })
})
