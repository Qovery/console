import { type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { BlockContent, Button, Heading, Icon, LoaderSpinner, Section, Tooltip, Truncate } from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'

export interface PageOrganizationContainerRegistriesProps {
  onAddRegistry: () => void
  onEdit: (registry: ContainerRegistryResponse) => void
  onDelete: (registry: ContainerRegistryResponse) => void
  containerRegistries?: ContainerRegistryResponse[]
  isFetched?: boolean
}

export function PageOrganizationContainerRegistries(props: PageOrganizationContainerRegistriesProps) {
  const { containerRegistries, isFetched, onAddRegistry, onEdit, onDelete } = props

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <Heading className="h5 text-neutral-400 mb-2">Container registries</Heading>
            <p className="text-neutral-400 text-xs">
              Define and manage the container registry to be used within your organization to deploy applications.
            </p>
          </div>
          <Button className="gap-2" size="lg" onClick={() => onAddRegistry()}>
            Add registry
            <Icon iconName="circle-plus" />
          </Button>
        </div>
        <BlockContent title="Container registries" classNameContent="p-0">
          {!isFetched ? (
            <div data-testid="registries-loader" className="flex justify-center p-5">
              <LoaderSpinner className="w-6" />
            </div>
          ) : containerRegistries && containerRegistries.length > 0 ? (
            <ul>
              {containerRegistries?.map((registry: ContainerRegistryResponse) => (
                <li
                  data-testid={`registries-list-${registry.id}`}
                  key={registry.id}
                  className="flex justify-between items-center px-5 py-4 border-b border-neutral-250 last:border-0"
                >
                  <div className="flex">
                    <Icon
                      name={registry.kind ? containerRegistryKindToIcon(registry.kind) : IconEnum.AWS}
                      width="20"
                      height="20"
                    />
                    <div className="ml-4">
                      <h2 className="flex text-xs text-neutral-400 font-medium mb-1">
                        <Truncate truncateLimit={60} text={registry.name || ''} />
                        {registry.description && (
                          <Tooltip content={registry.description}>
                            <div className="ml-1 cursor-pointer">
                              <Icon iconName="circle-info" className="text-neutral-350" />
                            </div>
                          </Tooltip>
                        )}
                      </h2>
                      <p className="text-xs text-neutral-350">
                        {registry.kind}{' '}
                        {registry.updated_at && (
                          <span className="inline-block ml-3" title={dateUTCString(registry.updated_at)}>
                            Last updated {timeAgo(new Date(registry.updated_at))}
                          </span>
                        )}{' '}
                        {registry.created_at && (
                          <span className="inline-block ml-3" title={dateUTCString(registry.created_at)}>
                            Created since {dateMediumLocalFormat(registry.created_at)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="md" variant="outline" color="neutral" onClick={() => onEdit(registry)}>
                      <Icon iconName="gear" />
                    </Button>
                    <Button size="md" variant="outline" color="neutral" onClick={() => onDelete(registry)}>
                      <Icon iconName="trash" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center my-4 px-5">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="text-neutral-350 font-medium text-xs mt-1">
                No container registry found. <br /> Please add one.
              </p>
            </div>
          )}
        </BlockContent>
      </Section>
    </div>
  )
}

export default PageOrganizationContainerRegistries
