import { act, getAllByTestId } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import { CustomDomain, CustomDomainStatusEnum } from 'qovery-typescript-axios'
import * as redux from 'react-redux'
import { applicationFactoryMock } from '@qovery/shared/factories'
import { ApplicationEntity } from '@qovery/shared/interfaces'
import PageSettingsDomainsFeature from './page-settings-domains-feature'

import SpyInstance = jest.SpyInstance

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}))

const mockOpenModal = jest.fn()
const mockOpenConfirmationModal = jest.fn()
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenConfirmationModal,
  }),
}))

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: () => ({ applicationId: '1' }),
}))

describe('PageSettingsDomainsFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageSettingsDomainsFeature />)
    expect(baseElement).toBeTruthy()
  })

  describe('with an application defined', () => {
    let useDispatchSpy: SpyInstance
    let application: ApplicationEntity
    let useSelectorSpy: SpyInstance

    const customDomainsMocked: CustomDomain[] = [
      {
        id: '1',
        domain: 'example.com',
        status: CustomDomainStatusEnum.VALIDATION_PENDING,
        validation_domain: 'example.com',
        updated_at: '2020-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
      {
        id: '2',
        domain: 'example2.com',
        status: CustomDomainStatusEnum.VALIDATION_PENDING,
        validation_domain: 'example.com',
        updated_at: '2020-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
    ]

    beforeEach(() => {
      useDispatchSpy = jest.spyOn(redux, 'useDispatch').mockReturnValue(jest.fn())
      application = applicationFactoryMock(1)[0]
      application.id = '1'
      useSelectorSpy = jest.spyOn(redux, 'useSelector')
      useSelectorSpy.mockReturnValue(application).mockReturnValue(customDomainsMocked)
    })

    it('should dispatch the custom domain fetch', async () => {
      render(<PageSettingsDomainsFeature />)
      expect(useDispatchSpy).toHaveBeenCalled()
    })

    it('should dispatch open modal if click on edit', async () => {
      const { baseElement } = render(<PageSettingsDomainsFeature />)

      const editButton = getAllByTestId(baseElement, 'edit-button')[0]

      await act(() => {
        editButton.click()
      })

      expect(mockOpenModal).toHaveBeenCalled()
    })

    it('should dispatch open confirmation modal if click on delete', async () => {
      const { baseElement } = render(<PageSettingsDomainsFeature />)

      const deleteButton = getAllByTestId(baseElement, 'delete-button')[0]

      await act(() => {
        deleteButton.click()
      })

      expect(mockOpenConfirmationModal).toHaveBeenCalled()
    })
  })
})
