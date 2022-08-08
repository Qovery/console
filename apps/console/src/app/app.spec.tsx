import App from './app'
import { render } from '__tests__/utils/setup-jest'
import { IntercomProvider } from 'react-use-intercom'

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <App />
      </IntercomProvider>
    )

    expect(baseElement).toBeTruthy()
  })
})
