import { render } from '__tests__/utils/setup-jest'
import React from 'react'
import ProtectedRoute from './protected-route'
import { LoginPage } from '@console/pages/login/feature'
import { store } from '@console/store/data'
import { Provider } from 'react-redux'

describe('ProtectedRoute', () => {
  const wrapper = () => (
    <Provider store={store}>
      <LoginPage></LoginPage>
    </Provider>
  )

  it('should render successfully', () => {
    const { baseElement } = render(<ProtectedRoute />, { wrapper })
    expect(baseElement).toBeTruthy()
  })
})
