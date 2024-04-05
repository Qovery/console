import { render } from '__tests__/utils/setup-jest'
import { createElement } from 'react'
import { IntercomProvider } from 'react-use-intercom'
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
    const { baseElement } = render(
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
    render(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <Layout {...props} />
      </IntercomProvider>
    )
    expect(mockSetOrganizationId).toBeCalled()
  })

  it('should save the current project id on local storage', () => {
    const mockSetProjectId = setCurrentProjectIdOnStorage as jest.Mock<typeof setCurrentProjectIdOnStorage>
    mockSetProjectId.mockImplementation()
    render(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <Layout {...props} />
      </IntercomProvider>
    )
    expect(mockSetProjectId).toBeCalled()
  })
})
