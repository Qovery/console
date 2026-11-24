import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { Icon, Kbd } from '@qovery/shared/ui'
import { useFormatHotkeys } from '@qovery/shared/util-hooks'
import { Spotlight } from '../spotlight/spotlight'

const SpotlightTriggerBase = ({ organizationId }: { organizationId: string }) => {
  const [openSpotlight, setOpenSpotlight] = useState(false)
  const metaKey = useFormatHotkeys('meta')

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpenSpotlight(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  if (!metaKey || !organizationId) return null

  return (
    <>
      {/* Below md the trigger is a square search icon so search stays reachable on phones */}
      <button
        aria-label="Search"
        className={clsx(
          'group flex h-7 items-center gap-1.5 rounded-md border border-neutral bg-surface-neutral text-ssm transition-colors hover:border-neutral-component max-md:w-7 max-md:justify-center md:w-[200px] md:pl-2 md:pr-1.5',
          // Touch screens: an invisible halo gives the 28px icon a 44px tall tap target without reaching its neighbours
          "[@media(pointer:coarse)]:relative [@media(pointer:coarse)]:after:absolute [@media(pointer:coarse)]:after:-inset-y-2 [@media(pointer:coarse)]:after:inset-x-0 [@media(pointer:coarse)]:after:content-['']"
        )}
        onClick={() => setOpenSpotlight(!openSpotlight)}
      >
        <Icon
          iconName="magnifying-glass"
          iconStyle="regular"
          className="text-xs text-neutral-subtle transition-colors group-hover:text-neutral"
        />
        <span className="text-neutral-subtle max-md:hidden">Search</span>
        <div className="ml-auto flex gap-1 text-neutral-subtle max-md:hidden">
          <Kbd className={`px-1 pt-[1px] ${metaKey === 'Ctrl' ? 'text-2xs' : 'text-sm'}`}>{metaKey}</Kbd>
          <Kbd>
            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="8" fill="none" viewBox="0 0 6 8">
              <path
                fill="var(--neutral-11)"
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

export function SpotlightTrigger() {
  const { organizationId = '' } = useParams({ strict: false })
  return <SpotlightTriggerBase organizationId={organizationId} />
}

export default SpotlightTrigger
