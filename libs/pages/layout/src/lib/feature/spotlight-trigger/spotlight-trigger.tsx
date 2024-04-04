import { useEffect, useState } from 'react'
import { Spotlight } from '@qovery/shared/spotlight/feature'
import { Icon, Kbd } from '@qovery/shared/ui'
import { useFormatHotkeys } from '@qovery/shared/util-hooks'

export function SpotlightTrigger() {
  const [openSpotlight, setOpenSpotlight] = useState(false)
  const metaKey = useFormatHotkeys('meta')

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
    <>
      <button
        className="w-60 flex items-center gap-2 py-2 px-3 bg-white border border-neutral-300 rounded text-sm"
        onClick={() => setOpenSpotlight(!openSpotlight)}
      >
        <Icon iconName="magnifying-glass" className="text-neutral-400" />
        <span className="text-neutral-350">Search</span>
        <div className="ml-auto flex gap-1 text-neutral-350">
          <Kbd>{metaKey}</Kbd>
          <Kbd>K</Kbd>
        </div>
      </button>
      <Spotlight open={openSpotlight} onOpenChange={setOpenSpotlight} />
    </>
  )
}

export default SpotlightTrigger
