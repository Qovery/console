import { act, getAllByTestId, getByTestId, queryAllByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { JobForceEvent } from 'qovery-typescript-axios'
import * as storeApplication from '@qovery/domains/application'
import { cronjobFactoryMock, lifecycleJobFactoryMock } from '@qovery/shared/factories'
import ForceRunModalFeature from './force-run-modal-feature'

import SpyInstance = jest.SpyInstance

const mockLifecycle = lifecycleJobFactoryMock(1)[0]

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
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
    const { baseElement, debug } = render(<ForceRunModalFeature applicationId="123" />)

    const radioBoxes = getAllByTestId(baseElement, 'input-radio-box')
    await act(() => {
      radioBoxes[1].click()
    })

    await act(() => {
      radioBoxes[0].click()
    })
    debug()
    const submit = getByTestId(baseElement, 'submit-button')

    // todo debug that and check why the submit button stays disabled
    await waitFor(() => {
      expect(submit).not.toBeDisabled()
      submit.click()
      expect(forceRunJobSpy).toHaveBeenCalled()
    })

    expect(forceRunJobSpy).toHaveBeenCalledWith({
      applicationId: '123',
      jobForceEvent: JobForceEvent.CRON,
    })
  })
})
