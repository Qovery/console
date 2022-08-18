import { findByTestId, waitFor } from '@testing-library/react'
import { render, screen } from '__tests__/utils/setup-jest'
import ConfirmationGitModal, { ConfirmationGitModalProps } from './confirmation-git-modal'

const props: ConfirmationGitModalProps = {
  currentAuthProvider: 'Github (RemiBonnet)',
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe('ConfirmationGitModal', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ConfirmationGitModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    const spySubmit = jest.fn()
    const spyClose = jest.fn()
    props.onSubmit = spySubmit
    props.onClose = spyClose

    const { baseElement } = render(<ConfirmationGitModal {...props} />)
    const button = await findByTestId(baseElement, 'submit-button')

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(spySubmit).toHaveBeenCalled()
      expect(spyClose).toHaveBeenCalled()
    })
  })

  it('should close the form', async () => {
    const spyClose = jest.fn()
    props.onClose = spyClose

    const { baseElement } = render(<ConfirmationGitModal {...props} />)
    const button = await findByTestId(baseElement, 'cancel-button')

    await waitFor(() => {
      button.click()
      expect(button).not.toBeDisabled()
      expect(spyClose).toHaveBeenCalled()
    })
  })

  it('should display the auth provider', () => {
    props.currentAuthProvider = 'Gitlab (RemiBonnet)'
    render(<ConfirmationGitModal {...props} />)

    const name = screen.getByTestId('auth-provider-name')
    const owner = screen.getByTestId('auth-provider-owner')
    expect(name.textContent).toBe('Gitlab')
    expect(owner.textContent).toBe('RemiBonnet')
  })
})
