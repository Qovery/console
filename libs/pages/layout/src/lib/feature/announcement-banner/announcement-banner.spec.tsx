import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { AnnouncementBanner } from './announcement-banner'
import * as useAnnouncementBannerModule from './use-announcement-banner'

jest.mock('./use-announcement-banner')

describe('AnnouncementBanner', () => {
  const mockUseAnnouncementBanner = useAnnouncementBannerModule.useAnnouncementBanner as jest.MockedFunction<
    typeof useAnnouncementBannerModule.useAnnouncementBanner
  >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render nothing when banner data is null', () => {
    mockUseAnnouncementBanner.mockReturnValue(null)

    const { container } = renderWithProviders(<AnnouncementBanner />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should render info banner with brand color', () => {
    mockUseAnnouncementBanner.mockReturnValue({
      title: 'Info Title',
      message: 'This is an info message',
      variant: 'info',
      dismissible: false,
    })

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByText('Info Title')).toBeInTheDocument()
    expect(screen.getByText('This is an info message')).toBeInTheDocument()
  })

  it('should render warning banner with yellow color', () => {
    mockUseAnnouncementBanner.mockReturnValue({
      message: 'This is a warning message',
      variant: 'warning',
      dismissible: false,
    })

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByText('This is a warning message')).toBeInTheDocument()
  })

  it('should render error banner with red color', () => {
    mockUseAnnouncementBanner.mockReturnValue({
      title: 'Error',
      message: 'This is an error message',
      variant: 'error',
      dismissible: false,
    })

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('This is an error message')).toBeInTheDocument()
  })

  it('should render dismiss button when dismissible is true', () => {
    mockUseAnnouncementBanner.mockReturnValue({
      message: 'Dismissible message',
      variant: 'info',
      dismissible: true,
    })

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('should not render dismiss button when dismissible is false', () => {
    mockUseAnnouncementBanner.mockReturnValue({
      message: 'Non-dismissible message',
      variant: 'info',
      dismissible: false,
    })

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should hide banner when dismiss button is clicked', async () => {
    mockUseAnnouncementBanner.mockReturnValue({
      message: 'Dismissible message',
      variant: 'warning',
      dismissible: true,
    })

    const { userEvent, container } = renderWithProviders(<AnnouncementBanner />)

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' })
    await userEvent.click(dismissButton)

    expect(container).toBeEmptyDOMElement()
  })

  it('should render banner without title', () => {
    mockUseAnnouncementBanner.mockReturnValue({
      message: 'Message only',
      variant: 'info',
      dismissible: false,
    })

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByText('Message only')).toBeInTheDocument()
    expect(screen.queryByRole('strong')).not.toBeInTheDocument()
  })
})
