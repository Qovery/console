import { useEffect } from 'react'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import {
  Button,
  Callout,
  ExternalLink,
  Icon,
  InputSelectSmall,
  InputText,
  InputTextSmall,
  InputToggle,
  ModalCrud,
  useModal,
} from '@qovery/shared/ui'
import { type DomainRoute, type RoutableService, type RoutedDomain, normalizePath } from '../domain-routing'
import { RouteRewriteField } from '../route-rewrite-field/route-rewrite-field'

type RouteDraft = Pick<DomainRoute, 'path' | 'serviceId' | 'port' | 'stripPrefix' | 'rewriteTo'>

interface AddDomainFormValues {
  host: string
  generateCertificate: boolean
  useCdn: boolean
  routes: RouteDraft[]
}

export interface AddDomainSubmitValues {
  host: string
  generateCertificate: boolean
  useCdn: boolean
  routes: Omit<DomainRoute, 'id'>[]
}

export interface AddDomainModalProps {
  domains: RoutedDomain[]
  services: RoutableService[]
  cnameTarget: string
  // Returns the name of the environment that already owns this host, if any.
  findHostOwner: (host: string) => string | undefined
  // Pre-selects the first route target when the modal is opened from a service.
  defaultServiceId?: string
  onSubmit: (values: AddDomainSubmitValues) => void
  onClose: () => void
}

export function AddDomainModal({
  domains,
  services,
  cnameTarget,
  findHostOwner,
  defaultServiceId,
  onSubmit,
  onClose,
}: AddDomainModalProps) {
  const exposable = services.filter((s) => s.ports.length > 0)
  const firstService = exposable.find((s) => s.id === defaultServiceId) ?? exposable[0]
  const newRoute = (service = exposable[0]): RouteDraft => ({
    path: '/',
    serviceId: service?.id ?? '',
    port: service?.ports[0] ?? 80,
    stripPrefix: false,
  })

  const methods = useForm<AddDomainFormValues>({
    defaultValues: {
      host: '',
      generateCertificate: true,
      useCdn: false,
      routes: firstService ? [newRoute(firstService)] : [],
    },
    mode: 'onChange',
  })
  const { control, watch, setValue } = methods
  const { fields, append, remove } = useFieldArray({ control, name: 'routes' })
  const { enableAlertClickOutside } = useModal()

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState.isDirty, enableAlertClickOutside])

  const host = watch('host').trim().toLowerCase()
  const routes = watch('routes')
  const paths = routes.map((r) => normalizePath(r.path))
  const duplicatedPaths = paths.filter((p, i) => paths.indexOf(p) !== i)

  const handleSubmit = methods.handleSubmit((data) => {
    onSubmit({
      host: data.host.trim().toLowerCase(),
      generateCertificate: data.generateCertificate,
      useCdn: data.useCdn,
      routes: data.routes.map((r) => ({ ...r, path: normalizePath(r.path), port: Number(r.port), timeoutSec: 60 })),
    })
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Add domain"
        description="Attach a domain to this environment and choose which service answers on each path."
        onSubmit={handleSubmit}
        onClose={onClose}
        submitLabel="Add domain"
        submitDisabled={duplicatedPaths.length > 0}
        howItWorks={
          <>
            <ol className="ml-4 list-decimal space-y-2 text-neutral-subtle">
              <li>A domain gets one certificate and one routing table, whatever the number of services behind it.</li>
              <li>All domains of this environment use the same CNAME. Adding a path later needs no DNS change.</li>
              <li>The longest matching path wins. Paths without a route return 404.</li>
            </ol>
            <ExternalLink className="mt-3" href="https://www.qovery.com/docs/configuration/application#custom-domains">
              Documentation
            </ExternalLink>
          </>
        }
      >
        <Controller
          name="host"
          control={control}
          rules={{
            required: 'Please enter a domain',
            validate: (value) => {
              const candidate = value.trim().toLowerCase()
              if (candidate.includes('/')) return 'Enter the domain only. Paths are set in the routes below.'
              if (domains.some((d) => d.host === candidate))
                return `${candidate} already exists in this environment. Add a route to it instead.`
              const owner = findHostOwner(candidate)
              if (owner) return `${candidate} is already used by the environment “${owner}”.`
              return true
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              className="mb-3"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Domain"
              hint="For example app.acme.com"
              error={error?.message}
              autoFocus
            />
          )}
        />

        <div className="mb-6 overflow-hidden rounded-md border border-neutral">
          <div className="border-b border-neutral bg-surface-neutral-subtle px-4 py-2 text-xs font-medium text-neutral">
            CNAME configuration
          </div>
          <div className="space-y-1 bg-surface-neutral px-4 pb-3 pt-2 font-code text-xs">
            <span className="block text-brand">{host || '<your-domain>'} CNAME</span>
            <span className="block text-brand-strong">{cnameTarget}</span>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral">Routes</span>
          <Button size="sm" variant="outline" color="neutral" type="button" onClick={() => append(newRoute())}>
            Add route
            <Icon iconName="plus" />
          </Button>
        </div>
        <div className="mb-2 flex flex-col gap-2">
          {fields.map((field, index) => {
            const current = routes[index]
            const service = services.find((s) => s.id === current?.serviceId)
            const path = normalizePath(current?.path ?? '/')
            const isDuplicated = duplicatedPaths.includes(path)
            return (
              <div key={field.id} className="flex flex-col gap-2 rounded border border-neutral p-2">
                <div className="flex items-start gap-2">
                  <Controller
                    name={`routes.${index}.path`}
                    control={control}
                    render={({ field: pathField }) => (
                      <InputTextSmall
                        name={pathField.name}
                        className="w-32"
                        inputClassName="font-code"
                        value={pathField.value}
                        onChange={pathField.onChange}
                        error={isDuplicated ? 'Used twice' : undefined}
                      />
                    )}
                  />
                  <Icon iconName="arrow-right" className="mt-3 text-neutral-subtle" />
                  <InputSelectSmall
                    name={`routes.${index}.serviceId`}
                    ariaLabel="Service"
                    className="flex-1"
                    defaultValue={current?.serviceId}
                    items={exposable.map((s) => ({
                      value: s.id,
                      label: s.status === 'STOPPED' ? `${s.name} (stopped)` : s.name,
                    }))}
                    onChange={(value) => {
                      setValue(`routes.${index}.serviceId`, value ?? '', { shouldDirty: true })
                      setValue(`routes.${index}.port`, services.find((s) => s.id === value)?.ports[0] ?? 80)
                    }}
                  />
                  <InputSelectSmall
                    key={current?.serviceId}
                    name={`routes.${index}.port`}
                    ariaLabel="Port"
                    className="w-24"
                    defaultValue={String(current?.port)}
                    items={(service?.ports ?? []).map((p) => ({ value: String(p), label: `:${p}` }))}
                    onChange={(value) => setValue(`routes.${index}.port`, Number(value), { shouldDirty: true })}
                  />
                  <Button
                    size="md"
                    variant="plain"
                    color="neutral"
                    type="button"
                    iconOnly
                    aria-label="Remove route"
                    onClick={() => remove(index)}
                  >
                    <Icon iconName="trash-can" iconStyle="regular" />
                  </Button>
                </div>
                <RouteRewriteField
                  path={path}
                  value={{ stripPrefix: current?.stripPrefix ?? false, rewriteTo: current?.rewriteTo }}
                  onChange={(value) => {
                    setValue(`routes.${index}.stripPrefix`, value.stripPrefix, { shouldDirty: true })
                    setValue(`routes.${index}.rewriteTo`, value.rewriteTo, { shouldDirty: true })
                  }}
                />
              </div>
            )
          })}
        </div>
        {fields.length === 0 ? (
          <Callout.Root color="yellow" className="mb-2">
            <Callout.Icon>
              <Icon iconName="triangle-exclamation" iconStyle="regular" />
            </Callout.Icon>
            <Callout.TextDescription>
              Without a route, every request to this domain returns 404.
            </Callout.TextDescription>
          </Callout.Root>
        ) : !paths.includes('/') ? (
          <p className="mb-2 text-xs text-neutral-subtle">
            <Icon iconName="circle-info" iconStyle="regular" className="mr-1" />
            No route on <code>/</code>: requests outside {paths.join(', ')} return 404.
          </p>
        ) : null}

        <Controller
          name="useCdn"
          control={control}
          render={({ field }) => (
            <InputToggle
              className="mt-4"
              value={field.value}
              onChange={(value) => {
                if (value) setValue('generateCertificate', false, { shouldDirty: true })
                field.onChange(value)
              }}
              title="Domain behind a CDN or DNS proxy (e.g. Cloudflare, CloudFront, Fastly)"
              description="Check this if the traffic on this domain is managed by a CDN or DNS proxy."
              align="top"
              small
            />
          )}
        />
        <Controller
          name="generateCertificate"
          control={control}
          render={({ field }) => (
            <InputToggle
              className="mt-4"
              value={field.value}
              onChange={field.onChange}
              title="Generate certificate"
              description="Qovery generates and renews one certificate for this domain, shared by all its routes."
              align="top"
              small
            />
          )}
        />
      </ModalCrud>
    </FormProvider>
  )
}

export default AddDomainModal
