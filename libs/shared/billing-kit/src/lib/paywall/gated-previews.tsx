/*
 * The product previews of <GatedPage>: static drawings of the console with the feature in use.
 * Decorative only (the page hides them from assistive technology), no data from any customer:
 * every name below is made up.
 */
import type { ReactNode } from 'react'
import { Icon } from '@qovery/shared/ui'
import type { GatedPreviewKey } from './gated'

/** A console window: a title bar with a breadcrumb, then the body. Wider than its column on purpose (the page clips and fades it). */
function Frame({ path, children }: { path: string[]; children: ReactNode }) {
  return (
    <div className="w-[760px] max-w-none overflow-hidden rounded-lg border border-neutral bg-background shadow-lg">
      <div className="flex items-center gap-2 border-b border-neutral bg-surface-neutral px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-surface-neutral-component" />
        <span className="h-2.5 w-2.5 rounded-full bg-surface-neutral-component" />
        <span className="h-2.5 w-2.5 rounded-full bg-surface-neutral-component" />
        <span className="ml-3 text-xs text-neutral-subtle">{path.join('  /  ')}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'positive' | 'brand' | 'warning'
}) {
  const cls = {
    neutral: 'border-neutral bg-surface-neutral-subtle text-neutral-subtle',
    positive: 'border-positive-component bg-surface-positive-subtle text-positive',
    brand: 'border-brand-strong bg-surface-brand-subtle text-brand',
    warning: 'border-warning-component bg-surface-warning-subtle text-warning',
  }[tone]
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      {children}
    </span>
  )
}

const Dot = ({ ok = true }: { ok?: boolean }) => (
  <span
    className={`inline-block h-2 w-2 rounded-full ${ok ? 'bg-surface-positive-component' : 'bg-surface-warning-solid'}`}
  />
)

function Blueprints() {
  const items: [string, string, string][] = [
    ['database', 'PostgreSQL (RDS)', 'AWS'],
    ['bolt', 'Redis (ElastiCache)', 'AWS'],
    ['box-archive', 'Object storage (S3)', 'AWS'],
    ['stream', 'Kafka (MSK)', 'AWS'],
    ['database', 'MySQL (RDS)', 'AWS'],
    ['globe', 'CloudFront', 'AWS'],
  ]
  return (
    <Frame path={['production', 'New service', 'Blueprints']}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 flex-1 items-center gap-2 rounded border border-neutral bg-surface-neutral px-3 text-sm text-neutral-subtle">
          <Icon iconName="magnifying-glass" iconStyle="regular" className="text-xs" />
          Search blueprints
        </div>
        <Pill tone="brand">All</Pill>
        <Pill>Databases</Pill>
        <Pill>Queues</Pill>
        <Pill>Storage</Pill>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {items.map(([icon, name, cloud], i) => (
          <div
            key={name}
            className={`flex flex-col gap-3 rounded-md border p-3 ${i === 0 ? 'border-brand-strong bg-surface-brand-subtle' : 'border-neutral bg-surface-neutral'}`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-surface-neutral-component text-neutral">
                <Icon iconName={icon as 'database'} iconStyle="regular" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-neutral">{name}</div>
                <div className="text-[11px] text-neutral-subtle">{cloud} · Terraform</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Pill>
                v{2 + (i % 3)}.{i + 1}
              </Pill>
              <span
                className={`rounded px-2 py-1 text-[11px] font-medium ${i === 0 ? 'bg-surface-brand-solid text-neutral-contrasted' : 'border border-neutral text-neutral'}`}
              >
                Deploy
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-neutral bg-surface-neutral p-4">
        <div className="mb-3 text-sm font-medium text-neutral">PostgreSQL (RDS)</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Instance', 'db.t4g.medium'],
            ['Version', '16'],
            ['Storage', '50 GB'],
          ].map(([k, v]) => (
            <div key={k} className="rounded border border-neutral bg-background px-3 py-2">
              <div className="text-[11px] text-neutral-subtle">{k}</div>
              <div className="text-sm text-neutral">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

function ManagedCluster() {
  const bars = [3, 3, 4, 5, 6, 5, 4, 4, 5, 7, 6, 5]
  return (
    <Frame path={['Clusters', 'production-eu']}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded bg-surface-neutral-component text-neutral">
          <Icon iconName="cloud" iconStyle="regular" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral">
            production-eu{' '}
            <Pill tone="positive">
              <Dot />
              Running
            </Pill>
          </div>
          <div className="text-xs text-neutral-subtle">AWS · eu-west-3 · Kubernetes 1.33 · managed by Qovery</div>
        </div>
        <Pill tone="brand">
          <Icon iconName="arrows-rotate" iconStyle="regular" />
          Auto upgrades
        </Pill>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Nodes', '5', 'min 3, max 10'],
          ['CPU', '42%', 'of 20 vCPU'],
          ['Memory', '58%', 'of 80 GB'],
        ].map(([k, v, h]) => (
          <div key={k} className="rounded-md border border-neutral bg-surface-neutral p-3">
            <div className="text-[11px] text-neutral-subtle">{k}</div>
            <div className="text-lg font-medium text-neutral">{v}</div>
            <div className="text-[11px] text-neutral-subtle">{h}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-neutral bg-surface-neutral p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-neutral-subtle">
          <span>Nodes over 24 hours</span>
          <span>Autoscaling</span>
        </div>
        <div className="flex h-20 items-end gap-1.5">
          {bars.map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-surface-brand-solid opacity-70"
              style={{ height: `${b * 12}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 divide-y divide-neutral rounded-md border border-neutral bg-surface-neutral text-xs">
        {[
          ['Node pool default', 't3a.large · on-demand', '3 nodes'],
          ['Node pool batch', 'c6a.xlarge · spot', '2 nodes'],
          ['Upgrade window', 'Sundays 02:00 UTC', 'Next: 1.34'],
        ].map(([a, b, c]) => (
          <div key={a} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-neutral">{a}</span>
            <span className="text-neutral-subtle">{b}</span>
            <span className="text-neutral-subtle">{c}</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function SelfManagedCluster() {
  return (
    <Frame path={['Clusters']}>
      <div className="flex flex-col gap-2">
        {[
          ['on-prem-paris', 'Self-managed · Kubernetes 1.31', true],
          ['staging-k3s', 'Self-managed · Kubernetes 1.30', true],
          ['gke-analytics', 'Self-managed · Kubernetes 1.32', false],
        ].map(([name, sub, ok]) => (
          <div
            key={name as string}
            className="flex items-center gap-3 rounded-md border border-neutral bg-surface-neutral px-4 py-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded bg-surface-neutral-component text-neutral">
              <Icon iconName="server" iconStyle="regular" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium text-neutral">{name}</div>
              <div className="text-[11px] text-neutral-subtle">{sub}</div>
            </div>
            <Pill tone={ok ? 'positive' : 'warning'}>
              <Dot ok={!!ok} />
              {ok ? 'Connected' : 'Installing'}
            </Pill>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-neutral bg-surface-neutral p-4">
        <div className="mb-2 text-sm font-medium text-neutral">Connect a cluster</div>
        <div className="rounded bg-background px-3 py-3 font-code text-[11px] leading-5 text-neutral-subtle">
          <div>
            <span className="text-brand">$</span> helm repo add qovery https://helm.qovery.com
          </div>
          <div>
            <span className="text-brand">$</span> helm upgrade --install qovery qovery/qovery -n qovery \
          </div>
          <div className="pl-4">-f values.yaml --create-namespace</div>
        </div>
      </div>
    </Frame>
  )
}

function Members() {
  const rows: [string, string, string][] = [
    ['Ada L.', 'Admin', 'AL'],
    ['Grace H.', 'DevOps', 'GH'],
    ['Linus T.', 'Developer', 'LT'],
    ['Margaret H.', 'Viewer', 'MH'],
    ['Ken T.', 'Developer', 'KT'],
  ]
  return (
    <Frame path={['Organization settings', 'Members']}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium text-neutral">
          Members <span className="text-neutral-subtle">· 5</span>
        </div>
        <span className="rounded bg-surface-brand-solid px-3 py-1.5 text-xs font-medium text-neutral-contrasted">
          Invite member
        </span>
      </div>
      <div className="divide-y divide-neutral rounded-md border border-neutral bg-surface-neutral">
        {rows.map(([name, role, ini]) => (
          <div key={name} className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-neutral-component text-[11px] font-medium text-neutral">
              {ini}
            </span>
            <span className="flex-1 text-sm text-neutral">{name}</span>
            <Pill tone={role === 'Admin' ? 'brand' : 'neutral'}>{role}</Pill>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function Observe() {
  const line =
    'M0,60 C40,52 80,58 120,40 C160,22 200,30 240,34 C280,38 320,20 360,24 C400,28 440,44 480,36 C520,28 560,18 600,22 L640,20'
  return (
    <Frame path={['production', 'api', 'Monitoring']}>
      <div className="grid grid-cols-3 gap-3">
        {[
          ['CPU', '0.42 vCPU'],
          ['Memory', '612 MB'],
          ['Requests', '184 / s'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-neutral bg-surface-neutral p-3">
            <div className="text-[11px] text-neutral-subtle">{k}</div>
            <div className="text-lg font-medium text-neutral">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-neutral bg-surface-neutral p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-neutral-subtle">
          <span>CPU, last 6 hours</span>
          <Pill tone="positive">
            <Dot />
            No alert firing
          </Pill>
        </div>
        <svg viewBox="0 0 640 80" className="h-24 w-full text-brand">
          <path d={line} fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <div className="mt-3 rounded-md border border-neutral bg-background p-3 font-code text-[11px] leading-5 text-neutral-subtle">
        <div>12:04:11 GET /orders 200 18ms</div>
        <div>12:04:12 GET /orders/42 200 9ms</div>
        <div>12:04:12 POST /checkout 201 41ms</div>
      </div>
    </Frame>
  )
}

function SingleSignOn() {
  const fields: [string, string][] = [
    ['Protocol', 'SAML 2.0'],
    ['Sign-in URL', 'https://acme.okta.com/app/qovery/sso/saml'],
    ['Email domain', 'acme.example'],
  ]
  return (
    <Frame path={['Organization settings', 'Sign-in']}>
      <div className="mb-4 flex items-center gap-3 rounded-md border border-neutral bg-surface-neutral p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded bg-surface-neutral-component text-neutral">
          <Icon iconName="id-badge" iconStyle="regular" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral">
            Okta{' '}
            <Pill tone="positive">
              <Dot />
              Connected
            </Pill>
          </div>
          <div className="text-xs text-neutral-subtle">
            Members sign in with Okta. New members are added at their first sign-in.
          </div>
        </div>
        <Pill tone="brand">
          <Icon iconName="lock" iconStyle="regular" />
          Enforced
        </Pill>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {fields.map(([k, v]) => (
          <div key={k} className="min-w-0 rounded border border-neutral bg-surface-neutral px-3 py-2">
            <div className="text-[11px] text-neutral-subtle">{k}</div>
            <div className="truncate text-sm text-neutral">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-neutral bg-surface-neutral">
        <div className="border-b border-neutral px-4 py-2.5 text-xs text-neutral-subtle">Recent sign-ins</div>
        {[
          ['Ada L.', 'Okta', '2 min ago'],
          ['Grace H.', 'Okta', '1 hour ago'],
          ['Linus T.', 'Okta', 'Yesterday'],
        ].map(([who, via, when]) => (
          <div key={who} className="flex items-center justify-between px-4 py-2.5 text-xs">
            <span className="text-neutral">{who}</span>
            <span className="text-neutral-subtle">via {via}</span>
            <span className="text-neutral-subtle">{when}</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function Generic({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Frame path={['Settings', title]}>
      <div className="mb-4 text-sm font-medium text-neutral">{title}</div>
      <div className="flex flex-col gap-2">
        {(lines.length ? lines : [title]).map((l) => (
          <div
            key={l}
            className="flex items-center gap-3 rounded-md border border-neutral bg-surface-neutral px-4 py-3"
          >
            <span className="h-4 w-4 rounded bg-surface-positive-component" />
            <span className="flex-1 text-sm text-neutral">{l}</span>
            <span className="h-4 w-8 rounded-full bg-surface-brand-solid" />
          </div>
        ))}
      </div>
    </Frame>
  )
}

/** The preview for a feature; unknown keys draw the generic one from the gate's own text. */
export function GatedPreview({ preview, title, lines }: { preview: GatedPreviewKey; title: string; lines: string[] }) {
  switch (preview) {
    case 'blueprints':
      return <Blueprints />
    case 'managed-cluster':
      return <ManagedCluster />
    case 'self-managed-cluster':
      return <SelfManagedCluster />
    case 'members':
      return <Members />
    case 'observe':
      return <Observe />
    case 'sso':
      return <SingleSignOn />
    default:
      return <Generic title={title} lines={lines} />
  }
}
