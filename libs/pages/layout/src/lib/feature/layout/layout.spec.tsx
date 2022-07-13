import React from 'react'
import { render } from '__tests__/utils/setup-jest'
import { setCurrentOrganizationIdOnStorage, setCurrentProjectIdOnStorage } from '../../utils/utils'
import Layout, { LayoutProps } from './layout'

jest.mock('../../utils/utils')

describe('Layout', () => {
  let props: LayoutProps

  beforeEach(() => {
    props = {
      children: React.createElement('div'),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Layout {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should save the current organization id on local storage', () => {
    setCurrentOrganizationIdOnStorage.mockImplementation((orgId: string) => orgId)
    render(<Layout {...props} />)
    expect(setCurrentOrganizationIdOnStorage).toBeCalled()
  })

  it('should save the current project id on local storage', () => {
    setCurrentProjectIdOnStorage.mockImplementation((projectId: string) => projectId)
    render(<Layout {...props} />)
    expect(setCurrentProjectIdOnStorage).toBeCalled()
  })
})
