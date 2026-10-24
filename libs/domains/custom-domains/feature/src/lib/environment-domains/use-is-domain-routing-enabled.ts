import { useFeatureFlagEnabled } from 'posthog-js/react'
import { NODE_ENV } from '@qovery/shared/util-node-env'

// Visible in local development for the design review; behind the `path-based-routing` flag everywhere else.
export const useIsDomainRoutingEnabled = () =>
  Boolean(useFeatureFlagEnabled('path-based-routing')) || NODE_ENV === 'development'
