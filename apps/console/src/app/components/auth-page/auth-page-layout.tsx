import { type ReactNode } from 'react'
import { Icon, Link } from '@qovery/shared/ui'
import { AUTH_PAGE_COPY } from './auth-page.copy'

export const AUTH_CARD_CLASSNAME =
  'w-full max-w-[480px] rounded-2xl border border-neutral bg-surface-neutral-subtle shadow-[0_2px_5px_0_rgba(0,0,0,0.02),0_0_24px_0_rgba(0,0,0,0.04)] lg:min-w-[480px]'
export const AUTH_CARD_BODY_CLASSNAME =
  'relative rounded-2xl bg-background px-4 pb-4 pt-8 outline outline-[1px] outline-neutral sm:px-8 sm:pb-6'

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

export function AuthLegalNotice({ prefix = AUTH_PAGE_COPY.shared.legalPrefix }: { prefix?: string }) {
  return (
    <p className="mt-6 text-center text-ssm text-neutral-subtle">
      {prefix}{' '}
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
