import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Login, { type ILoginProps } from './login'

describe('Login', () => {
  const props: ILoginProps = {
    onClickAuthLogin: (provider: string) => {
      return
    },
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Login {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should call invitation detail if token are in the localStorage', async () => {
    localStorage.setItem('inviteToken', 'token')
    renderWithProviders(<Login {...props} />)

    expect(screen.queryByText('Connect to Qovery')).not.toBeInTheDocument()
  })
})
