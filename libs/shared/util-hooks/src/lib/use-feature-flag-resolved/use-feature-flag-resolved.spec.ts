import { act, renderHook } from '@testing-library/react'
import { useFeatureFlagEnabled, usePostHog } from 'posthog-js/react'
import { useFeatureFlagResolved } from './use-feature-flag-resolved'

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn(), usePostHog: jest.fn() }))

let flagsListener: (() => void) | undefined
const mockPostHog = (hasLoadedFlags: boolean) =>
  jest.mocked(usePostHog).mockReturnValue({
    featureFlags: { hasLoadedFlags },
    onFeatureFlags: (listener: () => void) => {
      flagsListener = listener
      return () => undefined
    },
  } as unknown as ReturnType<typeof usePostHog>)

beforeEach(() => {
  flagsListener = undefined
})

it('stays pending while the flags are loading', () => {
  mockPostHog(false)
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(undefined)
  const { result } = renderHook(() => useFeatureFlagResolved('my-flag'))
  expect(result.current).toBeUndefined()
})

it('is enabled as soon as the flag is on', () => {
  mockPostHog(false)
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
  const { result } = renderHook(() => useFeatureFlagResolved('my-flag'))
  expect(useFeatureFlagEnabled).toHaveBeenCalledWith('my-flag')
  expect(result.current).toBe(true)
})

it('is disabled once the flags have loaded without it', () => {
  mockPostHog(false)
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(undefined)
  const { result } = renderHook(() => useFeatureFlagResolved('my-flag'))
  act(() => flagsListener?.())
  expect(result.current).toBe(false)
})

it('is disabled right away when the flags were already loaded', () => {
  mockPostHog(true)
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
  const { result } = renderHook(() => useFeatureFlagResolved('my-flag'))
  expect(result.current).toBe(false)
})
