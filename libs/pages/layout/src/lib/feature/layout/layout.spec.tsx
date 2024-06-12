import { createElement } from 'react'
import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { setCurrentOrganizationIdOnStorage, setCurrentProjectIdOnStorage } from '../../utils/utils'
import Layout, { type LayoutProps } from './layout'

jest.mock('../../utils/utils')

describe('Layout', () => {
  let props: LayoutProps

  beforeEach(() => {
    props = {
      children: createElement('div'),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <Layout {...props} />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })

  it('should save the current organization id on local storage', () => {
    const mockSetOrganizationId = setCurrentOrganizationIdOnStorage as jest.Mock<
      typeof setCurrentOrganizationIdOnStorage
    >
    mockSetOrganizationId.mockImplementation()
    renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <Layout {...props} />
      </IntercomProvider>
    )
    expect(mockSetOrganizationId).toHaveBeenCalled()
  })

  it('should save the current project id on local storage', () => {
    const mockSetProjectId = setCurrentProjectIdOnStorage as jest.Mock<typeof setCurrentProjectIdOnStorage>
    mockSetProjectId.mockImplementation()
    renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <Layout {...props} />
      </IntercomProvider>
    )
    expect(mockSetProjectId).toHaveBeenCalled()
  })
})
