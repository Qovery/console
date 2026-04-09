import posthog from 'posthog-js'
import { renderHook } from '@qovery/shared/util-tests'
import { useAnnouncementBanner } from './use-announcement-banner'

jest.mock('posthog-js', () => ({
  isFeatureEnabled: jest.fn(),
  getFeatureFlagPayload: jest.fn(),
  onFeatureFlags: jest.fn(),
}))

const BANNER_FLAG = 'banners-annoucement'

describe('useAnnouncementBanner', () => {
  const mockIsFeatureEnabled = posthog.isFeatureEnabled as jest.MockedFunction<typeof posthog.isFeatureEnabled>
  const mockGetFeatureFlagPayload = posthog.getFeatureFlagPayload as jest.MockedFunction<
    typeof posthog.getFeatureFlagPayload
  >
  const mockOnFeatureFlags = posthog.onFeatureFlags as jest.MockedFunction<typeof posthog.onFeatureFlags>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty array when feature flag is disabled', () => {
    mockIsFeatureEnabled.mockReturnValue(false)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual([])
    expect(mockIsFeatureEnabled).toHaveBeenCalledWith(BANNER_FLAG)
  })

  it('should return empty array when payload is null', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue(null)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual([])
  })

  it('should return empty array when payload is not an array', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue({ message: 'test', variant: 'info', dismissible: false } as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual([])
  })

  it('should parse payload when returned as a JSON string', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue(
      JSON.stringify([{ id: 'banner-1', message: 'Parsed banner', variant: 'info', dismissible: false }]) as never
    )

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toHaveLength(1)
    expect(result.current[0].message).toBe('Parsed banner')
    expect(result.current[0].id).toBe('banner-1')
  })

  it('should return empty array when payload is an invalid JSON string', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue('not valid json' as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual([])
  })

  it('should return empty array when payload is an empty array', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue([] as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual([])
  })

  it('should return valid banners from array payload', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue([
      { title: 'Kubernetes Upgrade', message: 'Upgrade available', variant: 'info', dismissible: true },
      { message: 'Maintenance window', variant: 'warning', dismissible: false },
    ] as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toEqual([
      {
        title: 'Kubernetes Upgrade',
        message: 'Upgrade available',
        variant: 'info',
        dismissible: true,
        buttonLabel: undefined,
        buttonUrl: undefined,
      },
      {
        title: undefined,
        message: 'Maintenance window',
        variant: 'warning',
        dismissible: false,
        buttonLabel: undefined,
        buttonUrl: undefined,
      },
    ])
  })

  it('should skip invalid items in the array', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue([
      { message: 'Valid banner', variant: 'info', dismissible: false },
      { message: 'Missing variant', dismissible: false },
      null,
      { message: 'Invalid variant', variant: 'unknown', dismissible: true },
    ] as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current).toHaveLength(1)
    expect(result.current[0].message).toBe('Valid banner')
  })

  it('should return banner with optional buttonLabel and buttonUrl', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue([
      {
        message: 'New feature',
        variant: 'info',
        dismissible: false,
        buttonLabel: 'Have a look',
        buttonUrl: 'https://docs.qovery.com',
      },
    ] as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current[0]).toEqual({
      title: undefined,
      message: 'New feature',
      variant: 'info',
      dismissible: false,
      buttonLabel: 'Have a look',
      buttonUrl: 'https://docs.qovery.com',
    })
  })

  it('should ignore non-string buttonLabel and buttonUrl', () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    mockGetFeatureFlagPayload.mockReturnValue([
      { message: 'Test', variant: 'info', dismissible: false, buttonLabel: 123, buttonUrl: true },
    ] as never)

    const { result } = renderHook(() => useAnnouncementBanner())

    expect(result.current[0].buttonLabel).toBeUndefined()
    expect(result.current[0].buttonUrl).toBeUndefined()
  })

  it('should register feature flag listener', () => {
    mockIsFeatureEnabled.mockReturnValue(false)

    renderHook(() => useAnnouncementBanner())

    expect(mockOnFeatureFlags).toHaveBeenCalled()
  })
})
