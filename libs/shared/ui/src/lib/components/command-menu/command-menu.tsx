import { Command as CommandMenu } from 'cmdk'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'

export interface CommandRootProps extends ComponentPropsWithoutRef<'div'> {}

const CommandRoot = forwardRef<ElementRef<'div'>, CommandRootProps>(function CommandRoot({
  children,
  className,
  ...props
}) {
  return (
    <CommandMenu label="Command Menu" className={className} {...props}>
      {children}
    </CommandMenu>
  )
})

export interface CommandInputProps extends ComponentPropsWithoutRef<'input'> {
  /**
   * Optional controlled state for the value of the search input.
   */
  value?: string
  /**
   * Event handler called when the search value changes.
   */
  onValueChange?: (search: string) => void
}

const CommandInput = forwardRef<ElementRef<'input'>, CommandInputProps>(function CommandInput({ className, ...props }) {
  return <Command.Input className={className} {...props} />
})

const Command = Object.assign(
  {},
  {
    Root: CommandRoot,
    Input: CommandInput,
  }
)

export { Command, CommandRoot, CommandInput }
