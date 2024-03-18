import { useEffect, useState } from 'react'
import { Spotlight } from '@qovery/shared/spotlight/feature'
import { Button, Icon, IconAwesomeEnum } from '@qovery/shared/ui'

export function SpotlightTrigger() {
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
    <>
      <Button
        variant="solid"
        color="brand"
        size="lg"
        className="fixed bottom-4 right-4 rounded-full shadow-2xl"
        onClick={() => setOpenSpotlight(!openSpotlight)}
      >
        <Icon name={IconAwesomeEnum.WAND_MAGIC_SPARKLES} className="text-lg" />
      </Button>
      <Spotlight open={openSpotlight} onOpenChange={setOpenSpotlight} />
    </>
  )
}

export default SpotlightTrigger
