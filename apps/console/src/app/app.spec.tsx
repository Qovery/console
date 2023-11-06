import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import App from './app'

describe('App', () => {
  it('should render successfully', () => {
    window.scrollTo = jest.fn()

    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <App />
      </IntercomProvider>
    )

    expect(baseElement).toBeTruthy()
  })
})
