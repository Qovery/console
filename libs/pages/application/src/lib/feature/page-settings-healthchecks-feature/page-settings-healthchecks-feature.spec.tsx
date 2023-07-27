import userEvent from '@testing-library/user-event'
import { act, fireEvent, render, screen } from '__tests__/utils/setup-jest'
import { Healthcheck } from 'qovery-typescript-axios'
import * as storeApplication from '@qovery/domains/application'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import PageSettingsHealthchecksFeature from './page-settings-healthchecks-feature'

import SpyInstance = jest.SpyInstance

const mockApplication: ApplicationEntity = applicationFactoryMock(1)[0]
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
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ applicationId: mockApplication.id }),
}))

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('@qovery/domains/application', () => {
  return {
    ...jest.requireActual('@qovery/domains/application'),
    editApplicationAdvancedSettings: jest.fn(),
    fetchApplicationAdvancedSettings: jest.fn(),
    fetchDefaultApplicationAdvancedSettings: jest.fn(),
    getApplicationsState: () => ({
      loadingStatus: 'loaded',
      ids: [mockApplication.id],
      entities: {
        [mockApplication.id]: { ...mockApplication, healthchecks: healthchecks },
      },
      error: null,
    }),
    selectApplicationById: () => mockApplication,
  }
})

describe('PageSettingsHealthchecksFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsHealthchecksFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should dispatch editApplication if form is submitted', async () => {
    const editApplicationSpy: SpyInstance = jest.spyOn(storeApplication, 'editApplication')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    render(<PageSettingsHealthchecksFeature />)

    await act(() => {
      const input = screen.getByTestId('input-readiness-probe-service')
      fireEvent.input(input, { target: { value: 'my-service' } })
    })

    const btnSave = screen.getByRole('button', { name: /save/i })
    expect(btnSave).not.toBeDisabled()

    await userEvent.click(btnSave)

    expect(editApplicationSpy.mock.calls[0][0].applicationId).toBe(mockApplication.id)
    expect(editApplicationSpy.mock.calls[0][0].data)
  })
})
