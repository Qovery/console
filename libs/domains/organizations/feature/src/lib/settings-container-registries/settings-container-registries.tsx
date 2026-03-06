import { useParams } from '@tanstack/react-router'
import { type ContainerRegistryResponse } from 'qovery-typescript-axios'
import { Suspense, useMemo } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import {
  BlockContent,
  Button,
  Icon,
  Indicator,
  Section,
  Skeleton,
  Tooltip,
  Truncate,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { dateMediumLocalFormat, dateUTCString, timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { containerRegistryKindToIcon } from '@qovery/shared/util-js'
import { ContainerRegistryCreateEditModal } from '../container-registry-create-edit-modal/container-registry-create-edit-modal'
import { ContainerRegistryServicesListModal } from '../container-registry-services-list-modal/container-registry-services-list-modal'
import { useContainerRegistries } from '../hooks/use-container-registries/use-container-registries'
import { useDeleteContainerRegistry } from '../hooks/use-delete-container-registry/use-delete-container-registry'

const RegistryRow = ({ registry }: { registry: ContainerRegistryResponse }) => {
  const { openModal, closeModal } = useModal()
  const { organizationId = '' } = useParams({ strict: false })
  const { openModalConfirmation } = useModalConfirmation()

  const { mutateAsync: deleteContainerRegistry } = useDeleteContainerRegistry()

  const onEdit = (registry: ContainerRegistryResponse) => {
    openModal({
      content: (
        <ContainerRegistryCreateEditModal
          organizationId={organizationId}
          onClose={closeModal}
          registry={registry}
          isEdit
        />
      ),
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  const onDelete = (registry: ContainerRegistryResponse) => {
    openModalConfirmation({
      title: 'Delete container registry',
      confirmationMethod: 'action',
      name: registry?.name,
      action: async () => {
        try {
          await deleteContainerRegistry({
            organizationId: organizationId,
            containerRegistryId: registry.id,
          })
        } catch (error) {
          console.error(error)
        }
      },
    })
  }

  const onOpenServicesAssociatedModal = (registry: ContainerRegistryResponse) => {
    openModal({
      content: (
        <ContainerRegistryServicesListModal
          organizationId={organizationId}
          containerRegistryId={registry.id}
          onClose={closeModal}
          associatedServicesCount={registry.associated_services_count ?? 0}
        />
      ),
    })
  }

  return (
    <li
      data-testid={`registries-list-${registry.id}`}
      key={registry.id}
      className="flex items-center justify-between border-b border-neutral px-5 py-4 last:border-0"
    >
      <div className="flex">
        <Icon name={registry.kind ? containerRegistryKindToIcon(registry.kind) : IconEnum.AWS} width="20" height="20" />
        <div className="ml-4">
          <h2 className="mb-1 flex text-xs font-medium text-neutral">
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
          <p className="text-xs text-neutral-subtle">
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
        {(registry?.associated_services_count || 0) > 0 && (
          <Indicator
            content={
              <span className="relative right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface-brand-solid text-3xs font-bold leading-[0] text-neutralInvert">
                {registry.associated_services_count}
              </span>
            }
          >
            <Button
              variant="outline"
              color="neutral"
              size="md"
              iconOnly
              className="relative"
              disabled={registry.associated_services_count === 0}
              onClick={() => onOpenServicesAssociatedModal(registry)}
            >
              <Icon iconName="layer-group" iconStyle="regular" />
            </Button>
          </Indicator>
        )}
        <Button size="md" variant="outline" color="neutral" iconOnly onClick={() => onEdit(registry)}>
          <Icon iconName="gear" iconStyle="regular" />
        </Button>
        <Button size="md" variant="outline" color="neutral" iconOnly onClick={() => onDelete(registry)}>
          <Icon iconName="trash-can" iconStyle="regular" />
        </Button>
      </div>
    </li>
  )
}

const ContainerRegistriesRowsSkeleton = ({ title }: { title: string }) => (
  <BlockContent title={title} classNameContent="p-0">
    {[0, 1, 2, 3].map((index) => (
      <div
        key={index}
        className="flex w-full items-center justify-between gap-3 border-b border-neutral px-5 py-4 last:border-0"
      >
        <div className="flex items-center gap-4">
          <Skeleton width={20} height={20} show={true} />
          <div className="space-y-2">
            <Skeleton width={220} height={12} show={true} />
            <Skeleton width={260} height={12} show={true} />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton width={32} height={32} show={true} />
          <Skeleton width={32} height={32} show={true} />
          <Skeleton width={32} height={32} show={true} />
        </div>
      </div>
    ))}
  </BlockContent>
)

const ContainerRegistriesSkeleton = () => (
  <div className="space-y-8">
    <ContainerRegistriesRowsSkeleton title="Container registries" />
    <ContainerRegistriesRowsSkeleton title="Unused container registries" />
  </div>
)

interface ContainerRegistriesListProps {
  organizationId: string
}

const ContainerRegistriesList = ({ organizationId }: ContainerRegistriesListProps) => {
  const { data: containerRegistries = [] } = useContainerRegistries({
    organizationId,
    suspense: true,
  })

  const usedRegistries = useMemo(() => {
    return containerRegistries
      ?.filter((registry) => (registry.associated_services_count || 0) > 0)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [containerRegistries])

  const unusedRegistries = useMemo(() => {
    return containerRegistries
      ?.filter((registry) => (registry.associated_services_count || 0) === 0)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [containerRegistries])

  const registriesCount = useMemo(() => {
    return containerRegistries.length
  }, [containerRegistries])

  return registriesCount > 0 ? (
    <>
      {usedRegistries && usedRegistries.length > 0 && (
        <BlockContent title="Container registries" classNameContent="p-0">
          {usedRegistries.map((registry) => (
            <RegistryRow key={registry.id} registry={registry} />
          ))}
        </BlockContent>
      )}
      {unusedRegistries && unusedRegistries.length > 0 && (
        <BlockContent title="Unused container registries" classNameContent="p-0">
          {unusedRegistries.map((registry) => (
            <RegistryRow key={registry.id} registry={registry} />
          ))}
        </BlockContent>
      )}
    </>
  ) : (
    <div className="my-4 px-5 text-center">
      <Icon iconName="wave-pulse" className="text-neutral-subtle" />
      <p className="mt-1 text-xs font-medium text-neutral-subtle">
        No container registry found. <br /> Please add one.
      </p>
    </div>
  )
}

export const PageOrganizationContainerRegistries = () => {
  const { organizationId = '' } = useParams({ strict: false })

  return (
    <div className="max-w-content-with-navigation-left space-y-8">
      <Suspense fallback={<ContainerRegistriesSkeleton />}>
        <ContainerRegistriesList organizationId={organizationId} />
      </Suspense>
    </div>
  )
}

export function SettingsContainerRegistries() {
  useDocumentTitle('Container registries - Organization settings')
  const { organizationId = '' } = useParams({ strict: false })
  const { openModal, closeModal } = useModal()

  const onAddRegistry = () => {
    openModal({
      content: <ContainerRegistryCreateEditModal organizationId={organizationId} onClose={closeModal} />,
      options: {
        fakeModal: true,
        width: 680,
      },
    })
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <div className="relative">
          <SettingsHeading
            title="Container registries"
            description="Define and manage the container registry to be used within your organization to deploy applications."
          />

          <Button className="absolute right-0 top-0 gap-2" size="md" onClick={() => onAddRegistry()}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add registry
          </Button>
        </div>

        <PageOrganizationContainerRegistries />
      </Section>
    </div>
  )
}
