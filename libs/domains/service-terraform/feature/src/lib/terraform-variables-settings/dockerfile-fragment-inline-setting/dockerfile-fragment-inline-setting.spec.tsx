import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import DockerfileFragmentInlineSetting, {
  type DockerfileFragmentInlineSettingProps,
} from './dockerfile-fragment-inline-setting'

const props: DockerfileFragmentInlineSettingProps = {
  onSubmit: jest.fn(),
  content: 'RUN apt-get update',
}

describe('DockerfileFragmentInlineSetting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<DockerfileFragmentInlineSetting {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should display the title', () => {
    renderWithProviders(<DockerfileFragmentInlineSetting {...props} />)
    expect(screen.getByText('Commands')).toBeInTheDocument()
  })

  it('should show empty state when no content', () => {
    renderWithProviders(<DockerfileFragmentInlineSetting {...props} content={undefined} />)
    expect(screen.getByText('No commands defined.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add commands/i })).toBeInTheDocument()
  })

  it('should show edit button when content exists', () => {
    renderWithProviders(<DockerfileFragmentInlineSetting {...props} />)
    expect(screen.queryByText('No commands defined.')).not.toBeInTheDocument()
  })

  it('should open modal when add button is clicked', async () => {
    const { userEvent } = renderWithProviders(<DockerfileFragmentInlineSetting {...props} content={undefined} />)

    await userEvent.click(screen.getByRole('button', { name: /add commands/i }))

    expect(screen.getByText('Custom build commands')).toBeInTheDocument()
  })

  it('should match snapshot with content', () => {
    const { baseElement } = renderWithProviders(<DockerfileFragmentInlineSetting {...props} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should match snapshot without content', () => {
    const { baseElement } = renderWithProviders(<DockerfileFragmentInlineSetting {...props} content={undefined} />)
    expect(baseElement).toMatchSnapshot()
  })
})
