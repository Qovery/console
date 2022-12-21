import { render } from '__tests__/utils/setup-jest'
import posthog from 'posthog-js'
import React from 'react'
import PageLogoutFeature from './page-logout-feature'

const PostHogWrapper = ({ children }: { children: React.ReactElement }) => {
  posthog.init('__test__posthog__token', {
    api_host: '__test__environment__posthog__apihost',
  })

  return children
}

describe('PageLogoutFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <PostHogWrapper>
        <PageLogoutFeature />
      </PostHogWrapper>
    )
    expect(baseElement).toBeTruthy()
  })
})
