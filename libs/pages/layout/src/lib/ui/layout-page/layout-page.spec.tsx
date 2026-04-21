import posthog from 'posthog-js'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import * as iamFeature from '@qovery/shared/iam/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import LayoutPage, { type LayoutPageProps } from './layout-page'
import { redirectToUrl } from './layout-page.utils'

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
  getFeatureFlagPayload: jest.fn(),
  isFeatureEnabled: jest.fn(() => false),
  onFeatureFlags: jest.fn(),
}))

jest.mock('posthog-js/react', () => ({
  useFeatureFlagEnabled: jest.fn(() => true),
  useFeatureFlagVariantKey: jest.fn(() => false),
}))

jest.mock('@qovery/domains/clusters/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/clusters/feature'),
    ClusterDeploymentProgressCard: () => null,
    useClusterStatuses: () => ({
      data: [
        {
          cluster_id: '0000-0000-0000-0000',
          status: 'INVALID_CREDENTIALS',
        },
      ],
    }),
  }
})

jest.mock('@qovery/domains/organizations/feature', () => ({
  FreeTrialBanner: () => null,
  InvoiceBanner: () => null,
  useOrganization: () => ({ data: undefined }),
}))

jest.mock('@qovery/shared/assistant/feature', () => ({
  AssistantTrigger: () => null,
}))

jest.mock('@qovery/shared/devops-copilot/feature', () => ({
  DevopsCopilotButton: () => null,
  DevopsCopilotTrigger: () => null,
}))

jest.mock('@qovery/shared/posthog/feature', () => ({
  AnnouncementBanner: () => null,
}))

jest.mock('./layout-page.utils', () => ({
  redirectToUrl: jest.fn(),
}))

jest.mock('../navigation/navigation', () => () => null)
jest.mock('../top-bar/top-bar', () => ({ children }: { children: ReactNode }) => <>{children}</>)
jest.mock('../../feature/spotlight-trigger/spotlight-trigger', () => () => null)

const useFeatureFlagEnabledMock = useFeatureFlagEnabled as jest.MockedFunction<typeof useFeatureFlagEnabled>

const renderComponent = (props: LayoutPageProps) => <LayoutPage {...props} />

describe('LayoutPage', () => {
  const props: LayoutPageProps = {
    defaultOrganizationId: '0000-0000-0000-0000',
    topBar: false,
  }

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    useFeatureFlagEnabledMock.mockReturnValue(true)
    jest.spyOn(iamFeature, 'getNewConsoleUrl').mockReturnValue('https://new-console.qovery.com/organization/123')
    jest.spyOn(iamFeature, 'useConsoleRedirectPreference').mockReturnValue({
      preferredConsole: 'legacy',
      isNewConsoleDefault: false,
      setPreferredConsole: jest.fn(),
      setIsNewConsoleDefault: jest.fn(),
    })
    jest.spyOn(iamFeature, 'useUserRole').mockReturnValue({
      roles: [],
      isQoveryAdminUser: false,
      loading: false,
    } as ReturnType<typeof iamFeature.useUserRole>)
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(renderComponent({ ...props }))
    expect(baseElement).toBeTruthy()
  })

  it('should have cluster deployment error banner', () => {
    renderWithProviders(
      renderComponent({
        ...props,
        clusters: [
          {
            id: '0000-0000-0000-0000',
            name: 'cluster-name',
            created_at: '',
            region: '',
            cloud_provider: CloudProviderEnum.AWS,
          },
        ],
      })
    )
    screen.getByText('Check the credentials configuration')
  })

  it('should capture an analytics event when dismissing the console migration prompt', async () => {
    const { userEvent } = renderWithProviders(renderComponent({ ...props }))

    await userEvent.click(screen.getByRole('button', { name: 'Not interested' }))

    expect(posthog.capture).toHaveBeenCalledWith('legacy-console-migration-prompt-dismissed', {
      target_url: 'https://new-console.qovery.com/organization/123',
    })
  })

  it('should capture an analytics event when confirming the console migration prompt', async () => {
    const { userEvent } = renderWithProviders(renderComponent({ ...props }))

    await userEvent.click(screen.getByRole('button', { name: 'Try now' }))

    expect(posthog.capture).toHaveBeenCalledWith('legacy-console-migration-prompt-confirmed', {
      target_url: 'https://new-console.qovery.com/organization/123',
    })
    expect(redirectToUrl).toHaveBeenCalledWith('https://new-console.qovery.com/organization/123')
  })
})
