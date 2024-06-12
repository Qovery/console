import { DatabaseAccessibilityEnum } from 'qovery-typescript-axios'
import * as servicesDomains from '@qovery/domains/services/feature'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { PageSettingsGeneralFeature } from './page-settings-general-feature'

import SpyInstance = jest.SpyInstance

const mockDatabase = databaseFactoryMock(1)[0]
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
    const db = buildEditServicePayload({
      service: mockDatabase,
      request: {
        name: 'hello',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
      },
    })

    expect(db.name).toBe('hello')
    expect(db.accessibility).toBe(DatabaseAccessibilityEnum.PRIVATE)
  })

  it('should submit editService if form is submitted', async () => {
    const { userEvent } = renderWithProviders(<PageSettingsGeneralFeature />)

    const input = screen.getByRole('textbox', { name: /database name/i })
    await userEvent.clear(input)
    await userEvent.type(input, 'hello')

    const button = screen.getByRole('button', { name: /save/i })

    expect(button).toBeEnabled()

    await userEvent.click(button)

    const cloneDatabase = buildEditServicePayload({
      service: mockDatabase,
      request: {
        name: 'hello',
        accessibility: DatabaseAccessibilityEnum.PRIVATE,
        version: '12',
        annotations_groups: [],
        labels_groups: [],
      },
    })

    expect(useEditServiceSpy().mutate).toHaveBeenCalledWith({
      serviceId: '0',
      payload: cloneDatabase,
    })
  })
})
