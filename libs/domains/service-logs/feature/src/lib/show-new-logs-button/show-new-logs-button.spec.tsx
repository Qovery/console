import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ShowNewLogsButton } from './show-new-logs-button'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useSearch: () => ({}),
  useNavigate: () => jest.fn(),
  useParams: () => ({ organizationId: '1' }),
  useLocation: () => ({ pathname: '/', search: '' }),
  useRouter: () => ({
    buildLocation: () => ({ href: '/' }),
  }),
}))

describe('ShowNewLogsButton', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ShowNewLogsButton pauseLogs={true} setPauseLogs={jest.fn()} />)
    expect(baseElement).toBeTruthy()
  })

  it('calls setPauseLogs with false when button is clicked', async () => {
    const setPauseLogs = jest.fn()
    const { userEvent } = renderWithProviders(<ShowNewLogsButton pauseLogs={true} setPauseLogs={setPauseLogs} />)

    const button = screen.getByRole('button', { name: /jump to latest log/i })
    await userEvent.click(button)
    expect(setPauseLogs).toHaveBeenCalledWith(false)
  })
})
