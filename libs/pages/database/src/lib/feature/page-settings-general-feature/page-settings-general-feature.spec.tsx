import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { DatabaseAccessibilityEnum } from 'qovery-typescript-axios'
import * as storeDatabase from '@console/domains/database'
import { DatabaseEntity } from '@console/shared/interfaces'
import PageSettingsGeneralFeature, { handleSubmit } from './page-settings-general-feature'

import SpyInstance = jest.SpyInstance

const mockDatabase: DatabaseEntity = storeDatabase.databaseFactoryMock(1)[0]

jest.mock('@console/domains/database', () => {
  return {
    ...jest.requireActual('@console/domains/database'),
    editDatabase: jest.fn(),
    selectDatabaseById: () => mockDatabase,
  }
})

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useParams: () => ({ databaseId: '0' }),
}))

describe('PageSettingsGeneralFeature', () => {
  let database: DatabaseEntity
  beforeEach(() => {
    database = mockDatabase
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should update the database with git repository', () => {
    const db = handleSubmit(
      {
        name: 'hello',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
      },
      database
    )

    expect(db.name).toBe('hello')
    expect(db.accessibility).toBe(DatabaseAccessibilityEnum.PRIVATE)
  })

  it('should dispatch editDatabase if form is submitted', async () => {
    const editDatabaseSpy: SpyInstance = jest.spyOn(storeDatabase, 'editDatabase')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId } = render(<PageSettingsGeneralFeature />)

    await act(() => {
      const input = getByTestId('input-name')
      fireEvent.input(input, { target: { value: 'hello' } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    const cloneApplication = handleSubmit(
      { name: 'hello', accessibility: DatabaseAccessibilityEnum.PRIVATE },
      mockDatabase
    )

    expect(editDatabaseSpy).toHaveBeenCalledWith({
      databaseId: mockDatabase.id,
      data: cloneApplication,
    })
  })
})
