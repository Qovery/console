import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAnnouncementBannerModule from '../hooks/use-announcement-banner/use-announcement-banner'
import { AnnouncementBanner } from './announcement-banner'

jest.mock('../hooks/use-announcement-banner/use-announcement-banner')

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

  it('should render dismiss icon when dismissible is true', () => {
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

  it('should render action button when buttonUrl and buttonLabel are provided', () => {
    mockUseAnnouncementBanner.mockReturnValue({
      message: 'New feature available',
      variant: 'info',
      dismissible: false,
      buttonLabel: 'Learn more',
      buttonUrl: 'https://docs.qovery.com',
    })

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByRole('button', { name: 'Learn more' })).toBeInTheDocument()
  })

  it('should open URL in new tab when action button is clicked', async () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation()

    mockUseAnnouncementBanner.mockReturnValue({
      message: 'New feature available',
      variant: 'info',
      dismissible: false,
      buttonLabel: 'Learn more',
      buttonUrl: 'https://docs.qovery.com',
    })

    const { userEvent } = renderWithProviders(<AnnouncementBanner />)

    const actionButton = screen.getByRole('button', { name: 'Learn more' })
    await userEvent.click(actionButton)

    expect(windowOpenSpy).toHaveBeenCalledWith('https://docs.qovery.com', '_blank', 'noopener,noreferrer')

    windowOpenSpy.mockRestore()
  })

  it('should show both action button and dismiss icon when both are enabled', () => {
    mockUseAnnouncementBanner.mockReturnValue({
      message: 'New feature available',
      variant: 'info',
      dismissible: true,
      buttonLabel: 'Learn more',
      buttonUrl: 'https://docs.qovery.com',
    })

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByRole('button', { name: 'Learn more' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })

  it('should not render action button when buttonUrl is provided without buttonLabel', () => {
    mockUseAnnouncementBanner.mockReturnValue({
      message: 'Test message',
      variant: 'info',
      dismissible: false,
      buttonUrl: 'https://docs.qovery.com',
    })

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
