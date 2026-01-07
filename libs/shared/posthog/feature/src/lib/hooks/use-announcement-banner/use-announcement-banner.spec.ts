import posthog from 'posthog-js'
import { renderHook } from '@qovery/shared/util-tests'
import { useAnnouncementBanner } from './use-announcement-banner'

jest.mock('posthog-js', () => ({
  isFeatureEnabled: jest.fn(),
  getFeatureFlagPayload: jest.fn(),
  onFeatureFlags: jest.fn(),
}))

describe('useAnnouncementBanner', () => {
  const mockIsFeatureEnabled = posthog.isFeatureEnabled as jest.MockedFunction<typeof posthog.isFeatureEnabled>
  const mockGetFeatureFlagPayload = posthog.getFeatureFlagPayload as jest.MockedFunction<
    typeof posthog.getFeatureFlagPayload
  >
  const mockOnFeatureFlags = posthog.onFeatureFlags as jest.MockedFunction<typeof posthog.onFeatureFlags>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null when feature flag is disabled', () => {
    mockIsFeatureEnabled.mockReturnValue(false)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toBeNull()
    expect(mockIsFeatureEnabled).toHaveBeenCalledWith('banner_announcement')
  })

  it('should return null when payload is null', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue(null)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toBeNull()
  })

  it('should return null when payload is not an object', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue('invalid payload' as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toBeNull()
  })

  it('should return null when payload is missing required fields', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      message: 'Test message',
    } as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toBeNull()
  })

  it('should return null when variant is invalid', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      message: 'Test message',
      variant: 'invalid',
      dismissible: true,
    } as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toBeNull()
  })

  it('should return banner data with info variant', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      title: 'Info Title',
      message: 'Info message',
      variant: 'info',
      dismissible: true,
    })

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual({
      title: 'Info Title',
      message: 'Info message',
      variant: 'info',
      dismissible: true,
    })
  })

  it('should return banner data with warning variant', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      message: 'Warning message',
      variant: 'warning',
      dismissible: false,
    })

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual({
      title: undefined,
      message: 'Warning message',
      variant: 'warning',
      dismissible: false,
    })
  })

  it('should return banner data with error variant', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      title: 'Error Title',
      message: 'Error message',
      variant: 'error',
      dismissible: true,
    })

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual({
      title: 'Error Title',
      message: 'Error message',
      variant: 'error',
      dismissible: true,
    })
  })

  it('should return banner data without title when title is not provided', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      message: 'Message only',
      variant: 'info',
      dismissible: false,
    })

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual({
      title: undefined,
      message: 'Message only',
      variant: 'info',
      dismissible: false,
    })
  })

  it('should register feature flag listener', () => {
    mockIsFeatureEnabled.mockReturnValue(false)

    renderHook(() => useAnnouncementBanner())

    expect(mockOnFeatureFlags).toHaveBeenCalled()
  })

  it('should return null when dismissible is not a boolean', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      message: 'Test message',
      variant: 'info',
      dismissible: 'true',
    } as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toBeNull()
  })

  it('should return banner data with optional buttonLabel and buttonUrl', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      message: 'New feature available',
      variant: 'info',
      dismissible: false,
      buttonLabel: 'Learn more',
      buttonUrl: 'https://docs.qovery.com',
    })

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual({
      title: undefined,
      message: 'New feature available',
      variant: 'info',
      dismissible: false,
      buttonLabel: 'Learn more',
      buttonUrl: 'https://docs.qovery.com',
    })
  })

  it('should return banner data without button fields when not provided', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      message: 'Simple message',
      variant: 'warning',
      dismissible: true,
    })

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual({
      title: undefined,
      message: 'Simple message',
      variant: 'warning',
      dismissible: true,
      buttonLabel: undefined,
      buttonUrl: undefined,
    })
  })

  it('should ignore non-string buttonLabel and buttonUrl', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({
      message: 'Test message',
      variant: 'info',
      dismissible: false,
      buttonLabel: 123,
      buttonUrl: true,
    } as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual({
      title: undefined,
      message: 'Test message',
      variant: 'info',
      dismissible: false,
      buttonLabel: undefined,
      buttonUrl: undefined,
    })
  })
})
