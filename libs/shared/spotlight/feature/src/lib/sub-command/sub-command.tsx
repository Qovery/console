import * as Popover from '@radix-ui/react-popover'
import clsx from 'clsx'
import { Command as Cmdk } from 'cmdk'
import { type ServiceLightResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFavoriteServices } from '@qovery/domains/services/feature'
import { ENVIRONMENTS_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, Command, Icon, Kbd, Truncate } from '@qovery/shared/ui'
import { useFormatHotkeys } from '@qovery/shared/util-hooks'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'

const CustomKbd = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return (
    <Kbd
      className={twMerge(
        'h-4 w-4 justify-center border border-neutral-250 bg-neutral-150 text-2xs text-neutral-350',
        className
      )}
    >
      {children}
    </Kbd>
  )
}

// https://github.com/pacocoursey/cmdk?tab=readme-ov-file#use-inside-popover
export function SubCommand({
  organizationId,
  inputRef,
  listRef,
  service,
  onOpenChange,
  reset,
}: {
  organizationId: string
  inputRef: React.RefObject<HTMLInputElement>
  listRef: React.RefObject<HTMLElement>
  reset: () => void
  service?: ServiceLightResponse
  onOpenChange?: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const metaKey = useFormatHotkeys('meta')
  const { toggleFavoriteService, isServiceFavorite } = useFavoriteServices({ organizationId })
  const subInputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)

  const iconClassName = 'text-brand-500 text-sm text-center w-5'

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((o) => !o)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    if (open) {
      el.style.overflow = 'hidden'
      el.style.pointerEvents = 'none'
    } else {
      el.style.overflow = ''
      el.style.pointerEvents = 'initial'
    }
  }, [open, listRef, service])

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
      reset()
    }
  }

  const isFavorite = service && isServiceFavorite(service.id)

  return (
    <div className="flex h-9 items-center justify-end border-t border-neutral-200 bg-neutral-100 px-2.5">
      <div
        className={clsx('flex items-center gap-1', {
          'relative left-2.5': service,
        })}
      >
        <div className="flex items-center gap-4">
          <span className="flex gap-1.5 text-xs text-neutral-350">
            Arrow to navigate
            <CustomKbd>
              <Icon iconName="arrow-up" />
            </CustomKbd>
            <CustomKbd>
              <Icon iconName="arrow-down" />
            </CustomKbd>
          </span>
          <span className="flex gap-1.5 text-xs text-neutral-350">
            Enter to open
            <CustomKbd>
              <Icon iconName="arrow-turn-down-left" />
            </CustomKbd>
          </span>
        </div>
        {service && (
          <Popover.Root open={open} onOpenChange={setOpen} modal>
            <Popover.Trigger asChild onClick={() => setOpen(true)} aria-expanded={open}>
              <Button size="xs" variant="plain" color="neutral" className="gap-1.5 font-normal text-neutral-350">
                Actions
                <CustomKbd className="text-[12px]">{metaKey}</CustomKbd>
                <CustomKbd>K</CustomKbd>
              </Button>
            </Popover.Trigger>
            <Popover.Content
              side="top"
              align="end"
              className="w-64 animate-[scalein_0.18s_ease_both] rounded-md border border-neutral-200 bg-white shadow-lg delay-[100ms]"
              sideOffset={16}
              alignOffset={0}
              onCloseAutoFocus={(e) => {
                e.preventDefault()
                inputRef?.current?.focus()
              }}
            >
              <Cmdk>
                <Command.List className="m-2">
                  <Command.Empty>
                    <div className="pt-2 text-center">
                      <p className="text-xs font-medium text-neutral-350">No result</p>
                    </div>
                  </Command.Empty>
                  <Command.Group
                    heading={<Truncate text={upperCaseFirstLetter(service.name)} truncateLimit={30} />}
                    className="text-xs [&>[cmdk-group-heading]]:mx-1 [&>[cmdk-group-heading]]:py-2"
                  >
                    <Command.Item onSelect={navigateToProject} className="text-ssm">
                      <Icon iconName="arrow-right" className={iconClassName} />
                      Go to Project
                    </Command.Item>
                    <Command.Item onSelect={navigateToEnvironment} className="text-ssm">
                      <Icon iconName="arrow-right" className={iconClassName} />
                      Go to Environment
                    </Command.Item>
                    <Command.Item onSelect={handleToggleFavorite} className="text-ssm">
                      <Icon
                        iconName="star"
                        iconStyle={isFavorite ? 'solid' : 'regular'}
                        className={twMerge(
                          clsx('w-5 text-center text-sm text-neutral-300', {
                            'text-yellow-500': isFavorite,
                          })
                        )}
                      />
                      {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Command.Item>
                  </Command.Group>
                </Command.List>
                <Command.Input
                  ref={subInputRef}
                  autoFocus
                  placeholder="Search for actions..."
                  className="border-b-0 border-t border-neutral-200 bg-transparent p-3 text-ssm"
                />
              </Cmdk>
            </Popover.Content>
          </Popover.Root>
        )}
      </div>
    </div>
  )
}

export default SubCommand
