import { findByTestId, waitFor } from '@testing-library/react'
import { render } from '__tests__/utils/setup-jest'
import * as redux from 'react-redux'
import { applicationFactoryMock } from '@qovery/shared/factories'
import PageSettingsStorageFeature from './page-settings-storage-feature'

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('PageSettingsDomainsFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(<PageSettingsStorageFeature />)

    expect(baseElement).toBeTruthy()
  })

  it('should create keys if application exists', async () => {
    const useSelectorSpy = jest.spyOn(redux, 'useSelector')
    useSelectorSpy.mockReturnValueOnce('loaded').mockReturnValue(applicationFactoryMock(1)[0])

    const { baseElement } = render(<PageSettingsStorageFeature />)

    await waitFor(async () => {
      const row = await findByTestId(baseElement, 'form-row')
      expect(row).toBeTruthy()
    })
  })
})
