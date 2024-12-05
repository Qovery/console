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
        className="group flex w-full items-center gap-2 rounded border border-neutral-250 bg-white px-3 py-2 text-sm transition-colors hover:border-neutral-350 lg:min-w-[268px] lg:max-w-max"
        onClick={() => setOpenSpotlight(!openSpotlight)}
      >
        <Icon
          iconName="magnifying-glass"
          iconStyle="regular"
          className="text-neutral-350 group-hover:text-neutral-400"
        />
        <span className="text-neutral-350">Search for help</span>
        <div className="ml-auto flex gap-1 text-neutral-350">
          <Kbd>{metaKey}</Kbd>
          <Kbd>
            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="8" fill="none" viewBox="0 0 6 8">
              <path
                fill="#67778E"
                d="M1.218.445v7.11H.275V.445zm4.292 0L2.556 3.761.896 5.484.739 4.48l1.25-1.377L4.377.445zm-.908 7.11L1.97 4.088l.561-.747 3.194 4.214z"
              ></path>
            </svg>
          </Kbd>
        </div>
      </button>
      <Spotlight organizationId={organizationId} open={openSpotlight} onOpenChange={setOpenSpotlight} />
    </>
  )
}

export default SpotlightTrigger
