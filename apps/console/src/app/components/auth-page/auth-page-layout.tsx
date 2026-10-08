import { type ReactNode } from 'react'
import { Icon, Link } from '@qovery/shared/ui'
import { AUTH_PAGE_COPY } from './auth-page.copy'

export interface AuthPageLayoutProps {
  card: ReactNode
  visual: ReactNode
}

export function AuthPageLayout({ card, visual }: AuthPageLayoutProps) {
  return (
    <div data-theme="light" className="relative min-h-screen w-screen overflow-x-hidden bg-background-secondary">
      <Link
        href="https://www.qovery.com"
        color="subtle"
        className="pointer-events-auto absolute left-4 top-4 z-tooltip"
      >
        <Icon iconName="arrow-left" />
        {AUTH_PAGE_COPY.shared.backToWebsite}
      </Link>

      <div className="relative mx-auto flex min-h-screen w-full lg:h-screen">
        <div className="relative z-modal flex w-full items-center justify-center px-2 sm:px-16 lg:flex-[1_1_0%] lg:px-10">
          {card}
        </div>

        {visual}
      </div>
    </div>
  )
}

export function AuthLegalNotice() {
  return (
    <p className="mt-6 text-center text-ssm text-neutral-subtle">
      {AUTH_PAGE_COPY.shared.legalPrefix}{' '}
      <Link href="https://www.qovery.com/terms" className="font-normal" color="sky" size="ssm">
        {AUTH_PAGE_COPY.shared.termsOfService}
      </Link>{' '}
      {AUTH_PAGE_COPY.shared.legalAnd}{' '}
      <Link href="https://www.qovery.com/privacy" className="font-normal" color="sky" size="ssm">
        {AUTH_PAGE_COPY.shared.privacyPolicy}
      </Link>
    </p>
  )
}

export function Auth0ErrorMessage({ error, description }: { error: string; description?: string }) {
  return (
    <div className="mt-4 rounded-md border border-negative-component bg-surface-negative-subtle p-3">
      <p className="text-sm font-medium text-negative">{error}</p>
      <p className="mt-1 text-sm text-neutral-subtle">{description}</p>
    </div>
  )
}

export function ComplianceLogos() {
  return (
    <>
      <img src="/assets/login/compliance-logos/soc2.png" alt="SOC 2 logo" className="h-12 w-12 object-contain" />
      <img src="/assets/login/compliance-logos/hipaa.png" alt="HIPAA logo" className="h-12 w-12 object-contain" />
      <img
        src="/assets/login/compliance-logos/aws-partner.png"
        alt="AWS Partner logo"
        className="h-12 w-12 object-contain"
      />
      <img src="/assets/login/compliance-logos/dora.png" alt="DORA logo" className="h-12 w-12 object-contain" />
      <img src="/assets/login/compliance-logos/gdpr.png" alt="GDPR logo" className="h-12 w-12 object-contain" />
    </>
  )
}

// Empty card shown while the sign-up flag resolves (at most 1s): no spinner to avoid a flash
export function AuthPageLoadingCard() {
  return (
    <div
      data-testid="auth-page-loading"
      aria-busy
      className="h-[420px] w-full max-w-[480px] rounded-2xl border border-neutral bg-background shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)] lg:min-w-[480px]"
    />
  )
}

export function AuthPageLoadingVisual() {
  return (
    <div className="pointer-events-none relative hidden lg:block lg:h-screen lg:max-w-[1280px] lg:flex-[2_1_0%]">
      <img
        src="/assets/login/onboarding-background.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-full w-auto max-w-none select-none"
      />
    </div>
  )
}
