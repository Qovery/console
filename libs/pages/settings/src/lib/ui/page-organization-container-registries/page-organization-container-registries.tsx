import { ContainerRegistryKindEnum, ContainerRegistryResponse } from 'qovery-typescript-axios'
import { IconEnum } from '@qovery/shared/enums'
import { LoadingStatus } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ButtonIcon,
  ButtonIconStyle,
  ButtonSize,
  EmptyState,
  HelpSection,
  Icon,
  IconAwesomeEnum,
  LoaderSpinner,
  Tooltip,
} from '@qovery/shared/ui'
import { dateYearMonthDayHourMinuteSecond, timeAgo } from '@qovery/shared/utils'

export interface PageOrganizationContainerRegistriesProps {
  onAddRegistry: () => void
  onEdit: (registry: ContainerRegistryResponse) => void
  onDelete: (registry: ContainerRegistryResponse) => void
  containerRegistries?: ContainerRegistryResponse[]
  loading?: LoadingStatus
}

export const logoByRegistryKind = (kind?: ContainerRegistryKindEnum) => {
  switch (kind) {
    case ContainerRegistryKindEnum.DOCR:
      return IconEnum.DO
    case ContainerRegistryKindEnum.DOCKER_HUB:
      return IconEnum.DOCKER
    case ContainerRegistryKindEnum.SCALEWAY_CR:
      return IconEnum.SCW
    default:
      return IconEnum.AWS
  }
}

export function PageOrganizationContainerRegistries(props: PageOrganizationContainerRegistriesProps) {
  const { containerRegistries, loading, onAddRegistry, onEdit, onDelete } = props

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="h5 text-text-700 mb-2">Container registries</h1>
            <p className="text-text-500 text-xs">
              Define and manage the container registry to be used within your organization.
            </p>
          </div>
          <Button onClick={() => onAddRegistry()} iconRight={IconAwesomeEnum.CIRCLE_PLUS}>
            Add registry
          </Button>
        </div>
        {(loading === 'not loaded' || loading === 'loading') && containerRegistries?.length === 0 ? (
          <div data-testid="registries-loader" className="flex justify-center">
            <LoaderSpinner className="w-6" />
          </div>
        ) : containerRegistries && containerRegistries.length > 0 ? (
          <BlockContent title="Container registries" classNameContent="">
            {containerRegistries?.map((registry: ContainerRegistryResponse) => (
              <div
                data-testid={`registries-list-${registry.id}`}
                key={registry.id}
                className="flex justify-between items-center px-5 py-4 border-b border-element-light-lighter-500 last:border-0"
              >
                <div className="flex">
                  <Icon name={logoByRegistryKind(registry.kind)} width="20" height="20" />
                  <div className="ml-4">
                    <h2 className="flex text-xs text-text-600 font-medium mb-1">
                      {registry.name}
                      {registry.description && (
                        <Tooltip content={registry.description}>
                          <div className="ml-1 cursor-pointer">
                            <Icon name={IconAwesomeEnum.CIRCLE_INFO} className="text-text-400" />
                          </div>
                        </Tooltip>
                      )}
                    </h2>
                    <p className="text-xs text-text-400">
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
                    size={ButtonSize.TINY}
                    onClick={() => onEdit(registry)}
                    className="text-text-400 hover:text-text-500 bg-transparent !w-9 !h-8 mr-2"
                    iconClassName="!text-xs"
                  />
                  <ButtonIcon
                    icon={IconAwesomeEnum.TRASH}
                    style={ButtonIconStyle.STROKED}
                    size={ButtonSize.TINY}
                    onClick={() => onDelete(registry)}
                    className="text-text-400 hover:text-text-500 bg-transparent !w-9 !h-8"
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
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#container-registry-management',
            linkLabel: 'How to configure my container registry',
            external: true,
          },
        ]}
      />
    </div>
  )
}

export default PageOrganizationContainerRegistries
