import { Command as CmdK } from 'carloslfu-cmdk-internal'
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
      contentClassName="fixed w-full h-full top-0 left-0 z-40 bg-neutral-700/20"
      className={twMerge(
        'rounded max-w-screen-sm w-full mt-[84px] p-2 mx-auto shadow-[0_0_32px_rgba(0,0,0,0.08)] bg-white overflow-hidden',
        className
      )}
      {...props}
    />
  )
})

interface CommandInputProps extends ComponentPropsWithoutRef<typeof CmdK.Input> {}

const CommandInput = forwardRef<ElementRef<typeof CmdK.Input>, CommandInputProps>(function CommandInput(
  { className, ...props },
  ref
) {
  return (
    <CmdK.Input
      ref={ref}
      className={twMerge(
        'w-full text-base mb-4 rounded-none px-2 pt-2 pb-4 border-b border-neutral-200 font-medium outline-none',
        className
      )}
      {...props}
    />
  )
})

interface CommandListProps extends ComponentPropsWithoutRef<typeof CmdK.List> {}

const CommandList = forwardRef<ElementRef<typeof CmdK.List>, CommandListProps>(function CommandList(
  { className, ...props },
  ref
) {
  return (
    <CmdK.List
      ref={ref}
      className={twMerge('transition-all max-h-[400px]', className)}
      style={{
        height: 'min(300px, var(--cmdk-list-height))',
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
  return <CmdK.Empty ref={ref} className={twMerge('', className)} {...props} />
})

interface CommandGroupProps extends ComponentPropsWithoutRef<typeof CmdK.Group> {}

const CommandGroup = forwardRef<ElementRef<typeof CmdK.Group>, CommandGroupProps>(function CommandGroup(
  { className, ...props },
  ref
) {
  return <CmdK.Group ref={ref} className={twMerge('text-xs text-neutral-350', className)} {...props} />
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
        'flex items-center text-sm rounded-lg gap-2 px-2 h-10 data-[selected]:bg-neutral-150 mt-1 text-neutral-400',
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
  return <CmdK.Separator ref={ref} className={twMerge('', className)} {...props} />
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
}

export { Command, CommandDialog, CommandInput }
