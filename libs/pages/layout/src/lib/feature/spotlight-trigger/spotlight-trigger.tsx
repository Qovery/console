import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Spotlight } from '@qovery/shared/spotlight/feature'
import { Icon, Kbd } from '@qovery/shared/ui'
import { useFormatHotkeys } from '@qovery/shared/util-hooks'

export function SpotlightTrigger() {
  const [openSpotlight, setOpenSpotlight] = useState(false)
  const metaKey = useFormatHotkeys('meta')
  const { organizationId = '' } = useParams()

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

  if (!metaKey) return null

  return (
    <>
      <button
        className="flex min-w-[268px] items-center gap-2 rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
        onClick={() => setOpenSpotlight(!openSpotlight)}
      >
        <Icon iconName="magnifying-glass" iconStyle="regular" className="text-neutral-400" />
        <span className="text-neutral-350">Search for help</span>
        <div className="ml-auto flex gap-1 text-neutral-350">
          <Kbd>{metaKey}</Kbd>
          <Kbd>K</Kbd>
        </div>
      </button>
      <Spotlight organizationId={organizationId} open={openSpotlight} onOpenChange={setOpenSpotlight} />
    </>
  )
}

export default SpotlightTrigger
