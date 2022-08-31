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
    getApplicationsState: () => ({
      loadingStatus: 'loaded',
      ids: [mockApplication.id],
      entities: {
        [mockApplication.id]: mockApplication,
      },
      error: null,
    }),
    selectApplicationById: () => mockApplication,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ applicationId: '0' }),
}))

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
    const editApplicationSpy: SpyInstance = jest.spyOn(storeApplication, 'editApplication')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<PageSettingsResourcesFeature />)

    await act(() => {
      const input = getByTestId('input-memory')
      fireEvent.input(input, { target: { value: 9 } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    const cloneApplication = handleSubmit(
      { memory: 9, cpu: [1], instances: [1, 3] },
      mockApplication,
      MemorySizeEnum.MB
    )

    expect(editApplicationSpy).toHaveBeenCalledWith({
      applicationId: mockApplication.id,
      data: cloneApplication,
    })
  })
})
