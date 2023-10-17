import { useEffect, useState } from 'react'
import { Button, Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { BreadcrumbFeature } from '../../feature/breadcrumb/breadcrumb'
import Spotlight from '../../feature/spotlight/spotlight'

export function TopBar() {
  const [openSpotlight, setOpenSpotlight] = useState(false)

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpenSpotlight((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <div className="sticky top-0 left-16 border-l border-b w-full h-navbar-height dark:border-neutral-500 dark:bg-neutral-650 border-neutral-200 bg-white">
      <div className="flex px-5 justify-between items-center h-full">
        <BreadcrumbFeature />
        <Button onClick={() => setOpenSpotlight(!openSpotlight)}>
          <Icon name={IconAwesomeEnum.MAGNIFYING_GLASS} />
        </Button>
        <Spotlight open={openSpotlight} onOpenChange={setOpenSpotlight} />
      </div>
    </div>
  )
}

export default TopBar
