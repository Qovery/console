import { ResizeObserver } from '__tests__/utils/resize-observer'
import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as storeApplication from '@console/domains/application'
import { MemorySizeEnum } from '@console/shared/enums'
import { ApplicationEntity } from '@console/shared/interfaces'
import PageSettingsResourcesFeature, { handleSubmit } from './page-settings-resources-feature'

import SpyInstance = jest.SpyInstance

const mockApplication: ApplicationEntity = storeApplication.applicationFactoryMock(1)[0]

jest.mock('@console/domains/application', () => {
  return {
    ...jest.requireActual('@console/domains/application'),
    editApplication: jest.fn(),
    selectApplicationById: () => mockApplication,
  }
})

describe('PageSettingsResourcesFeature', () => {
  window.ResizeObserver = ResizeObserver
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit resources with converters with GB', () => {
    const size = MemorySizeEnum.GB
    const cpu = 3400
    const memory = 16
    const app = handleSubmit({ instances: [1, 10], cpu: [cpu], memory: memory }, mockApplication, size)

    expect(app.min_running_instances).toBe(1)
    expect(app.max_running_instances).toBe(10)
    expect(app.cpu).toBe(cpu * 1000)
    expect(app.memory).toBe(memory * 1024)
  })

  it('should submit resources with converters with MB', () => {
    const size = MemorySizeEnum.MB
    const cpu = 3400
    const memory = 512
    const app = handleSubmit({ instances: [1, 10], cpu: [cpu], memory: memory }, mockApplication, size)

    expect(app.min_running_instances).toBe(1)
    expect(app.max_running_instances).toBe(10)
    expect(app.cpu).toBe(cpu * 1000)
    expect(app.memory).toBe(memory)
  })

  it('should dispatch editApplication if form is submitted', async () => {
    const editApplication: SpyInstance = jest.spyOn(storeApplication, 'editApplication')

    const { getByTestId, debug } = render(<PageSettingsResourcesFeature />)

    await act(() => {
      const input = getByTestId('input-memory')
      fireEvent.input(input, { target: { value: 63 } })
    })

    debug()
    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
      expect(editApplication).toHaveBeenCalledWith({
        applicationId: mockApplication.id,
        data: {
          ...mockApplication,
          memory: 63,
          cpu: 10,
          min_running_instances: 1,
          max_running_instances: 1,
        },
      })
    })
  })
})
