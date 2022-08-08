import { render } from '__tests__/utils/setup-jest'
import PageSettingsDomainsFeature from './page-settings-domains-feature'
import * as redux from 'react-redux'
import { applicationFactoryMock } from '@console/domains/application'
import { findByTestId, waitFor } from '@testing-library/react'

const mockDispatch = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}))

describe('PageSettingsDomainsFeature', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(<PageSettingsDomainsFeature />)

    expect(baseElement).toBeTruthy()
  })

  it('should fetch the app if not already loaded', () => {
    const useDispatchSpy = jest.spyOn(redux, 'useDispatch')
    const mockDispatchFn = jest.fn()
    useDispatchSpy.mockReturnValue(mockDispatchFn)

    const useSelectorSpy = jest.spyOn(redux, 'useSelector')
    useSelectorSpy.mockReturnValueOnce('not loaded').mockReturnValue('loaded')

    const { baseElement } = render(<PageSettingsDomainsFeature />)

    expect(mockDispatchFn).toHaveBeenCalled()
  })

  it('should create keys if application exists', async () => {
    const useSelectorSpy = jest.spyOn(redux, 'useSelector')
    useSelectorSpy.mockReturnValueOnce('loaded').mockReturnValue(applicationFactoryMock(1)[0])

    const { baseElement } = render(<PageSettingsDomainsFeature />)

    await waitFor(async () => {
      const row = await findByTestId(baseElement, 'form-row')
      expect(row).toBeTruthy()
    })
  })
})
