import { useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  Badge,
  BlockContent,
  Button,
  Callout,
  Heading,
  Icon,
  InputSearch,
  InputText,
  ModalCrud,
  Section,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'
import { RESOURCES, type Role, TAG_KEYS, type TagKey, effectiveTags, resourcePath } from '../rbac-v2-mock-data'
import { useRbacPrototype } from '../rbac-v2-prototype-context'
import { type TargetedPermission } from '../rbac-v2-targeted-data'
import { RESOURCE_ICONS } from '../rbac-v2-ui'
import { PermissionSummary } from './roles-targeted-tab'

// RBAC v2 prototype, in Next: tags are a Qovery concept, separate from the Kubernetes labels and annotations
// (which keep their own page). They are set on clusters, projects, environments and services, and scope roles.

const usesTag = (permission: TargetedPermission, key: string) =>
  permission.selection.conditions.some((condition) => condition.key === key)

// Resources carrying the tag, directly or inherited from their parent (a service inherits its environment's tags)
const taggedResources = (key: string) => RESOURCES.filter((resource) => key in effectiveTags(resource))

// The modals render outside the prototype provider: they get their data as props
function TagRolesModal({
  tagKey,
  roles,
  permissionsByRole,
}: {
  tagKey: string
  roles: Role[]
  permissionsByRole: Record<string, TargetedPermission[]>
}) {
  return (
    <Section className="p-6">
      <Heading className="mb-2 text-2xl text-neutral">
        Roles using <span className="font-code">{tagKey}</span> ({roles.length})
      </Heading>
      <p className="mb-5 text-sm text-neutral-subtle">
        Setting or editing this tag on a resource needs the Edit tags capability, so nobody can give themselves access
        by tagging a resource.
      </p>
      <ul className="flex flex-col gap-2">
        {roles.map((role) => (
          <li key={role.id} className="rounded border border-neutral bg-surface-neutral-subtle px-4 py-3">
            <p className="mb-2 text-sm font-medium text-neutral">{role.name}</p>
            <ul className="flex flex-col gap-1.5">
              {(permissionsByRole[role.id] ?? [])
                .filter((permission) => usesTag(permission, tagKey))
                .map((permission) => (
                  <PermissionSummary key={permission.id} permission={permission} />
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </Section>
  )
}

function TagItemsModal({ tag }: { tag: TagKey }) {
  const [searchValue, setSearchValue] = useState('')
  const resources = taggedResources(tag.key).filter((resource) =>
    resourcePath(resource).toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <Section className="p-6">
      <Heading className="mb-6 text-2xl text-neutral">
        Resources tagged <span className="font-code">{tag.key}</span> ({taggedResources(tag.key).length})
      </Heading>
      <InputSearch
        className="mb-3"
        placeholder="Search by cluster, project, environment or service name"
        onChange={(value) => setSearchValue(value)}
      />
      <div className="flex flex-col gap-3">
        {tag.values.map((value) => {
          const resourcesWithValue = resources.filter((resource) => effectiveTags(resource)[tag.key] === value)
          if (resourcesWithValue.length === 0) return null
          return (
            <div key={value}>
              <Heading level={3} className="mb-2 font-code text-neutral">
                {tag.key}={value}
              </Heading>
              <ul className="rounded border border-neutral bg-surface-neutral-subtle px-4 py-2">
                {resourcesWithValue.map((resource) => (
                  <li key={resource.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="flex items-center text-brand">
                      <Icon iconName={RESOURCE_ICONS[resource.kind]} iconStyle="regular" className="mr-2" />
                      {resourcePath(resource)}
                    </span>
                    {!(tag.key in resource.tags) && <span className="text-xs text-neutral-subtle">inherited</span>}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {resources.length === 0 && (
          <div className="px-5 py-4 text-center">
            <Icon iconName="wave-pulse" className="text-neutral-subtle" />
            <p className="mt-1 text-xs font-medium text-neutral-subtle">No value found</p>
          </div>
        )}
      </div>
    </Section>
  )
}

function TagEditModal({
  tag,
  usedByRoles,
  onClose,
  onSubmit,
}: {
  tag?: TagKey
  usedByRoles: boolean
  onClose: () => void
  onSubmit: (tag: TagKey) => void
}) {
  const methods = useForm({
    mode: 'onChange',
    defaultValues: { key: tag?.key ?? '', values: tag?.values.join(', ') ?? '' },
  })

  const submit = methods.handleSubmit((data) => {
    onSubmit({
      ...tag,
      key: data.key,
      values: data.values
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    })
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={tag ? `Edit tag ${tag.key}` : 'Create tag'}
        description="Tags are set on clusters, projects, environments and services. Services inherit their environment's tags."
        onClose={onClose}
        onSubmit={submit}
        isEdit={Boolean(tag)}
      >
        <div className="flex flex-col gap-4">
          {usedByRoles && (
            <Callout.Root color="yellow">
              <Callout.Icon>
                <Icon iconName="lock" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextDescription>
                  Used by at least one role. Setting or editing this tag on a resource needs the Edit tags capability,
                  so nobody can give themselves access by tagging a resource.
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          )}
          <Controller
            name="key"
            control={methods.control}
            rules={{ required: 'Please enter a key.' }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                label="Key"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                disabled={tag?.builtIn}
              />
            )}
          />
          <Controller
            name="values"
            control={methods.control}
            rules={{ required: 'Please enter at least one value.' }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                label="Allowed values (comma separated)"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
              />
            )}
          />
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export function SettingsTags() {
  const { roles, permissionsByRole } = useRbacPrototype()
  const { openModal, closeModal } = useModal()
  const [tags, setTags] = useState(TAG_KEYS)
  const rolesUsingTag = (key: string) =>
    roles.filter((role) => (permissionsByRole[role.id] ?? []).some((permission) => usesTag(permission, key)))

  const openEdit = (tag?: TagKey) =>
    openModal({
      content: (
        <TagEditModal
          tag={tag}
          usedByRoles={Boolean(tag && rolesUsingTag(tag.key).length > 0)}
          onClose={closeModal}
          onSubmit={(next) =>
            setTags((current) => (tag ? current.map((t) => (t.key === tag.key ? next : t)) : [...current, next]))
          }
        />
      ),
    })

  return (
    <div className="w-full">
      <Section className="px-8 pb-16 pt-6">
        <div className="relative">
          <SettingsHeading
            title="Tags"
            description="Define the tags set on your clusters, projects, environments and services, and used to scope roles."
          />
          <Button size="md" className="absolute right-0 top-0 shrink-0" onClick={() => openEdit()}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add tag
          </Button>
        </div>
        <div className="flex max-w-content-with-navigation-left flex-col gap-6">
          <Callout.Root color="sky">
            <Callout.Icon>
              <Icon iconName="circle-info" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Tags organize your Qovery resources</Callout.TextHeading>
              <Callout.TextDescription>
                Unlike labels and annotations, tags are never applied to Kubernetes workloads: editing a service's
                configuration never changes who can access it. Services inherit their environment's tags.
              </Callout.TextDescription>
            </Callout.Text>
          </Callout.Root>
          <BlockContent title="Tags" classNameContent="p-0">
            <ul>
              {tags.map((tag) => {
                const count = taggedResources(tag.key).length
                const usingRoles = rolesUsingTag(tag.key)
                return (
                  <li
                    key={tag.key}
                    className="flex items-center justify-between border-b border-neutral p-4 last:border-0"
                  >
                    <div className="flex flex-col gap-1.5">
                      <h2 className="flex items-center gap-2 text-xs font-medium text-neutral">
                        <span className="font-code">{tag.key}</span>
                        {tag.builtIn && (
                          <Badge size="sm" variant="surface" color="neutral">
                            Default
                          </Badge>
                        )}
                      </h2>
                      <p className="text-xs text-neutral-subtle">
                        Values: <span className="font-code text-neutral">{tag.values.join(', ')}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Tooltip
                        content={
                          usingRoles.length > 0
                            ? `Used by ${usingRoles.length} ${pluralize(usingRoles.length, 'role')}: setting this tag needs the Edit tags capability`
                            : 'Used by no role'
                        }
                      >
                        <Button
                          variant="outline"
                          color="neutral"
                          size="md"
                          iconOnly
                          className="relative"
                          aria-label={`Show roles using ${tag.key}`}
                          disabled={usingRoles.length === 0}
                          onClick={() =>
                            openModal({
                              content: (
                                <TagRolesModal
                                  tagKey={tag.key}
                                  roles={usingRoles}
                                  permissionsByRole={permissionsByRole}
                                />
                              ),
                            })
                          }
                        >
                          <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface-brand-solid text-3xs font-bold leading-[0] text-neutralInvert">
                            {usingRoles.length}
                          </span>
                          <Icon iconName="shield-halved" iconStyle="regular" />
                        </Button>
                      </Tooltip>
                      <Tooltip content={`${count} tagged ${pluralize(count, 'resource')}`}>
                        <Button
                          variant="outline"
                          color="neutral"
                          size="md"
                          iconOnly
                          className="relative"
                          aria-label={`Show resources tagged ${tag.key}`}
                          disabled={count === 0}
                          onClick={() => openModal({ content: <TagItemsModal tag={tag} /> })}
                        >
                          <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface-brand-solid text-3xs font-bold leading-[0] text-neutralInvert">
                            {count}
                          </span>
                          <Icon iconName="layer-group" iconStyle="regular" />
                        </Button>
                      </Tooltip>
                      <Button
                        size="md"
                        variant="outline"
                        color="neutral"
                        iconOnly
                        aria-label={`Edit ${tag.key}`}
                        onClick={() => openEdit(tag)}
                      >
                        <Icon iconName="gear" iconStyle="regular" />
                      </Button>
                      <Tooltip content="Tag still in use" disabled={count === 0 && usingRoles.length === 0}>
                        <Button
                          size="md"
                          variant="outline"
                          color="neutral"
                          iconOnly
                          aria-label={`Delete ${tag.key}`}
                          disabled={count !== 0 || usingRoles.length !== 0 || tag.builtIn}
                          onClick={() => setTags((current) => current.filter((t) => t.key !== tag.key))}
                        >
                          <Icon iconName="trash-can" iconStyle="regular" />
                        </Button>
                      </Tooltip>
                    </div>
                  </li>
                )
              })}
            </ul>
          </BlockContent>
        </div>
      </Section>
    </div>
  )
}
