import { type ReactNode } from 'react'
import { BreadcrumbFeature } from '../../feature/breadcrumb/breadcrumb'

export function TopBar({ children }: { children?: ReactNode }) {
  return (
    <div className="sticky left-16 top-0 h-navbar-height w-full border-b border-l border-neutral-200 bg-white dark:border-neutral-500 dark:bg-neutral-600">
      <div className="flex h-full items-center justify-between px-5">
        <BreadcrumbFeature />
        {children}
      </div>
    </div>
  )
}

export default TopBar
