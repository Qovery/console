import { render } from '__tests__/utils/setup-jest'
import PageSettingsDomainsFeature from './page-settings-domains-feature'
import * as redux from 'react-redux'

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
    useSelectorSpy.mockReturnValueOnce('not loaded')

    const { baseElement } = render(<PageSettingsDomainsFeature />)

    expect(mockDispatchFn).toHaveBeenCalled()
  })
})
