import { queryByTestId, render, waitFor } from '__tests__/utils/setup-jest'
import Login, { type ILoginProps } from './login'

describe('Login', () => {
  const props: ILoginProps = {
    onClickAuthLogin: (provider: string) => {
      return
    },
  }

  it('should render successfully', () => {
    const { baseElement } = render(<Login {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call invitation detail if token are in the localStorage', async () => {
    localStorage.setItem('inviteToken', 'token')
    const { baseElement } = render(<Login {...props} />)

    const title = queryByTestId(baseElement, 'welcome-title')
    await waitFor(() => {
      expect(title).toBeNull()
    })
  })
})
