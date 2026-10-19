import { useState } from 'react'
import { Button, Icon, InputSelectSmall, InputTextSmall } from '@qovery/shared/ui'
import {
  type DomainRoute,
  type RoutableService,
  type RoutedDomain,
  normalizePath,
  routeConflicts,
} from '../domain-routing'
import { RouteRewriteField } from '../route-rewrite-field/route-rewrite-field'

export interface RouteFormProps {
  domain: RoutedDomain
  services: RoutableService[]
  route?: DomainRoute
  // Set when the form is opened from a service page: the target cannot change.
  lockedServiceId?: string
  onSave: (route: Omit<DomainRoute, 'id'> & { id?: string }) => void
  onCancel?: () => void
}

export function RouteForm({ domain, services, route, lockedServiceId, onSave, onCancel }: RouteFormProps) {
  const exposable = services.filter((s) => s.ports.length > 0)
  const [path, setPath] = useState(route?.path ?? '/')
  const [serviceId, setServiceId] = useState(route?.serviceId ?? lockedServiceId ?? exposable[0]?.id ?? '')
  const service = services.find((s) => s.id === serviceId)
  const [port, setPort] = useState(route?.port ?? service?.ports[0] ?? 80)
  const [rewrite, setRewrite] = useState<Pick<DomainRoute, 'stripPrefix' | 'rewriteTo'>>({
    stripPrefix: route?.stripPrefix ?? false,
    rewriteTo: route?.rewriteTo,
  })
  const [timeoutSec, setTimeoutSec] = useState(String(route?.timeoutSec ?? 60))

  const draft = {
    id: route?.id,
    path: normalizePath(path),
    serviceId,
    port,
    ...rewrite,
    timeoutSec: Number(timeoutSec),
  }
  const conflicts = routeConflicts(domain, { id: route?.id ?? '', path: draft.path })

  return (
    <div className="flex flex-col gap-3 rounded border border-neutral bg-surface-neutral-subtle p-3">
      <div className="flex flex-wrap items-end gap-2">
        <InputTextSmall
          name="path"
          label="Path"
          className="w-36"
          inputClassName="font-code"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          error={conflicts.length > 0 ? 'Already used' : undefined}
        />
        <Icon iconName="arrow-right" className="mb-3 text-neutral-subtle" />
        <InputSelectSmall
          name="service"
          label="Service"
          className="w-48"
          defaultValue={serviceId}
          disabled={Boolean(lockedServiceId)}
          items={exposable.map((s) => ({
            value: s.id,
            label: s.status === 'STOPPED' ? `${s.name} (stopped)` : s.name,
          }))}
          onChange={(value) => {
            setServiceId(value ?? '')
            setPort(services.find((s) => s.id === value)?.ports[0] ?? 80)
          }}
        />
        <InputSelectSmall
          key={serviceId}
          name="port"
          label="Port"
          className="w-24"
          defaultValue={String(port)}
          items={(service?.ports ?? []).map((p) => ({ value: String(p), label: String(p) }))}
          onChange={(value) => setPort(Number(value))}
        />
        <InputTextSmall
          name="timeout"
          label="Timeout (s)"
          type="number"
          className="w-24"
          value={timeoutSec}
          onChange={(e) => setTimeoutSec(e.target.value)}
        />
      </div>
      <RouteRewriteField path={draft.path} value={rewrite} onChange={setRewrite} />
      {conflicts.length > 0 && (
        <p className="text-sm text-negative">
          <Icon iconName="triangle-exclamation" className="mr-1" />
          {domain.host}
          {draft.path} is already served by{' '}
          {conflicts.map((c) => services.find((s) => s.id === c.serviceId)?.name).join(', ')}.
        </p>
      )}
      <div className="flex gap-2">
        <Button size="md" color="brand" disabled={conflicts.length > 0 || !serviceId} onClick={() => onSave(draft)}>
          {route ? 'Save route' : 'Add route'}
        </Button>
        {onCancel && (
          <Button size="md" variant="outline" color="neutral" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

export default RouteForm
