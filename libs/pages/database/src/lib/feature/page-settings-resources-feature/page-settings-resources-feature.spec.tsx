import { mockUseQueryResult } from '__tests__/utils/mock-use-query-result'
import { act, fireEvent, render } from '__tests__/utils/setup-jest'
import {
  CloudProviderEnum,
  DatabaseModeEnum,
  DatabaseTypeEnum,
  ManagedDatabaseInstanceTypeResponse,
} from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import * as storeDatabase from '@qovery/domains/database'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { DatabaseEntity } from '@qovery/shared/interfaces'
import PageSettingsResourcesFeature, { handleSubmit } from './page-settings-resources-feature'

import SpyInstance = jest.SpyInstance

const mockDatabase: DatabaseEntity = databaseFactoryMock(1)[0]
const mockUseFetchDatabaseInstanceTypes: jest.Mock = jest.fn()

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
    useFetchDatabaseInstanceTypes: (provider: CloudProviderEnum, databaseType: DatabaseTypeEnum, region: string) =>
      mockUseFetchDatabaseInstanceTypes(provider, databaseType, region),
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
  beforeEach(() => {
    mockUseFetchDatabaseInstanceTypes.mockReturnValue(
      mockUseQueryResult<ManagedDatabaseInstanceTypeResponse[]>([
        {
          name: 't2.micro',
        },
        {
          name: 'db.t3.medium',
        },
      ])
    )
  })

  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit resources with converters with MB', () => {
    const cpu = 3400
    const memory = 512
    const storage = 1024
    const db = handleSubmit({ cpu: cpu, memory: memory, storage: storage }, mockDatabase)

    expect(db.cpu).toBe(cpu)
    expect(db.memory).toBe(memory)
    expect(db.storage).toBe(storage)
  })

  it('should dispatch editDatabase for CONTAINER if form is submitted', async () => {
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

    expect(editDatabaseSpy.mock.calls[0][0].databaseId).toBe(mockDatabase.id)
    expect(editDatabaseSpy.mock.calls[0][0].data).toStrictEqual({
      ...mockDatabase,
      ...{
        memory: 512,
        storage: 512,
        cpu: 1,
        mode: DatabaseModeEnum.CONTAINER,
      },
    })
  })

  it('should dispatch editDatabase for MANAGED db if form is submitted', async () => {
    mockDatabase.mode = DatabaseModeEnum.MANAGED
    const editDatabaseSpy: SpyInstance = jest.spyOn(storeDatabase, 'editDatabase')
    mockDispatch.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          data: {},
        }),
    }))

    const { getByTestId, getByLabelText } = render(<PageSettingsResourcesFeature />)

    const realSelect = getByLabelText('Instance type')

    selectEvent.openMenu(realSelect)
    await selectEvent.select(realSelect, 'db.t3.medium', {
      container: document.body,
    })

    await act(() => {
      fireEvent.input(getByTestId('input-memory-storage'), { target: { value: 510 } })
    })

    expect(getByTestId('submit-button')).not.toBeDisabled()

    await act(() => {
      getByTestId('submit-button').click()
    })

    await act(() => {
      expect(editDatabaseSpy.mock.calls[0][0].databaseId).toBe(mockDatabase.id)
      expect(editDatabaseSpy.mock.calls[0][0].data).toStrictEqual({
        ...mockDatabase,
        ...{
          storage: 510,
          instance_type: 'db.t3.medium',
          mode: DatabaseModeEnum.MANAGED,
        },
      })
    })
  })
})
