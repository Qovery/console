import { useState } from 'react'
import { useIntercom } from 'react-use-intercom'
import { Command, type CommandDialogProps, Icon, IconAwesomeEnum } from '@qovery/shared/ui'

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {}

export function Spotlight({ open, onOpenChange }: SpotlightProps) {
  const [value, setValue] = useState('')

  const { showMessages: showIntercomMessenger } = useIntercom()

  return (
    <Command.Dialog label="Console Spotlight" open={open} onOpenChange={onOpenChange}>
      <Command.Input
        autoFocus
        value={value}
        onValueChange={(value) => setValue(value)}
        placeholder="What do you need?"
      />
      <Command.List>
        <Command.Group heading="Help">
          <Command.Item
            onSelect={() => {
              setValue('')
            }}
          >
            <Icon className="text-xs text-center w-6" name={IconAwesomeEnum.BOOK} />
            Search documentation
          </Command.Item>
          <Command.Item onSelect={showIntercomMessenger}>
            <Icon className="text-xs text-center w-6" name={IconAwesomeEnum.CIRCLE_QUESTION} />
            Contact support
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}

export default Spotlight
