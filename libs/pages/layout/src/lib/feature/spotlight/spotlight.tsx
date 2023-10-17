import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjects } from '@qovery/domains/projects/feature'
import { Command, type CommandDialogProps, IconAwesomeEnum } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {}

function useSpotlightSearch({ search }: { search: string }): Record<string, { icon: string; label: string }[]> {
  const { organizationId = '' } = useParams()
  const { data: projects = [] } = useProjects({ organizationId })

  return {
    projects: projects.map((project) => ({
      label: project.name,
      icon: IconAwesomeEnum.BELL as string,
    })),
  }
}

export function Spotlight({ open, onOpenChange }: SpotlightProps) {
  const [value, setValue] = useState('')
  const data = useSpotlightSearch({ search: value })

  return (
    <Command.Dialog
      label="Console Spotlight"
      open={open}
      onOpenChange={onOpenChange}
      value={value}
      onValueChange={setValue}
    >
      <Command.Input placeholder="What do you need?" />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        {Object.keys(data).map((heading) => (
          <Command.Group key={heading} heading={upperCaseFirstLetter(heading)}>
            {data[heading].map(({ icon, label }) => (
              <Command.Item key={`${heading}-${label}`}>{label}</Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}

export default Spotlight
