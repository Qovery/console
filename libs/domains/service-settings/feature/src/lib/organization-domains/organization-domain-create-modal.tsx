import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { type CustomDomainErrorResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { mutations } from '@qovery/domains/custom-domains/data-access'
import { useCreateEnvironmentCustomDomain } from '@qovery/domains/custom-domains/feature'
import { useLinks } from '@qovery/domains/services/feature'
import { Button, Icon, InputSelect, InputText, InputToggle, Tooltip, useModal } from '@qovery/shared/ui'
import { queries } from '@qovery/state/util-queries'
import { validateCustomDomain } from '../utils/validate-custom-domain'
import { OrganizationDomainCnameRecords } from './organization-domain-cname-records'
import { OrganizationDomainRouteItem } from './organization-domain-route-item'

type RouteServiceType = 'APPLICATION' | 'CONTAINER' | 'HELM'
const ROUTE_SERVICE_TYPES: string[] = ['APPLICATION', 'CONTAINER', 'HELM']

export interface NewDomainRoute {
  project: { id: string; name: string }
  environment: { id: string; name: string }
  service: { id: string; name: string; type: RouteServiceType }
  port: number | null
}

interface DomainFormValues {
  domain: string
  use_cdn: boolean
  generate_certificate: boolean
}

const routeLabel = ({ project, environment, service }: NewDomainRoute) =>
  `${project.name}/${environment.name}/${service.name}`

const getProblem = (error: unknown) =>
  isAxiosError<{ errors?: CustomDomainErrorResponse[]; detail?: string }>(error) ? error.response?.data : undefined

interface RouteFormProps {
  title: string
  submitLabel: string
  initialRoute?: NewDomainRoute
  // Every route of a domain belongs to one environment: later routes are locked to it.
  lockedTo?: Pick<NewDomainRoute, 'project' | 'environment'>
  otherRoutes: NewDomainRoute[]
  domain: DomainFormValues
  onCancel: () => void
  onSubmit: (route: NewDomainRoute) => void
}

function OrganizationDomainRouteForm({
  title,
  submitLabel,
  initialRoute,
  lockedTo,
  otherRoutes,
  domain,
  onCancel,
  onSubmit,
}: RouteFormProps) {
  const { organizationId = '' } = useParams({ strict: false })
  const [projectId, setProjectId] = useState(lockedTo?.project.id ?? initialRoute?.project.id ?? '')
  const [environmentId, setEnvironmentId] = useState(lockedTo?.environment.id ?? initialRoute?.environment.id ?? '')
  const [serviceId, setServiceId] = useState(initialRoute?.service.id ?? '')
  const [conflict, setConflict] = useState<string>()
  const [validating, setValidating] = useState(false)
  const { data: projects = [] } = useQuery(queries.projects.list({ organizationId }))
  const { data: environments = [] } = useQuery({
    ...queries.environments.list({ projectId }),
    enabled: Boolean(projectId),
  })
  const { data: services = [] } = useQuery({ ...queries.services.list(environmentId), enabled: Boolean(environmentId) })
  const availableServices = services.filter(
    ({ id, serviceType }) =>
      ROUTE_SERVICE_TYPES.includes(serviceType) && !otherRoutes.some((route) => route.service.id === id)
  )
  const service = availableServices.find(({ id }) => id === serviceId)
  const { data: links = [], isLoading: linksLoading } = useLinks({
    serviceId,
    serviceType: service?.serviceType,
  })
  const port = (links.find(({ is_default }) => is_default) ?? links[0])?.internal_port ?? null
  const noPublicPort = Boolean(service) && !linksLoading && !links.length
  const project = projects.find(({ id }) => id === projectId)
  const environment = environments.find(({ id }) => id === environmentId)

  const submit = async () => {
    if (!service || !project || !environment) return
    const route: NewDomainRoute = {
      project: { id: project.id, name: project.name },
      environment: { id: environment.id, name: environment.name },
      service: { id: service.id, name: service.name, type: service.serviceType as RouteServiceType },
      port,
    }
    // Check the route against existing domains before adding it, when there is a valid domain to check.
    if (validateCustomDomain(domain.domain) === true) {
      setValidating(true)
      try {
        const errors = await mutations.validateEnvironmentCustomDomain({
          environmentId: environment.id,
          payload: {
            ...domain,
            services: [...otherRoutes, route].map(({ service }) => ({ id: service.id, type: service.type })),
          },
        })
        const serviceConflict = errors.find((error) => error.service_id === service.id)
        if (serviceConflict) {
          setConflict(serviceConflict.message)
          return
        }
      } catch {
        // The creation runs the same checks; do not block on a failed pre-check.
      } finally {
        setValidating(false)
      }
    }
    onSubmit(route)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="h4 text-neutral">{title}</h2>
      <div className="flex flex-col gap-3">
        <InputSelect
          label="Project"
          // Render the menu outside the modal so it is not clipped by it.
          portal
          value={projectId}
          disabled={Boolean(lockedTo)}
          options={projects.map(({ id, name }) => ({ label: name, value: id }))}
          onChange={(value) => {
            setProjectId(String(value))
            setEnvironmentId('')
            setServiceId('')
            setConflict(undefined)
          }}
        />
        <InputSelect
          label="Environment"
          portal
          value={environmentId}
          disabled={!projectId || Boolean(lockedTo)}
          options={environments.map(({ id, name }) => ({ label: name, value: id }))}
          onChange={(value) => {
            setEnvironmentId(String(value))
            setServiceId('')
            setConflict(undefined)
          }}
        />
        <InputSelect
          label="Service"
          portal
          value={serviceId}
          disabled={!environmentId}
          options={availableServices.map(({ id, name }) => ({ label: name, value: id }))}
          error={
            conflict ?? (noPublicPort ? 'Configure a public port on this service before adding a domain.' : undefined)
          }
          onChange={(value) => {
            setServiceId(String(value))
            setConflict(undefined)
          }}
        />
        {service && port !== null ? (
          <p className="text-xs text-neutral-subtle">
            Requests to / go to port {port} of {service.name}.
          </p>
        ) : null}
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" color="neutral" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="md"
          disabled={!service || linksLoading || noPublicPort || Boolean(conflict)}
          loading={validating}
          onClick={submit}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

export interface OrganizationDomainCreateModalProps {
  onClose: () => void
}

export function OrganizationDomainCreateModal({ onClose }: OrganizationDomainCreateModalProps) {
  const { enableAlertClickOutside } = useModal()
  const [routes, setRoutes] = useState<NewDomainRoute[]>([])
  // `undefined`: domain view. A number: the route being edited. `null`: a new route.
  const [editedRoute, setEditedRoute] = useState<number | null>()
  const [conflicts, setConflicts] = useState<CustomDomainErrorResponse[]>([])
  const [createError, setCreateError] = useState<string>()
  const { control, formState, handleSubmit, setValue, watch, getValues } = useForm<DomainFormValues>({
    defaultValues: { domain: '', use_cdn: false, generate_certificate: true },
    // Do not flag a domain while it is first typed; recheck it on every change once it has been left.
    mode: 'onTouched',
  })
  const lockedTo = routes[0] ? { project: routes[0].project, environment: routes[0].environment } : undefined
  const environmentId = lockedTo?.environment.id ?? ''
  const { data: cnameTarget, isLoading: cnameTargetLoading } = useQuery({
    ...queries.customDomains.environmentCnameTarget({ environmentId }),
    enabled: Boolean(environmentId),
  })
  const { data: canShare = true } = useQuery({
    ...queries.environments.list({ projectId: lockedTo?.project.id ?? '' }),
    enabled: Boolean(lockedTo),
    select: (environments) =>
      environments?.find(({ id }) => id === environmentId)?.routing_capabilities?.can_share ?? true,
  })
  const { mutateAsync: createDomain, isLoading: isCreating } = useCreateEnvironmentCustomDomain({ environmentId })
  const isDirty = formState.isDirty || routes.length > 0

  useEffect(() => {
    enableAlertClickOutside(isDirty)
  }, [isDirty, enableAlertClickOutside])

  const domain = watch('domain')
  const canAddRoute = !lockedTo || canShare
  const addRouteButton = (variant: 'outline' | 'solid') => (
    <Tooltip content="This environment can't share a domain between services." disabled={canAddRoute}>
      <span className="inline-flex">
        <Button
          type="button"
          size="sm"
          variant={variant}
          color="neutral"
          disabled={!canAddRoute || isCreating}
          onClick={() => setEditedRoute(null)}
        >
          <Icon iconName="circle-plus" iconStyle="regular" />
          Add route
        </Button>
      </span>
    </Tooltip>
  )

  const create = handleSubmit(async (values) => {
    setConflicts([])
    setCreateError(undefined)
    try {
      await createDomain({
        environmentId,
        payload: { ...values, services: routes.map(({ service }) => ({ id: service.id, type: service.type })) },
      })
      onClose()
    } catch (error) {
      const problem = getProblem(error)
      if (problem?.errors?.length) setConflicts(problem.errors)
      else setCreateError(problem?.detail || 'Unable to create the domain. Try again.')
    }
  })

  if (editedRoute !== undefined) {
    const otherRoutes = routes.filter((_, index) => index !== editedRoute)
    return (
      <OrganizationDomainRouteForm
        title={editedRoute === null ? 'Add route' : 'Edit route'}
        submitLabel={editedRoute === null ? 'Add route' : 'Save route'}
        initialRoute={editedRoute === null ? undefined : routes[editedRoute]}
        // Editing the only route may move the domain to another environment.
        lockedTo={
          otherRoutes.length ? { project: otherRoutes[0].project, environment: otherRoutes[0].environment } : undefined
        }
        otherRoutes={otherRoutes}
        domain={getValues()}
        onCancel={() => setEditedRoute(undefined)}
        onSubmit={(route) => {
          setRoutes((current) =>
            editedRoute === null
              ? [...current, route]
              : current.map((item, index) => (index === editedRoute ? route : item))
          )
          setConflicts([])
          setEditedRoute(undefined)
        }}
      />
    )
  }

  const unmatchedConflicts = conflicts.filter(
    ({ service_id }) => !routes.some(({ service }) => service.id === service_id)
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="h4 text-neutral">Add custom domain</h2>
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
              onBlur={field.onBlur}
              label="Domain"
              error={error?.message}
              autoFocus
            />
          )}
        />
        <OrganizationDomainCnameRecords
          domain={domain}
          target={cnameTarget}
          loading={Boolean(environmentId) && cnameTargetLoading}
          unavailableMessage={
            environmentId ? "Available after the environment's first deployment" : 'Add a route to get the target'
          }
        />
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
        <div className="flex min-h-7 items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-subtle">Routes</h3>
          {routes.length ? addRouteButton('outline') : null}
        </div>
        {routes.length ? (
          <ul className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral-subtle">
            {routes.map((route, index) => (
              <OrganizationDomainRouteItem
                key={route.service.id}
                path="/"
                service={routeLabel(route)}
                port={route.port}
                error={conflicts
                  .filter(({ service_id }) => service_id === route.service.id)
                  .map(({ message }) => message)
                  .join(' ')}
                actions={
                  <>
                    <Tooltip content="Edit route">
                      <Button
                        type="button"
                        aria-label={`Edit route / of ${route.service.name}`}
                        iconOnly
                        variant="outline"
                        color="neutral"
                        size="xs"
                        disabled={isCreating}
                        onClick={() => setEditedRoute(index)}
                      >
                        <Icon iconName="pencil" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Remove route">
                      <Button
                        type="button"
                        aria-label={`Remove route / of ${route.service.name}`}
                        iconOnly
                        variant="outline"
                        color="neutral"
                        size="xs"
                        disabled={isCreating}
                        onClick={() => {
                          setRoutes((current) => current.filter((_, routeIndex) => routeIndex !== index))
                          setConflicts([])
                        }}
                      >
                        <Icon iconName="trash-can" iconStyle="regular" />
                      </Button>
                    </Tooltip>
                  </>
                }
              />
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-4 rounded-lg border border-neutral bg-surface-neutral-subtle p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-neutral text-neutral-subtle">
              <Icon iconName="globe" iconStyle="regular" />
            </span>
            <p className="flex-1 text-sm font-medium text-neutral-subtle">No route added</p>
            {addRouteButton('solid')}
          </div>
        )}
        {[...unmatchedConflicts.map(({ message }) => message), ...(createError ? [createError] : [])].map((message) => (
          <p key={message} role="alert" className="text-xs text-negative">
            {message}
          </p>
        ))}
      </section>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" color="neutral" size="md" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          size="md"
          disabled={!formState.isValid || !routes.length || conflicts.length > 0}
          loading={isCreating}
          onClick={create}
        >
          Create
        </Button>
      </div>
    </div>
  )
}

export default OrganizationDomainCreateModal
