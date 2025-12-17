import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import DockerfileFragmentInlineModal, {
  type DockerfileFragmentInlineModalProps,
} from './dockerfile-fragment-inline-modal'

const props: DockerfileFragmentInlineModalProps = {
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  content: 'RUN apt-get update && apt-get install -y curl',
}

describe('DockerfileFragmentInlineModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<DockerfileFragmentInlineModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display the title and description', () => {
    renderWithProviders(<DockerfileFragmentInlineModal {...props} />)
    expect(screen.getByText('Custom build commands')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Add Dockerfile RUN commands to install tools in the Terraform execution environment (e.g., AWS CLI, kubectl, jq).'
      )
    ).toBeInTheDocument()
  })

  it('should call onSubmit and onClose when form is submitted', async () => {
    const { userEvent } = renderWithProviders(<DockerfileFragmentInlineModal {...props} />)

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(props.onSubmit).toHaveBeenCalledWith('RUN apt-get update && apt-get install -y curl')
    expect(props.onClose).toHaveBeenCalled()
  })

  it('should call onClose when cancel is clicked', async () => {
    const { userEvent } = renderWithProviders(<DockerfileFragmentInlineModal {...props} />)

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(props.onClose).toHaveBeenCalled()
    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('should render with empty content', () => {
    renderWithProviders(<DockerfileFragmentInlineModal {...props} content={undefined} />)
    expect(screen.getByText('Custom build commands')).toBeInTheDocument()
  })
})
