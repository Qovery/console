import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'

import LayoutPage, { LayoutPageProps } from './layout-page'
import React from 'react'
import * as hooks from '@console/shared/utils'

describe('LayoutPage', () => {
  let props: LayoutPageProps

  beforeEach(() => {
    props = {
      children: React.createElement('div'),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<LayoutPage {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call the logout method when the logout button is clicked', () => {
    const authLogout = jest.fn()

    jest.spyOn(hooks, 'useAuth').mockImplementation(() => ({
      authLogin: jest.fn(),
      authLogout,
      getCurrentUser: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
    }))

    render(<LayoutPage {...props} />)

    const button = screen.getByRole('button')

    button.click()

    expect(authLogout).toHaveBeenCalled()
  })
})
