import { useLocalStorage } from '@qovery/shared/util-hooks'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useAnnouncementBannerModule from '../hooks/use-announcement-banner/use-announcement-banner'
import { AnnouncementBanner } from './announcement-banner'

jest.mock('../hooks/use-announcement-banner/use-announcement-banner')
jest.mock('@qovery/shared/util-hooks', () => ({
  useLocalStorage: jest.fn(),
}))

describe('AnnouncementBanner', () => {
  const mockUseAnnouncementBanner = useAnnouncementBannerModule.useAnnouncementBanner as jest.MockedFunction<
    typeof useAnnouncementBannerModule.useAnnouncementBanner
  >
  const mockSetDismissedMessages = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useLocalStorage as jest.Mock).mockReturnValue([[], mockSetDismissedMessages])
  })

  it('should render nothing when banner list is empty', () => {
    mockUseAnnouncementBanner.mockReturnValue([])

    const { container } = renderWithProviders(<AnnouncementBanner />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should render the first banner', () => {
    mockUseAnnouncementBanner.mockReturnValue([
      { title: 'Info Title', message: 'This is an info message', variant: 'info', dismissible: false },
    ])

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByText('Info Title')).toBeInTheDocument()
    expect(screen.getByText('This is an info message')).toBeInTheDocument()
  })

  it('should display error banners before warning before info', () => {
    mockUseAnnouncementBanner.mockReturnValue([
      { message: 'Info banner', variant: 'info', dismissible: false },
      { message: 'Error banner', variant: 'error', dismissible: false },
      { message: 'Warning banner', variant: 'warning', dismissible: false },
    ])

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByText('Error banner')).toBeInTheDocument()
    expect(screen.queryByText('Info banner')).not.toBeInTheDocument()
    expect(screen.queryByText('Warning banner')).not.toBeInTheDocument()
  })

  it('should show navigation controls when there are multiple banners', () => {
    mockUseAnnouncementBanner.mockReturnValue([
      { message: 'First banner', variant: 'info', dismissible: false },
      { message: 'Second banner', variant: 'warning', dismissible: false },
    ])

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('should not show navigation controls for a single banner', () => {
    mockUseAnnouncementBanner.mockReturnValue([{ message: 'Only banner', variant: 'info', dismissible: false }])

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })

  it('should navigate to next banner when Next is clicked', async () => {
    mockUseAnnouncementBanner.mockReturnValue([
      { message: 'First banner', variant: 'error', dismissible: false },
      { message: 'Second banner', variant: 'warning', dismissible: false },
    ])

    const { userEvent } = renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByText('First banner')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Second banner')).toBeInTheDocument()
    expect(screen.queryByText('First banner')).not.toBeInTheDocument()
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })

  it('should navigate to previous banner when Prev is clicked', async () => {
    mockUseAnnouncementBanner.mockReturnValue([
      { message: 'First banner', variant: 'error', dismissible: false },
      { message: 'Second banner', variant: 'warning', dismissible: false },
    ])

    const { userEvent } = renderWithProviders(<AnnouncementBanner />)

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }))

    expect(screen.getByText('First banner')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('should wrap around to last banner when clicking Previous from first', async () => {
    mockUseAnnouncementBanner.mockReturnValue([
      { message: 'First banner', variant: 'error', dismissible: false },
      { message: 'Second banner', variant: 'warning', dismissible: false },
    ])

    const { userEvent } = renderWithProviders(<AnnouncementBanner />)

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }))

    expect(screen.getByText('Second banner')).toBeInTheDocument()
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })

  it('should use banner id as dismiss key when available', async () => {
    mockUseAnnouncementBanner.mockReturnValue([
      { id: 'banner-id-1', message: 'Banner A', variant: 'info', dismissible: true },
    ])

    const { userEvent } = renderWithProviders(<AnnouncementBanner />)

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(mockSetDismissedMessages).toHaveBeenCalledWith(['banner-id-1'])
  })

  it('should fall back to message as dismiss key when id is absent', async () => {
    mockUseAnnouncementBanner.mockReturnValue([{ message: 'Banner A', variant: 'info', dismissible: true }])

    const { userEvent } = renderWithProviders(<AnnouncementBanner />)

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(mockSetDismissedMessages).toHaveBeenCalledWith(['Banner A'])
  })

  it('should not show a banner already dismissed by id', () => {
    (useLocalStorage as jest.Mock).mockReturnValue([['banner-id-already'], mockSetDismissedMessages])
    mockUseAnnouncementBanner.mockReturnValue([
      { id: 'banner-id-already', message: 'Already dismissed', variant: 'info', dismissible: true },
      { message: 'Still visible', variant: 'warning', dismissible: false },
    ])

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.queryByText('Already dismissed')).not.toBeInTheDocument()
    expect(screen.getByText('Still visible')).toBeInTheDocument()
  })

  it('should not show a banner already dismissed by message in new localStorage key', () => {
    (useLocalStorage as jest.Mock).mockReturnValue([['Already dismissed'], mockSetDismissedMessages])
    mockUseAnnouncementBanner.mockReturnValue([
      { message: 'Already dismissed', variant: 'info', dismissible: true },
      { message: 'Still visible', variant: 'warning', dismissible: true },
    ])

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.queryByText('Already dismissed')).not.toBeInTheDocument()
    expect(screen.getByText('Still visible')).toBeInTheDocument()
  })

  it('should not show a banner dismissed via the legacy localStorage key', () => {
    localStorage.setItem('announcement_banner_dismissed', JSON.stringify('Legacy dismissed message'))
    mockUseAnnouncementBanner.mockReturnValue([
      { message: 'Legacy dismissed message', variant: 'info', dismissible: true },
      { message: 'New visible banner', variant: 'warning', dismissible: false },
    ])

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.queryByText('Legacy dismissed message')).not.toBeInTheDocument()
    expect(screen.getByText('New visible banner')).toBeInTheDocument()

    localStorage.removeItem('announcement_banner_dismissed')
  })

  it('should always show non-dismissible banners regardless of localStorage', () => {
    (useLocalStorage as jest.Mock).mockReturnValue([['Non-dismissible message'], mockSetDismissedMessages])
    mockUseAnnouncementBanner.mockReturnValue([
      { message: 'Non-dismissible message', variant: 'warning', dismissible: false },
    ])

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByText('Non-dismissible message')).toBeInTheDocument()
  })

  it('should render action button when buttonLabel and buttonUrl are provided', () => {
    mockUseAnnouncementBanner.mockReturnValue([
      {
        message: 'New feature',
        variant: 'info',
        dismissible: false,
        buttonLabel: 'Have a look',
        buttonUrl: 'https://docs.qovery.com',
      },
    ])

    renderWithProviders(<AnnouncementBanner />)

    expect(screen.getByRole('button', { name: 'Have a look' })).toBeInTheDocument()
  })

  it('should open URL in new tab when action button is clicked', async () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation()

    mockUseAnnouncementBanner.mockReturnValue([
      {
        message: 'New feature',
        variant: 'info',
        dismissible: false,
        buttonLabel: 'Learn more',
        buttonUrl: 'https://docs.qovery.com',
      },
    ])

    const { userEvent } = renderWithProviders(<AnnouncementBanner />)

    await userEvent.click(screen.getByRole('button', { name: 'Learn more' }))

    expect(windowOpenSpy).toHaveBeenCalledWith('https://docs.qovery.com', '_blank', 'noopener,noreferrer')

    windowOpenSpy.mockRestore()
  })

  it('should render nothing when all banners are dismissed', () => {
    (useLocalStorage as jest.Mock).mockReturnValue([['banner-1', 'banner-2'], mockSetDismissedMessages])
    mockUseAnnouncementBanner.mockReturnValue([
      { id: 'banner-1', message: 'Banner 1', variant: 'info', dismissible: true },
      { id: 'banner-2', message: 'Banner 2', variant: 'warning', dismissible: true },
    ])

    const { container } = renderWithProviders(<AnnouncementBanner />)

    expect(container).toBeEmptyDOMElement()
  })
})
