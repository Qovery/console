import { type InviteMember } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import AcceptInvitation from './accept-invitation'

describe('AcceptInvitation', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<AcceptInvitation onSubmit={jest.fn()} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render invitation details from props', () => {
    renderWithProviders(
      <AcceptInvitation
        onSubmit={jest.fn()}
        inviteDetail={{ inviter: 'Jane', organization_name: 'Qovery' } as InviteMember}
      />
    )

    expect(screen.getByText('Jane has invited you to join:')).toBeInTheDocument()
    expect(screen.getByText('Qovery')).toBeInTheDocument()
  })

  it('should call onSubmit when clicking accept', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(<AcceptInvitation onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Accept invitation' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('should show a loading state on the accept button', () => {
    renderWithProviders(<AcceptInvitation loading onSubmit={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Accept invitation' })).toBeDisabled()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
})
