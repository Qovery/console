import { DatabaseAccessibilityEnum } from 'qovery-typescript-axios'
import { type Database } from '@qovery/domains/services/data-access'
import * as servicesDomains from '@qovery/domains/services/feature'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import PageSettingsGeneralFeature, { handleSubmit } from './page-settings-general-feature'

import SpyInstance = jest.SpyInstance

const mockDatabase = databaseFactoryMock(1)[0] as Database
const useEditServiceSpy: SpyInstance = jest.spyOn(servicesDomains, 'useEditService')
const useServiceSpy: SpyInstance = jest.spyOn(servicesDomains, 'useService')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ databaseId: '0' }),
}))

describe('PageSettingsGeneralFeature', () => {
  beforeEach(() => {
    useEditServiceSpy.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    })
    useServiceSpy.mockReturnValue({
      data: mockDatabase,
    })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<PageSettingsGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })

  it('should update the database with git repository', () => {
    const db = handleSubmit(
      {
        name: 'hello',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
      },
      mockDatabase
    )

    expect(db.name).toBe('hello')
    expect(db.accessibility).toBe(DatabaseAccessibilityEnum.PRIVATE)
  })

  it('should submit editService if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsGeneralFeature />)

    const input = screen.getByRole('textbox', { name: /database name/i })
    await userEvent.clear(input)
    await userEvent.type(input, 'hello')

    const button = screen.getByRole('button', { name: /save/i })

    expect(button).not.toBeDisabled()

    await userEvent.click(button)

    const cloneApplication = handleSubmit(
      { name: 'hello', accessibility: DatabaseAccessibilityEnum.PRIVATE, version: '12' },
      mockDatabase
    )

    expect(useEditServiceSpy().mutate).toHaveBeenCalledWith({
      serviceId: '0',
      payload: cloneApplication,
    })
  })
})
