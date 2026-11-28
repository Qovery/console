import { useQueries } from '@tanstack/react-query'
import {
  type CustomDomainErrorResponse,
  type CustomDomainRequest,
  type OrganizationCustomDomainResponse,
} from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useEditOrganizationCustomDomain } from '@qovery/domains/custom-domains/feature'
import { Button, Icon, InputText, InputToggle, Tooltip, useModal } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import { getCustomDomainProblem } from '../utils/get-custom-domain-problem'
import { getDomainTargets } from '../utils/organization-domain-targets'
import { validateCustomDomain } from '../utils/validate-custom-domain'
import { OrganizationDomainCnameRecords } from './organization-domain-cname-records'
import { OrganizationDomainRouteItem } from './organization-domain-route-item'

export interface OrganizationDomainEditModalProps {
  domain: OrganizationCustomDomainResponse
  onClose: () => void
}

export function OrganizationDomainEditModal({ domain, onClose }: OrganizationDomainEditModalProps) {
  const { enableAlertClickOutside } = useModal()
  const targets = getDomainTargets(domain)
  const services = [...new Map(targets.map(({ service }) => [service.id, service])).values()]
  // The API edits a domain per service, so removing a route removes every route of its service.
  const [removedServiceIds, setRemovedServiceIds] = useState<string[]>([])
  const [conflicts, setConflicts] = useState<CustomDomainErrorResponse[]>([])
  const [saveError, setSaveError] = useState<string>()
  const { control, formState, handleSubmit, setValue, watch } = useForm<CustomDomainRequest>({
    defaultValues: {
      domain: domain.domain,
      use_cdn: domain.use_cdn,
      generate_certificate: domain.generate_certificate,
    },
    mode: 'onChange',
  })
  const { mutateAsync: editDomain, isLoading: isSaving, variables } = useEditOrganizationCustomDomain()
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
  const isDirty = formState.isDirty || removedServiceIds.length > 0

  useEffect(() => {
    enableAlertClickOutside(isDirty)
  }, [isDirty, enableAlertClickOutside])

  const watchDomain = watch('domain')

  const save = (redeploy: boolean) =>
    handleSubmit(async (payload) => {
      setConflicts([])
      setSaveError(undefined)
      try {
        await editDomain({
          environmentId: domain.environment_id,
          domainName: domain.domain,
          payload: {
            ...payload,
            services: services
              .filter(({ id }) => !removedServiceIds.includes(id))
              .map(({ id, type }) => ({ id, type })),
          },
          redeploy,
        })
        onClose()
      } catch (error) {
        // Nothing was changed: show why and keep the modal open.
        const problem = getCustomDomainProblem(error)
        if (problem?.errors?.length) setConflicts(problem.errors)
        else
          setSaveError(
            problem?.detail || (error as { message?: string }).message || 'Unable to save the domain. Try again.'
          )
      }
    })()

  const unmatchedConflicts = conflicts.filter(({ service_id }) => !services.some(({ id }) => id === service_id))

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="h4 text-neutral">Edit custom domain</h2>
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-neutral-subtle">Domain configuration</h3>
        <Controller
          name="domain"
          control={control}
          rules={{ required: 'Please enter a domain', validate: validateCustomDomain }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              value={field.value}
              onChange={(event) => {
                setConflicts([])
                field.onChange(event)
              }}
              label="Domain"
              error={error?.message}
            />
          )}
        />
        {isLoadingValidationDomain || validationDomain ? (
          <OrganizationDomainCnameRecords
            domain={watchDomain}
            target={validationDomain}
            loading={isLoadingValidationDomain}
          />
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
            const removable = services.some(({ id }) => id === route.service.id)
            const removed = removedServiceIds.includes(route.service.id)
            return (
              <OrganizationDomainRouteItem
                key={route.id}
                path={route.path}
                service={`${domain.project.name}/${domain.environment.name}/${route.service.name}`}
                port={route.port?.internal_port ?? null}
                removed={removed}
                error={conflicts
                  .filter(({ service_id }) => service_id === route.service.id)
                  .map(({ message }) => message)
                  .join(' ')}
                actions={
                  removable ? (
                    <Tooltip content={removed ? 'Keep route' : 'Remove route'}>
                      <Button
                        type="button"
                        aria-label={`${removed ? 'Keep' : 'Remove'} route ${route.path} of ${route.service.name}`}
                        iconOnly
                        variant="outline"
                        color="neutral"
                        size="xs"
                        disabled={isSaving}
                        onClick={() => {
                          setConflicts([])
                          setRemovedServiceIds((ids) =>
                            removed ? ids.filter((id) => id !== route.service.id) : [...ids, route.service.id]
                          )
                        }}
                      >
                        <Icon iconName={removed ? 'arrow-rotate-left' : 'trash-can'} iconStyle="regular" />
                      </Button>
                    </Tooltip>
                  ) : null
                }
              />
            )
          })}
        </ul>
        {services.length > 0 && removedServiceIds.length === services.length ? (
          <p className="text-xs text-warning">Saving removes this domain from every service.</p>
        ) : null}
        {[...unmatchedConflicts.map(({ message }) => message), ...(saveError ? [saveError] : [])].map((message) => (
          <p key={message} role="alert" className="text-xs text-negative">
            {message}
          </p>
        ))}
      </section>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          color="neutral"
          size="md"
          disabled={!isDirty || !formState.isValid || isSaving || conflicts.length > 0}
          loading={isSaving && variables?.redeploy === false}
          onClick={() => save(false)}
        >
          Save
        </Button>
        <Button
          type="button"
          size="md"
          disabled={!formState.isValid || isSaving || conflicts.length > 0}
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
