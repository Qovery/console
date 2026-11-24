import { useQueries } from '@tanstack/react-query'
import { type CustomDomainRequest, type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useEditOrganizationCustomDomain } from '@qovery/domains/custom-domains/feature'
import { Button, CopyButton, Icon, InputText, InputToggle, Skeleton, Tooltip, useModal } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import { getDomainTargetKey, getDomainTargets } from '../utils/organization-domain-targets'

type DomainTarget = ReturnType<typeof getDomainTargets>[number]

const toMutationTarget = ({ service, custom_domain_id }: DomainTarget) => ({
  serviceId: service.id,
  serviceType: service.type,
  customDomainId: custom_domain_id,
})

export interface OrganizationDomainEditModalProps {
  domain: OrganizationCustomDomainResponse
  onClose: () => void
}

export function OrganizationDomainEditModal({ domain, onClose }: OrganizationDomainEditModalProps) {
  const { enableAlertClickOutside } = useModal()
  const targets = getDomainTargets(domain)
  // Routes of one service share its domain configuration, so removing a route removes that whole configuration.
  const [removedTargetKeys, setRemovedTargetKeys] = useState<string[]>([])
  const { control, formState, handleSubmit, setValue, watch } = useForm<CustomDomainRequest>({
    defaultValues: {
      domain: domain.domain,
      use_cdn: domain.use_cdn,
      generate_certificate: domain.generate_certificate,
    },
    mode: 'onChange',
  })
  const {
    mutateAsync: editDomain,
    isLoading: isSaving,
    variables,
  } = useEditOrganizationCustomDomain({
    environmentId: domain.environment_id,
  })
  const serviceDomains = useQueries({
    queries: targets.map(({ service }) =>
      queries.services.customDomains({ serviceId: service.id, serviceType: service.type })
    ),
  })
  const validationDomain = targets
    .map(
      ({ custom_domain_id }, index) =>
        serviceDomains[index]?.data?.find(({ id }) => id === custom_domain_id)?.validation_domain
    )
    .find(Boolean)
  const isLoadingValidationDomain = serviceDomains.some(({ isLoading }) => isLoading)
  const isDirty = formState.isDirty || removedTargetKeys.length > 0

  useEffect(() => {
    enableAlertClickOutside(isDirty)
  }, [isDirty, enableAlertClickOutside])

  const watchDomain = watch('domain')
  // Record names only depend on the domain, so the block keeps its final layout while the target loads.
  const cnameRecords = [watchDomain, ...(watchDomain.includes('*') ? [] : [`*.${watchDomain}`])].map(
    (name) => `${name} CNAME`
  )

  const save = (redeploy: boolean) =>
    handleSubmit(async (payload) => {
      try {
        await editDomain({
          payload,
          redeploy,
          targets: targets
            .filter((target) => !removedTargetKeys.includes(getDomainTargetKey(target)))
            .map(toMutationTarget),
          removedTargets: targets
            .filter((target) => removedTargetKeys.includes(getDomainTargetKey(target)))
            .map(toMutationTarget),
        })
        onClose()
      } catch {
        // The mutation notifies the error; keep the modal open so the user can retry.
      }
    })()

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="h4 text-neutral">Edit custom domain</h2>
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-neutral-subtle">Domain configuration</h3>
        <Controller
          name="domain"
          control={control}
          rules={{ required: 'Please enter a domain' }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              label="Domain"
              error={error?.message}
            />
          )}
        />
        {isLoadingValidationDomain || validationDomain ? (
          <div className="overflow-hidden rounded-lg border border-neutral">
            <div className="border-b border-neutral bg-surface-neutral-subtle px-3 py-2 text-xs font-medium text-neutral">
              CNAME configuration
            </div>
            <div className="flex items-start justify-between gap-3 py-2 pl-3 pr-2">
              <dl className="flex min-w-0 flex-col gap-2 font-code text-xs leading-5">
                {cnameRecords.map((name) => (
                  <div key={name} className="min-w-0">
                    <dt className="truncate text-info">{name}</dt>
                    <dd className="h-5 truncate text-neutral-subtle">
                      {validationDomain ?? (
                        <span className="flex h-full items-center">
                          <Skeleton width={240} height={12} />
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              {validationDomain ? (
                <CopyButton
                  iconOnly
                  size="xs"
                  content={cnameRecords.map((name) => `${name} ${validationDomain}`).join('\n')}
                />
              ) : (
                <Skeleton width={24} height={24} className="shrink-0" />
              )}
            </div>
          </div>
        ) : null}
        <Controller
          name="use_cdn"
          control={control}
          render={({ field }) => (
            <InputToggle
              className="py-1"
              small
              title="Domain behind a CDN or DNS proxy"
              value={field.value}
              onChange={(value) => {
                if (value) setValue('generate_certificate', false, { shouldDirty: true })
                field.onChange(value)
              }}
            />
          )}
        />
        <Controller
          name="generate_certificate"
          control={control}
          render={({ field }) => (
            <InputToggle
              className="py-1"
              small
              title="Generate certificate"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-neutral-subtle">Routes</h3>
        <ul className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral-subtle">
          {domain.routes.map((route) => {
            const target = targets.find(
              ({ service, custom_domain_id }) =>
                service.id === route.service.id && custom_domain_id === route.custom_domain_id
            )
            const targetKey = target ? getDomainTargetKey(target) : undefined
            const removed = targetKey ? removedTargetKeys.includes(targetKey) : false
            return (
              <li
                key={route.id}
                className="flex items-center justify-between gap-3 border-b border-neutral px-4 py-3 text-ssm last:border-b-0"
              >
                <div className={removed ? 'min-w-0 opacity-50' : 'min-w-0'}>
                  <p
                    className={
                      removed ? 'truncate font-medium text-neutral line-through' : 'truncate font-medium text-neutral'
                    }
                  >
                    {route.path}
                  </p>
                  <p className="mt-1 flex gap-2 text-neutral-subtle">
                    <span className="truncate">
                      Service: {domain.project.name}/{domain.environment.name}/{route.service.name}
                    </span>
                    <span className="shrink-0">Port: {route.port?.internal_port ?? 'none'}</span>
                  </p>
                </div>
                {targetKey ? (
                  <Tooltip content={removed ? 'Keep route' : 'Remove route'}>
                    <Button
                      type="button"
                      aria-label={`${removed ? 'Keep' : 'Remove'} route ${route.path} of ${route.service.name}`}
                      iconOnly
                      variant="outline"
                      color="neutral"
                      size="xs"
                      disabled={isSaving}
                      onClick={() =>
                        setRemovedTargetKeys((keys) =>
                          removed ? keys.filter((key) => key !== targetKey) : [...keys, targetKey]
                        )
                      }
                    >
                      <Icon iconName={removed ? 'arrow-rotate-left' : 'trash'} iconStyle="regular" />
                    </Button>
                  </Tooltip>
                ) : null}
              </li>
            )
          })}
        </ul>
        {targets.length > 0 && removedTargetKeys.length === targets.length ? (
          <p className="text-xs text-warning">Saving removes this domain from every service.</p>
        ) : null}
      </section>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="md"
          disabled={!isDirty || !formState.isValid || isSaving}
          loading={isSaving && variables?.redeploy === false}
          onClick={() => save(false)}
        >
          Save
        </Button>
        <Button
          type="button"
          size="md"
          disabled={!formState.isValid || isSaving}
          loading={isSaving && variables?.redeploy === true}
          onClick={() => save(true)}
        >
          Save and redeploy
        </Button>
      </div>
    </div>
  )
}

export default OrganizationDomainEditModal
