import { type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { type LoadingStatus } from '@qovery/shared/interfaces'
import {
  BlockContent,
  ButtonIcon,
  ButtonIconStyle,
  ButtonLegacy,
  ButtonLegacySize,
  EmptyState,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Tooltip,
  Truncate,
} from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, timeAgo } from '@qovery/shared/util-dates'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'

export interface PageOrganizationContainerRegistriesProps {
  onAddRegistry: () => void
  onEdit: (registry: ContainerRegistryResponse) => void
  onDelete: (registry: ContainerRegistryResponse) => void
  containerRegistries?: ContainerRegistryResponse[]
  loading?: LoadingStatus
}

export function PageOrganizationContainerRegistries(props: PageOrganizationContainerRegistriesProps) {
  const { containerRegistries, loading, onAddRegistry, onEdit, onDelete } = props

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-neutral-400 mb-2">Container registries</h1>
            <p className="text-neutral-400 text-xs">
              Define and manage the container registry to be used within your organization to deploy applications.
            </p>
          </div>
          <ButtonLegacy onClick={() => onAddRegistry()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add registry
          </ButtonLegacy>
        </div>
        {(loading === 'not loaded' || loading === 'loading') && containerRegistries?.length === 0 ? (
          <div data-testid="registries-loader" className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : containerRegistries && containerRegistries.length > 0 ? (
          <BlockContent title="Container registries" classNameContent="p-0">
            {containerRegistries?.map((registry: ContainerRegistryResponse) => (
              <div
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
                            <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-neutral-350" />
                          </div>
                        </Tooltip>
                      )}
                    </h2>
                    <p className="text-xs text-neutral-350">
                      {registry.kind}{' '}
                      <span className="inline-block ml-3">
                        Last updated {timeAgo(new Date(registry.updated_at || ''))}
                      </span>{' '}
                      <span className="inline-block ml-3">
                        Created since {dateYearMonthDayHourMinuteSecond(new Date(registry.created_at || ''), false)}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <ButtonIcon
                    icon={IconAwesomeEnum.WHEEL}
                    style={ButtonIconStyle.STROKED}
                    size={ButtonLegacySize.TINY}
                    onClick={() => onEdit(registry)}
                    className="text-neutral-350 hover:text-neutral-400 bg-transparent !w-9 !h-8 mr-2"
                    iconClassName="!text-xs"
                  />
                  <ButtonIcon
                    icon={IconAwesomeEnum.TRASH}
                    style={ButtonIconStyle.STROKED}
                    size={ButtonLegacySize.TINY}
                    onClick={() => onDelete(registry)}
                    className="text-neutral-350 hover:text-neutral-400 bg-transparent !w-9 !h-8"
                    iconClassName="!text-xs"
                  />
                </div>
              </div>
            ))}
          </BlockContent>
        ) : (
          loading === 'loaded' &&
          containerRegistries?.length === 0 && (
            <EmptyState
              dataTestId="empty-state"
              title="No container registry"
              description="Define a container registry for your organization"
            />
          )
        )}
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={[
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/container-registry',
            linkLabel: 'How to configure my container registry',
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationContainerRegistries
