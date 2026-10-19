import { type ReactNode } from 'react'
import { Icon, linkVariants } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

function ExternalAnchor({
  href,
  color,
  size,
  className,
  children,
}: {
  href: string
  color: 'subtle' | 'sky'
  size?: 'ssm'
  className?: string
  children: ReactNode
}) {
  return (
    <a href={href} className={twMerge(linkVariants({ color, size }), className)}>
      {children}
    </a>
  )
}

export function BackToWebsiteLink({ className }: { className?: string }) {
  return (
    <ExternalAnchor href="https://www.qovery.com" color="subtle" className={className}>
      <Icon iconName="arrow-left" />
      Back to website
    </ExternalAnchor>
  )
}

export function AuthLegalNotice() {
  return (
    <p className="mt-6 text-center text-ssm text-neutral-subtle">
      By continuing, you agree to Qovery’s{' '}
      <ExternalAnchor href="https://www.qovery.com/terms" className="font-normal" color="sky" size="ssm">
        Terms of Service
      </ExternalAnchor>{' '}
      and{' '}
      <ExternalAnchor href="https://www.qovery.com/privacy" className="font-normal" color="sky" size="ssm">
        Privacy Policy
      </ExternalAnchor>
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
