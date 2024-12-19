import { type Healthcheck } from 'qovery-typescript-axios'
import { type Application } from '@qovery/domains/services/data-access'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import PageSettingsHealthchecksFeature from './page-settings-healthchecks-feature'

const mockApplication = applicationFactoryMock(1)[0] as Application
const healthchecks: Healthcheck = {
  readiness_probe: {
    type: {
      grpc: {
        service: 'test',
        port: 1000,
      },
    },
    initial_delay_seconds: 3000,
    period_seconds: 10,
    timeout_seconds: 1,
    success_threshold: 1,
    failure_threshold: 3,
  },
  liveness_probe: {
    type: {
      exec: {
        command: ['test', 'test'],
      },
    },
    initial_delay_seconds: 230,
    period_seconds: 10,
    timeout_seconds: 5,
    success_threshold: 1,
    failure_threshold: 3,
  },
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ applicationId: mockApplication.id }),
}))

const mockEditService = jest.fn()

jest.mock('@qovery/domains/services/feature', () => {
  return {
    useServiceType: () => ({
      data: 'APPLICATION',
    }),
    useService: () => ({
      data: { ...mockApplication, healthchecks },
    }),
    useEditService: () => ({
      mutate: mockEditService,
      isLoading: false,
    }),
    useDeploymentStatus: () => ({
      data: {
        execution_id: 'exec-1',
      },
    }),
  }
})

describe('PageSettingsHealthchecksFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsHealthchecksFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch editApplication if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsHealthchecksFeature />)

    const input = screen.getByTestId('input-readiness-probe-service')
    await userEvent.clear(input)
    await userEvent.type(input, 'my-service')

    const btnSave = screen.getByRole('button', { name: /save/i })
    expect(btnSave).toBeEnabled()

    await userEvent.click(btnSave)

    waitFor(() => {
      expect(mockEditService).toHaveBeenCalledWith({
        serviceId: mockApplication.id,
        payload: {
          healthchecks: {
            readiness_probe: {
              type: {
                grpc: {
                  service: 'my-service',
                  port: 1000,
                },
              },
              initial_delay_seconds: 3000,
              period_seconds: 10,
              timeout_seconds: 1,
              success_threshold: 1,
              failure_threshold: 3,
            },
            liveness_probe: {
              type: {
                exec: {
                  command: ['test', 'test'],
                },
              },
              initial_delay_seconds: 230,
              period_seconds: 10,
              timeout_seconds: 5,
              success_threshold: 1,
              failure_threshold: 3,
            },
          },
        },
      })
    })
  })
})
