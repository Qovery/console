import { Link } from '@tanstack/react-router'
import { type PropsWithChildren, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { LogoBrandedIcon } from '@qovery/shared/ui'

export interface ContainerProps extends PropsWithChildren {
  profileUserMenu: ReactNode
}

export function Container({ children, profileUserMenu }: ContainerProps) {
  return createPortal(
    <div data-onboarding-profile className="fixed inset-0 z-10 flex flex-col overflow-y-auto bg-background-secondary">
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-8">
        <Link
          to="/"
          aria-label="Qovery home"
          className="focus-visible:ring-brand rounded focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-background-secondary"
        >
          <LogoBrandedIcon className="h-6 w-auto text-neutral" role="img" aria-label="Qovery" />
        </Link>
        {profileUserMenu}
      </header>
      <main className="layout-onboarding flex min-h-full shrink-0 flex-col items-center justify-start px-4 pb-6 pt-24 sm:justify-center sm:py-20">
        {children}
      </main>
    </div>,
    document.body
  )
}

export default Container
