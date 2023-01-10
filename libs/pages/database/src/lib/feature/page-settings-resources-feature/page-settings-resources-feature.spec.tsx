import { ResizeObserver } from '__tests__/utils/resize-observer'
import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import * as storeDatabase from '@qovery/domains/database'
import { MemorySizeEnum } from '@qovery/shared/enums'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import PageSettingsResourcesFeature, { handleSubmit } from './page-settings-resources-feature'

import SpyInstance = jest.SpyInstance

const mockDatabase: DatabaseEntity = databaseFactoryMock(1)[0]

jest.mock('@qovery/domains/database', () => {
  return {
    ...jest.requireActual('@qovery/domains/database'),
    editDatabase: jest.fn(),
    getDatabasesState: () => ({
      loadingStatus: 'loaded',
      ids: [mockDatabase.id],
      entities: {
        [mockDatabase.id]: mockDatabase,
      },
      error: null,
    }),
    selectDatabaseById: () => mockDatabase,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ databaseId: '0' }),
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
    const storage = 1024
    const db = handleSubmit({ cpu: [cpu], memory: memory, storage: storage }, mockDatabase)

    expect(db.cpu).toBe(cpu * 1000)
    expect(db.memory).toBe(memory)
    expect(db.storage).toBe(storage)
  })

  it('should dispatch editDatabase if form is submitted', async () => {
    const editDatabaseSpy: SpyInstance = jest.spyOn(storeDatabase, 'editDatabase')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<PageSettingsResourcesFeature />)

    await act(() => {
      fireEvent.input(getByTestId('input-memory-memory'), { target: { value: 512 } })
      fireEvent.input(getByTestId('input-memory-storage'), { target: { value: 512 } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    expect(editDatabaseSpy).toHaveBeenCalledWith({
      databaseId: mockDatabase.id,
      data: {
        ...mockDatabase,
        ...{
          memory: 512,
          storage: 512,
          cpu: 1,
        },
      },
    })
  })
})
