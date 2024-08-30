import { type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { IconEnum } from '@qovery/shared/enums'
import {
  BlockContent,
  Button,
  Heading,
  Icon,
  Indicator,
  LoaderSpinner,
  Section,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'

export interface PageOrganizationContainerRegistriesProps {
  onAddRegistry: () => void
  onOpenServicesAssociatedModal: (registry: ContainerRegistryResponse) => void
  onEdit: (registry: ContainerRegistryResponse) => void
  onDelete: (registry: ContainerRegistryResponse) => void
  containerRegistries?: ContainerRegistryResponse[]
  isFetched?: boolean
}

export function PageOrganizationContainerRegistries(props: PageOrganizationContainerRegistriesProps) {
  const { containerRegistries, isFetched, onAddRegistry, onEdit, onDelete, onOpenServicesAssociatedModal } = props

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <div className="mb-8 flex justify-between gap-2">
          <div className="space-y-3">
            <Heading className="text-neutral-400">Container registries</Heading>
            <p className="text-xs text-neutral-400">
              Define and manage the container registry to be used within your organization to deploy applications.
            </p>
            <NeedHelp />
          </div>
          <Button className="gap-2" size="md" onClick={() => onAddRegistry()}>
            Add registry
            <Icon iconName="circle-plus" iconStyle="regular" />
          </Button>
        </div>
        <BlockContent title="Container registries" classNameContent="p-0">
          {!isFetched ? (
            <div data-testid="registries-loader" className="flex justify-center p-5">
              <LoaderSpinner className="w-6" />
            </div>
          ) : containerRegistries && containerRegistries.length > 0 ? (
            <ul>
              {containerRegistries
                ?.filter((registry) => !registry.cluster)
                .map((registry: ContainerRegistryResponse) => (
                  <li
                    data-testid={`registries-list-${registry.id}`}
                    key={registry.id}
                    className="flex items-center justify-between border-b border-neutral-250 px-5 py-4 last:border-0"
                  >
                    <div className="flex">
                      <Icon
                        name={registry.kind ? containerRegistryKindToIcon(registry.kind) : IconEnum.AWS}
                        width="20"
                        height="20"
                      />
                      <div className="ml-4">
                        <h2 className="mb-1 flex text-xs font-medium text-neutral-400">
                          <Truncate
                            truncateLimit={60}
                            text={`${registry.name}${registry.config?.access_key_id ? ` (${registry.config?.access_key_id})` : registry.config?.scaleway_access_key ? ` (${registry.config?.scaleway_access_key})` : registry.config?.username ? ` (${registry.config?.username})` : ''}`}
                          />
                          {registry.description && (
                            <Tooltip content={registry.description}>
                              <div className="ml-1 cursor-pointer">
                                <Icon iconName="circle-info" iconStyle="regular" />
                              </div>
                            </Tooltip>
                          )}
                        </h2>
                        <p className="text-xs text-neutral-350">
                          {registry.kind}{' '}
                          {registry.updated_at && (
                            <span className="ml-3 inline-block" title={dateUTCString(registry.updated_at)}>
                              Last updated {timeAgo(new Date(registry.updated_at))}
                            </span>
                          )}{' '}
                          {registry.created_at && (
                            <span className="ml-3 inline-block" title={dateUTCString(registry.created_at)}>
                              Created since {dateMediumLocalFormat(registry.created_at)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Indicator
                        content={
                          <span className="relative right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 text-3xs font-bold leading-[0] text-white">
                            {registry.associated_services_count}
                          </span>
                        }
                      >
                        <Button
                          variant="surface"
                          color="neutral"
                          size="md"
                          disabled={registry.associated_services_count === 0}
                          onClick={() => onOpenServicesAssociatedModal(registry)}
                        >
                          <Icon iconName="layer-group" iconStyle="regular" />
                        </Button>
                      </Indicator>
                      <Button size="md" variant="surface" color="neutral" onClick={() => onEdit(registry)}>
                        <Icon iconName="gear" iconStyle="regular" />
                      </Button>
                      <Button size="md" variant="surface" color="neutral" onClick={() => onDelete(registry)}>
                        <Icon iconName="trash-can" iconStyle="regular" />
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="my-4 px-5 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-350" />
              <p className="mt-1 text-xs font-medium text-neutral-350">
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
