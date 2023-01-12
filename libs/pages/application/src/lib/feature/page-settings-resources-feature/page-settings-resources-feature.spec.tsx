import { ResizeObserver } from '__tests__/utils/resize-observer'
import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as storeApplication from '@qovery/domains/application'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import PageSettingsResourcesFeature, { handleSubmit } from './page-settings-resources-feature'

import SpyInstance = jest.SpyInstance

const mockApplication: ApplicationEntity = applicationFactoryMock(1)[0]

jest.mock('@qovery/domains/application', () => {
  return {
    ...jest.requireActual('@qovery/domains/application'),
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

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ applicationId: '0' }),
}))

describe('PageSettingsResourcesFeature', () => {
  window.ResizeObserver = ResizeObserver
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit resources with converters with MB', () => {
    const cpu = 3400
    const memory = 512
    const app = handleSubmit({ instances: [1, 10], cpu: [cpu], memory: memory }, mockApplication)

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
      const input = getByTestId('input-memory-memory')
      fireEvent.input(input, { target: { value: 9 } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    const cloneApplication = handleSubmit({ memory: 9, cpu: [1], instances: [1, 3] }, mockApplication)

    expect(editApplicationSpy.mock.calls[0][0].applicationId).toBe(mockApplication.id)
    expect(editApplicationSpy.mock.calls[0][0].data).toStrictEqual(cloneApplication)
  })
})
