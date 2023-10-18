import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { APPLICATION_URL, DATABASE_URL, ENVIRONMENTS_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Command, type CommandDialogProps, LoaderSpinner } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import useSuggestions from '../hooks/use-suggestions/use-suggestions'

export interface SpotlightProps extends Pick<CommandDialogProps, 'open' | 'onOpenChange'> {}

export function Spotlight({ open, onOpenChange }: SpotlightProps) {
  const [value, setValue] = useState('')
  const { organizationId } = useParams()
  const navigate = useNavigate()

  const { data = [], isFetched } = useSuggestions({
    organizationId,
    search: value,
    enabled: Boolean(open) && Boolean(value),
  })

  const closeSpotlight = (url: string) => {
    navigate(url)
    onOpenChange?.(false)
  }

  return (
    <Command.Dialog label="Console Spotlight" open={open} onOpenChange={onOpenChange}>
      <Command.Input value={value} onValueChange={setValue} placeholder="What do you need?" />
      {value.length > 0 && (
        <Command.List>
          {!isFetched && <LoaderSpinner className="w-4 mx-auto pb-2" />}
          {isFetched && (
            <>
              <Command.Empty>No results found</Command.Empty>
              <Command.Group heading="Projects">
                {data
                  .filter(({ suggestionType }) => suggestionType === 'PROJECT')
                  .map(({ id, name }) => (
                    <Command.Item key={id} onSelect={() => closeSpotlight(ENVIRONMENTS_URL(organizationId, id))}>
                      {name}
                    </Command.Item>
                  ))}
              </Command.Group>
              <Command.Group heading="Environments">
                {data
                  .filter(({ suggestionType }) => suggestionType === 'ENVIRONMENT')
                  .map(({ id, name, projectId }) => (
                    <Command.Item key={id} onSelect={() => closeSpotlight(SERVICES_URL(organizationId, projectId, id))}>
                      {name}
                    </Command.Item>
                  ))}
              </Command.Group>
              <Command.Group heading="Services">
                {data
                  .filter((service) => service.serviceType)
                  .map(({ id, name, environmentId, projectId, serviceType, projectName, environmentName }) => (
                    <Command.Item
                      key={id}
                      onSelect={() =>
                        closeSpotlight(
                          serviceType === 'DATABASE'
                            ? DATABASE_URL(organizationId, projectId, environmentId, id)
                            : APPLICATION_URL(organizationId, projectId, environmentId, id)
                        )
                      }
                    >
                      {[projectName, environmentName, `${serviceType}:${name}`].map(upperCaseFirstLetter).join(' > ')}
                    </Command.Item>
                  ))}
              </Command.Group>
            </>
          )}
        </Command.List>
      )}
    </Command.Dialog>
  )
}

export default Spotlight
