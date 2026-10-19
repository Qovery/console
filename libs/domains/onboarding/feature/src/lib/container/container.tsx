import { Link } from '@tanstack/react-router'
import { type PropsWithChildren, type ReactNode } from 'react'
import { LogoBrandedIcon } from '@qovery/shared/ui'

export interface ContainerProps extends PropsWithChildren {
  userMenu: ReactNode
}

export function Container({ children, userMenu }: ContainerProps) {
  return (
    <div data-onboarding-profile className="fixed inset-0 z-10 flex flex-col overflow-y-auto bg-background-secondary">
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-8">
        <Link
          to="/"
          aria-label="Qovery home"
          className="focus-visible:ring-brand rounded focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-background-secondary"
        >
          <LogoBrandedIcon className="h-6 w-auto text-neutral" role="img" aria-label="Qovery" />
        </Link>
        {userMenu}
      </header>
      <main className="layout-onboarding flex min-h-full shrink-0 flex-col items-center justify-start px-4 pb-6 pt-24 sm:justify-center sm:py-20">
        {children}
      </main>
    </div>
  )
}

export default Container
