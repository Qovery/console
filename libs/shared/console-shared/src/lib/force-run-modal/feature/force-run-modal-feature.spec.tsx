import { act, getAllByTestId, getByLabelText, getByTestId, queryAllByTestId, render } from '__tests__/utils/setup-jest'
import { JobForceEvent } from 'qovery-typescript-axios'
import * as storeApplication from '@qovery/domains/application'
import { cronjobFactoryMock, lifecycleJobFactoryMock } from '@qovery/shared/factories'
import ForceRunModalFeature from './force-run-modal-feature'

import SpyInstance = jest.SpyInstance

const mockLifecycle = lifecycleJobFactoryMock(1)[0]

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () =>
    jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: {},
      })
    ),
}))

describe('ForceRunModalFeature', () => {
  it('should render 3 radio box if it is a lifecycle', () => {
    const selectApplicationByIdSpy: SpyInstance = jest.spyOn(storeApplication, 'selectApplicationById')
    selectApplicationByIdSpy.mockReturnValue(mockLifecycle)
    const { baseElement } = render(<ForceRunModalFeature applicationId="123" />)
    expect(getAllByTestId(baseElement, 'input-radio-box')).toHaveLength(3)

    expect(baseElement).toBeTruthy()
  })

  it('should render no radio box if it is a cron', () => {
    const selectApplicationByIdSpy: SpyInstance = jest.spyOn(storeApplication, 'selectApplicationById')
    selectApplicationByIdSpy.mockReturnValue(cronjobFactoryMock(1)[0])
    const { baseElement } = render(<ForceRunModalFeature applicationId="123" />)
    expect(queryAllByTestId(baseElement, 'input-radio-box')).toHaveLength(0)

    expect(baseElement).toBeTruthy()
  })

  it('should dispatch forceRunJob with the good payload', async () => {
    const selectApplicationByIdSpy: SpyInstance = jest.spyOn(storeApplication, 'selectApplicationById')
    const lifecycle = lifecycleJobFactoryMock(1)[0]

    selectApplicationByIdSpy.mockReturnValue(lifecycle)

    const forceRunJobSpy: SpyInstance = jest.spyOn(storeApplication, 'forceRunJob')
    const { baseElement } = render(<ForceRunModalFeature applicationId="123" />)

    const radioBoxe = getByLabelText(baseElement, 'Start')
    await act(() => {
      radioBoxe.click()
    })

    const submit = getByTestId(baseElement, 'submit-button')

    expect(submit).not.toBeDisabled()

    await act(() => {
      submit.click()
    })
    expect(forceRunJobSpy).toHaveBeenCalled()

    expect(forceRunJobSpy).toHaveBeenCalledWith({
      applicationId: '123',
      jobForceEvent: JobForceEvent.START,
    })
  })
})
