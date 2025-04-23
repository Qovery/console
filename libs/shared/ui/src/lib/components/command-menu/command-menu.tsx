import { Command as CmdK } from 'cmdk'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'

interface CommandDialogProps extends ComponentPropsWithoutRef<typeof CmdK.Dialog> {}

const CommandDialog = forwardRef<ElementRef<typeof CmdK.Dialog>, CommandDialogProps>(function CommandDialog(
  { className, ...props },
  ref
) {
  return (
    <CmdK.Dialog
      ref={ref}
      contentClassName="modal__content fixed top-[84px] left-1/2"
      overlayClassName="modal__overlay fixed w-full h-screen top-0 left-0 bg-neutral-700/20"
      className={twMerge(
        'mx-auto w-[640px] overflow-hidden rounded-lg border border-neutral-150 bg-white shadow-[0_16px_70px_rgba(0,0,0,0.2)] transition-transform duration-100',
        className
      )}
      {...props}
    />
  )
})

interface CommandInputProps extends ComponentPropsWithoutRef<typeof CmdK.Input> {}

export const commandInputStyle =
  'w-full text-base text-neutral-550 rounded-none p-4 border-b border-neutral-200 outline-none'

const CommandInput = forwardRef<ElementRef<typeof CmdK.Input>, CommandInputProps>(function CommandInput(
  { className, ...props },
  ref
) {
  return <CmdK.Input ref={ref} className={twMerge(commandInputStyle, className)} {...props} />
})

interface CommandListProps extends ComponentPropsWithoutRef<typeof CmdK.List> {}

const CommandList = forwardRef<ElementRef<typeof CmdK.List>, CommandListProps>(function CommandList(
  { className, ...props },
  ref
) {
  return (
    <CmdK.List
      ref={ref}
      className={twMerge(
        'max-h-[480px] overflow-auto overscroll-y-contain transition-all duration-100 [&>[cmdk-list-sizer]]:mx-2 [&>[cmdk-list-sizer]]:my-3',
        className
      )}
      style={{
        height: 'min(400px, var(--cmdk-list-height))',
      }}
      {...props}
    />
  )
})

interface CommandEmptyProps extends ComponentPropsWithoutRef<typeof CmdK.Empty> {}

const CommandEmpty = forwardRef<ElementRef<typeof CmdK.Empty>, CommandEmptyProps>(function CommandEmpty(
  { className, ...props },
  ref
) {
  return <CmdK.Empty ref={ref} className={twMerge('pb-2 text-center text-xs text-neutral-350', className)} {...props} />
})

interface CommandGroupProps extends ComponentPropsWithoutRef<typeof CmdK.Group> {}

const CommandGroup = forwardRef<ElementRef<typeof CmdK.Group>, CommandGroupProps>(function CommandGroup(
  { className, ...props },
  ref
) {
  return (
    <CmdK.Group
      ref={ref}
      className={twMerge(
        'text-sm text-neutral-350 [&>[cmdk-group-heading]]:mx-1.5 [&>[cmdk-group-heading]]:py-1',
        className
      )}
      {...props}
    />
  )
})

interface CommandItemProps extends ComponentPropsWithoutRef<typeof CmdK.Item> {}

const CommandItem = forwardRef<ElementRef<typeof CmdK.Item>, CommandItemProps>(function CommandItem(
  { className, ...props },
  ref
) {
  return (
    <CmdK.Item
      ref={ref}
      className={twMerge(
        'flex h-9 cursor-pointer items-center gap-2 rounded px-2 text-sm font-medium text-neutral-400 hover:bg-neutral-150 data-[selected="true"]:bg-brand-50 data-[selected="true"]:text-brand-500',
        className
      )}
      {...props}
    />
  )
})

interface CommandSeparatorProps extends ComponentPropsWithoutRef<typeof CmdK.Separator> {}

const CommandSeparator = forwardRef<ElementRef<typeof CmdK.Separator>, CommandSeparatorProps>(function CommandSeparator(
  { className, ...props },
  ref
) {
  return (
    <CmdK.Separator
      ref={ref}
      className={twMerge('my-2.5 -ml-2 h-[1px] w-[calc(100%+16px)] bg-neutral-200', className)}
      {...props}
    />
  )
})

interface CommandLoadingProps extends ComponentPropsWithoutRef<typeof CmdK.Loading> {}

const CommandLoading = forwardRef<ElementRef<typeof CmdK.Separator>, CommandLoadingProps>(function CommandLoading(
  { className, ...props },
  ref
) {
  return <CmdK.Loading ref={ref} className={twMerge('', className)} {...props} />
})

const Command = Object.assign(
  {},
  {
    Dialog: CommandDialog,
    Input: CommandInput,
    List: CommandList,
    Empty: CommandEmpty,
    Group: CommandGroup,
    Item: CommandItem,
    Separator: CommandSeparator,
    Loading: CommandLoading,
  }
)

export type {
  CommandDialogProps,
  CommandInputProps,
  CommandListProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandItemProps,
  CommandSeparatorProps,
  CommandLoadingProps,
}

export { Command, CommandDialog, CommandInput }
