import { GitProviderEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import ConfirmationGitModal, { type ConfirmationGitModalProps } from './confirmation-git-modal'

const props: ConfirmationGitModalProps = {
  currentRepository: 'my-repo',
  currentProvider: GitProviderEnum.GITHUB,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
}

describe('ConfirmationGitModal', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<ConfirmationGitModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form', async () => {
    const spySubmit = jest.fn()
    const spyClose = jest.fn()
    props.onSubmit = spySubmit
    props.onClose = spyClose

    const { userEvent } = renderWithProviders(<ConfirmationGitModal {...props} />)
    const button = screen.getByTestId('submit-button')

    await userEvent.click(button)

    expect(button).toBeEnabled()
    expect(spySubmit).toHaveBeenCalled()
    expect(spyClose).toHaveBeenCalled()
  })

  it('should close the form', async () => {
    const spyClose = jest.fn()
    props.onClose = spyClose

    const { userEvent } = renderWithProviders(<ConfirmationGitModal {...props} />)
    const button = screen.getByTestId('submit-button')

    await userEvent.click(button)

    expect(button).toBeEnabled()
    expect(spyClose).toHaveBeenCalled()
  })

  it('should display the auth provider', () => {
    renderWithProviders(<ConfirmationGitModal {...props} />)
    screen.getByText('my-repo')
  })
})
