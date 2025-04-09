import * as Popover from '@radix-ui/react-popover'
import clsx from 'clsx'
import { Command as Cmdk } from 'cmdk'
import { type ServiceLightResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren, useEffect, useRef } from 'react'
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
        'h-4 min-w-4 justify-center border border-neutral-250 bg-neutral-150 text-2xs text-neutral-350',
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
  open,
  setOpen,
  onSpotlightOpenChange,
  resetSelection,
}: {
  organizationId: string
  inputRef: React.RefObject<HTMLInputElement>
  listRef: React.RefObject<HTMLElement>
  resetSelection: () => void
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  open: boolean
  service?: ServiceLightResponse
  onSpotlightOpenChange?: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const metaKey = useFormatHotkeys('meta')
  const { toggleFavoriteService, isServiceFavorite } = useFavoriteServices({ organizationId })
  const subInputRef = useRef<HTMLInputElement | null>(null)

  const iconClassName = 'text-brand-500 text-sm text-center w-5'
  const isFavorite = service && isServiceFavorite(service.id)

  useEffect(() => {
    if (!service) return

    // Handler for keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Meta+K toggle
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(!open)
      }

      // Escape to close
      if (event.key === 'Escape' && open) {
        setOpen(false)
      }
    }

    // Handler for right-clicks on service items
    const handleRightClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target && target?.getAttribute('data-value')?.includes('service-')) {
        event.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleRightClick)

    // Handle list styling when popup is open
    if (listRef.current) {
      if (open) {
        listRef.current.style.overflow = 'hidden'
        listRef.current.style.pointerEvents = 'none'
      } else {
        listRef.current.style.overflow = ''
        listRef.current.style.pointerEvents = 'initial'
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleRightClick)
    }
  }, [service, open, setOpen, listRef])

  // Navigation and action handlers
  const navigateToProject = () => {
    if (service?.project_id) {
      navigate(ENVIRONMENTS_URL(organizationId, service.project_id))
      onSpotlightOpenChange?.(false)
      setOpen(false)
      resetSelection()
    }
  }

  const navigateToEnvironment = () => {
    if (service?.project_id && service?.environment_id) {
      navigate(SERVICES_URL(organizationId, service.project_id, service.environment_id))
      onSpotlightOpenChange?.(false)
      setOpen(false)
      resetSelection()
    }
  }

  const handleToggleFavorite = () => {
    if (service) {
      toggleFavoriteService(service)
      setOpen(false)
    }
  }

  return (
    <div className="flex h-9 items-center justify-end gap-4 border-t border-neutral-200 bg-neutral-100 px-2.5">
      <span className="flex gap-1.5 text-xs text-neutral-350">
        Arrow to navigate
        <CustomKbd className="w-4">
          <Icon iconName="arrow-up" />
        </CustomKbd>
        <CustomKbd className="w-4">
          <Icon iconName="arrow-down" />
        </CustomKbd>
      </span>
      <span className="flex gap-1.5 text-xs text-neutral-350">
        Enter to open
        <CustomKbd className="w-4">
          <Icon iconName="arrow-turn-down-left" />
        </CustomKbd>
      </span>
      {service && (
        <Popover.Root open={open} onOpenChange={setOpen} modal>
          <Popover.Trigger asChild aria-expanded={open}>
            <Button
              size="sm"
              variant={open ? 'solid' : 'outline'}
              color={open ? 'brand' : 'neutral'}
              className={clsx('gap-1.5 font-normal', {
                'border border-brand-500': open,
              })}
            >
              Actions
              <CustomKbd className="text-xs">{metaKey}</CustomKbd>
              <CustomKbd className="w-4">K</CustomKbd>
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
            <Cmdk loop>
              <Command.List className="m-2 mt-1 p-0 [&>[cmdk-list-sizer]]:m-0">
                <Command.Empty>
                  <div className="pt-3 text-center">
                    <p className="text-xs font-medium text-neutral-350">No result</p>
                  </div>
                </Command.Empty>
                <Command.Group
                  heading={<Truncate text={upperCaseFirstLetter(service.name)} truncateLimit={30} />}
                  className="text-xs [&>[cmdk-group-heading]]:mx-1 [&>[cmdk-group-heading]]:py-2"
                >
                  <Command.Item onSelect={navigateToProject} className="text-ssm">
                    <Icon iconName="arrow-right" className={iconClassName} />
                    Go to project
                  </Command.Item>
                  <Command.Item onSelect={navigateToEnvironment} className="text-ssm">
                    <Icon iconName="arrow-right" className={iconClassName} />
                    Go to environment
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
                    {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
  )
}

export default SubCommand
