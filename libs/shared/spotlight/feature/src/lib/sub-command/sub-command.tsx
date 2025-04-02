import * as Popover from '@radix-ui/react-popover'
import { Command } from 'cmdk'
import { type ServiceLightResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ENVIRONMENTS_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, Icon, Kbd } from '@qovery/shared/ui'
import { useFavoriteServices, useFormatHotkeys } from '@qovery/shared/util-hooks'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

// https://github.com/pacocoursey/cmdk?tab=readme-ov-file#use-inside-popover
export function SubCommand({
  organizationId,
  inputRef,
  service,
  onOpenChange,
}: {
  organizationId: string
  inputRef: React.RefObject<HTMLInputElement>
  service?: ServiceLightResponse
  onOpenChange?: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const metaKey = useFormatHotkeys('meta')
  const [open, setOpen] = useState(false)
  const { toggleFavoriteService, isServiceFavorite } = useFavoriteServices({ organizationId })

  useEffect(() => {
    function listener(e: KeyboardEvent) {
      if (e.key === 'k' && e.metaKey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [])

  const navigateToProject = () => {
    if (service?.project_id) {
      navigate(ENVIRONMENTS_URL(organizationId, service.project_id))
      onOpenChange?.(false)
      setOpen(false)
    }
  }

  const navigateToEnvironment = () => {
    if (service?.project_id && service?.environment_id) {
      navigate(SERVICES_URL(organizationId, service.project_id, service.environment_id))
      onOpenChange?.(false)
      setOpen(false)
    }
  }

  const handleToggleFavorite = () => {
    if (service) {
      toggleFavoriteService(service)
      setOpen(false)
    }
  }

  const isFavorite = service && isServiceFavorite(service.id)

  return (
    <div className="flex justify-end border-t border-neutral-200 bg-neutral-150">
      {service && (
        <Popover.Root open={open} onOpenChange={setOpen} modal>
          <Popover.Trigger asChild>
            <Button size="sm" variant="plain" color="neutral" onClick={() => setOpen((open) => !open)}>
              Actions
              <Kbd>{metaKey}</Kbd>
              <Kbd>K</Kbd>
            </Button>
          </Popover.Trigger>
          <Popover.Content
            side="top"
            align="end"
            className="w-64 rounded-md border border-neutral-200 bg-white shadow-lg"
            sideOffset={16}
            alignOffset={0}
            onCloseAutoFocus={(e) => {
              e.preventDefault()
              inputRef?.current?.focus()
            }}
          >
            <Command>
              <Command.List>
                <Command.Group heading={upperCaseFirstLetter(service.name)}>
                  <Command.Item onSelect={navigateToProject}>
                    <Icon iconName="folder-open" />
                    Go to Project
                  </Command.Item>
                  <Command.Item onSelect={navigateToEnvironment}>
                    <Icon iconName="server" />
                    Go to Environment
                  </Command.Item>
                  <Command.Item onSelect={handleToggleFavorite}>
                    <Icon
                      iconName="star"
                      iconStyle={isFavorite ? 'solid' : 'regular'}
                      className={isFavorite ? 'text-yellow-600' : 'text-neutral-300'}
                    />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Root>
      )}
    </div>
  )
}

export default SubCommand
