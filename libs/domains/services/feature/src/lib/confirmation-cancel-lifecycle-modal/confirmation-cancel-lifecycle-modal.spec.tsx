import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useCancelDeploymentService } from '../hooks/use-cancel-deployment-service/use-cancel-deployment-service'
import ConfirmationCancelLifecycleModal, {
  type ConfirmationCancelLifecycleModalProps,
} from './confirmation-cancel-lifecycle-modal'

jest.mock('../hooks/use-cancel-deployment-service/use-cancel-deployment-service', () => {
  const mutate = jest.fn()
  return {
    ...jest.requireActual('../hooks/use-cancel-deployment-service/use-cancel-deployment-service'),
    useCancelDeploymentService: () => ({
      mutate,
    }),
  }
})

const props: ConfirmationCancelLifecycleModalProps = {
  onClose: jest.fn(),
  serviceId: '1',
  organizationId: '0',
  projectId: '1',
  environmentId: '1',
}

describe('ConfirmationCancelLifecycleModal', () => {
  it('should match snapshot', async () => {
    const { container } = renderWithProviders(<ConfirmationCancelLifecycleModal {...props} />)
    await waitFor(() => expect(screen.getByRole('button', { name: /confirm/i })).toBeEnabled())
    expect(container).toMatchSnapshot()
  })

  it('should confirm modal with force checked', async () => {
    const { userEvent } = renderWithProviders(<ConfirmationCancelLifecycleModal {...props} />)

    const checkbox = screen.getByLabelText(/force lifecycle/i)
    await userEvent.click(checkbox)

    const submitButton = screen.getByRole('button', { name: /confirm/i })
    await userEvent.click(submitButton)

    expect(useCancelDeploymentService({ projectId: '' }).mutate).toHaveBeenCalledWith({
      environmentId: '1',
      force: true,
    })
  })

  describe('with a Terraform service', () => {
    const terraformProps = { ...props, serviceKind: 'TERRAFORM' as const }

    it('should show the Terraform stop option unchecked with the state lock warning', () => {
      renderWithProviders(<ConfirmationCancelLifecycleModal {...terraformProps} />)

      expect(screen.getByLabelText(/force terraform stop/i)).not.toBeChecked()
      expect(screen.queryByLabelText(/force lifecycle/i)).not.toBeInTheDocument()
      expect(screen.getByText(/force unlock/i)).toBeInTheDocument()
    })

    it('should cancel without force by default', async () => {
      const { userEvent } = renderWithProviders(<ConfirmationCancelLifecycleModal {...terraformProps} />)

      await userEvent.click(screen.getByRole('button', { name: /confirm/i }))

      expect(useCancelDeploymentService({ projectId: '' }).mutate).toHaveBeenLastCalledWith({
        environmentId: '1',
        force: false,
      })
    })

    it('should cancel with force when the option is checked', async () => {
      const { userEvent } = renderWithProviders(<ConfirmationCancelLifecycleModal {...terraformProps} />)

      await userEvent.click(screen.getByLabelText(/force terraform stop/i))
      await userEvent.click(screen.getByRole('button', { name: /confirm/i }))

      expect(useCancelDeploymentService({ projectId: '' }).mutate).toHaveBeenLastCalledWith({
        environmentId: '1',
        force: true,
      })
    })
  })
})
