import { render } from '__tests__/utils/setup-jest'
import { IntercomProvider } from 'react-use-intercom'
import App from './app'

describe('App', () => {
  it('should render successfully', () => {
    window.scrollTo = jest.fn()

    const { baseElement } = render(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <App />
      </IntercomProvider>
    )

    expect(baseElement).toBeTruthy()
  })
})
