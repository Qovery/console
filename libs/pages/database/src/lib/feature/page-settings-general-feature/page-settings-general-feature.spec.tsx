import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import { DatabaseAccessibilityEnum } from 'qovery-typescript-axios'
import * as storeDatabase from '@qovery/domains/database'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import PageSettingsGeneralFeature, { handleSubmit } from './page-settings-general-feature'

import SpyInstance = jest.SpyInstance

const mockDatabase: DatabaseEntity = databaseFactoryMock(1)[0]

jest.mock('@qovery/domains/database', () => {
  return {
    ...jest.requireActual('@qovery/domains/database'),
    editDatabase: jest.fn(),
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
