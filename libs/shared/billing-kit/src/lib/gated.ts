/*
 * The full-page paywall (<GatedPage>): what each gated feature shows, and how the gate's paywall
 * maps onto the page. Pure (no React, no runtime import) so it runs in plain Node tests.
 *
 * The gate's own content wins (staff edit it in the back office: title, headline as the
 * description, benefits as the capabilities, image or video, learn more link). GATED_FEATURES adds
 * what the payload does not carry (the capability icons and the product preview) and fills what an
 * older server leaves out. A SKU without an entry gets the generic preview and the gate's text.
 */
import type { PaywallInfo, PaywallOption, PaywallOptionType } from './types'

/** The product previews <GatedPage> can draw (GatedPreviews.tsx). */
export type GatedPreviewKey =
  | 'blueprints'
  | 'managed-cluster'
  | 'self-managed-cluster'
  | 'members'
  | 'observe'
  | 'generic'

export interface GatedFeature {
  /** FontAwesome icon next to the feature name in the top strip. */
  icon: string
  title: string
  description: string
  /** Icons for the capability lines, in order; the labels are fallbacks for the gate's benefits. */
  capabilities: { icon: string; label: string }[]
  preview: GatedPreviewKey
  learnMoreUrl?: string
}

/** One entry per gated SKU. A new gate adds an entry here (and a preview when it needs its own). */
export const GATED_FEATURES: Record<string, GatedFeature> = {
  service_catalog: {
    icon: 'cubes',
    title: 'Blueprints',
    description: 'Create databases, caches and storage from a catalog of tested modules, in your own cloud account.',
    capabilities: [
      { icon: 'grid-2', label: 'RDS, ElastiCache, S3, Kafka and more' },
      { icon: 'list-check', label: 'A short form instead of infrastructure code' },
      { icon: 'shield-check', label: 'Tested Terraform modules, run in your account' },
      { icon: 'clone', label: 'The same setup in every environment' },
      { icon: 'arrows-rotate', label: 'Updates offered when a module changes' },
    ],
    preview: 'blueprints',
    learnMoreUrl: 'https://www.qovery.com/docs/configuration/blueprints',
  },
  'clusters.managed': {
    icon: 'cloud',
    title: 'Qovery-managed clusters',
    description:
      'Qovery creates the Kubernetes cluster in your cloud account and keeps it running, upgraded and patched.',
    capabilities: [
      { icon: 'cloud', label: 'Created in your AWS, GCP, Azure or Scaleway account' },
      { icon: 'arrow-up-right-dots', label: 'Kubernetes upgrades and patches handled' },
      { icon: 'arrows-up-down', label: 'Node autoscaling set up for you' },
      { icon: 'lock', label: 'Certificates and logs set up for you' },
      { icon: 'key', label: 'Full access to the cluster and your account' },
    ],
    preview: 'managed-cluster',
    learnMoreUrl: 'https://www.qovery.com/docs/configuration/clusters',
  },
  'clusters.self_managed': {
    icon: 'server',
    title: 'Self-managed clusters',
    description: 'Connect a Kubernetes cluster you already run, and deploy to it with Qovery like any other cluster.',
    capabilities: [
      { icon: 'dharmachakra', label: 'Any conformant Kubernetes cluster' },
      { icon: 'terminal', label: 'Installed with one Helm chart' },
      { icon: 'network-wired', label: 'Your network, nodes and upgrade schedule' },
      { icon: 'rocket', label: 'Same deployments, logs and previews as managed clusters' },
    ],
    preview: 'self-managed-cluster',
    learnMoreUrl: 'https://www.qovery.com/docs/getting-started/installation/kubernetes',
  },
  'members.seats': {
    icon: 'users',
    title: 'Members',
    description: 'Bring more of your team into the console, each with the role and access they need.',
    capabilities: [
      { icon: 'user-shield', label: 'A role for each person, from Viewer to Admin' },
      { icon: 'envelope', label: 'Invitations by email' },
      { icon: 'robot', label: 'AI agents and bots do not count as members' },
      { icon: 'clock-rotate-left', label: 'Every change recorded in the audit log' },
    ],
    preview: 'members',
    learnMoreUrl: 'https://www.qovery.com/docs/configuration/organization/members-rbac',
  },
  'observe.clusters': {
    icon: 'chart-line',
    title: 'Qovery Observe',
    description: 'Metrics, logs and alerts for the services on a cluster, without setting up a monitoring stack.',
    capabilities: [
      { icon: 'microchip', label: 'CPU, memory and network per service' },
      { icon: 'scroll', label: 'Service logs next to each deployment' },
      { icon: 'bell', label: 'Alerts on the conditions you set' },
      { icon: 'server', label: 'Runs on your own cluster' },
    ],
    preview: 'observe',
    learnMoreUrl: 'https://www.qovery.com/docs/configuration/integrations/observability/qovery-observe',
  },
}

export interface GatedCta {
  label: string
  icon: string
}

const shortMoney = (cents: number, currency: string) => {
  const v = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: Number.isInteger(v) ? 0 : 2,
  }).format(v)
}
const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s)

const ICON: Record<PaywallOptionType, string> = {
  start_trial: 'flask',
  upgrade: 'arrow-up',
  addon: 'plus',
  request_admin: 'paper-plane',
  contact_sales: 'comments',
  update_payment: 'credit-card',
}

/** The page's button for an option: what the gate decided, said plainly. */
export function gatedCta(o: PaywallOption): GatedCta {
  const icon = ICON[o.type]
  switch (o.type) {
    case 'start_trial':
      return { icon, label: `Start a ${o.days ?? 14}-day trial` }
    case 'upgrade':
      return { icon, label: o.plan_name ? `Upgrade to ${o.plan_name}` : o.label }
    case 'addon': {
      const name = lowerFirst(o.addon_name ?? 'the add-on')
      const price =
        o.amount != null && o.amount > 0 && o.currency
          ? ` for ${shortMoney(o.amount, o.currency)}/${o.period ?? 'month'}`
          : ''
      return { icon, label: `Add ${name}${price}` }
    }
    case 'request_admin':
      return { icon, label: 'Ask an admin' }
    case 'contact_sales':
      return { icon, label: 'Talk to us' }
    case 'update_payment':
      return { icon, label: 'Update payment method' }
  }
}

/** The small chip next to the feature name: how this customer can get it. */
export function gatedChip(p: Pick<PaywallInfo, 'options'>): string {
  const first = p.options[0]
  if (!first) return 'Not in your plan'
  switch (first.type) {
    case 'start_trial':
      return 'Trial available'
    case 'upgrade':
      return first.plan_name ? `Included in ${first.plan_name}` : 'In a higher plan'
    case 'addon':
      return 'Available as an add-on'
    case 'request_admin':
      return 'Ask an admin'
    case 'contact_sales':
      return 'Available on request'
    case 'update_payment':
      return 'Payment required'
  }
}

export interface GatedPageView {
  sku: string
  icon: string
  title: string
  description: string
  capabilities: { icon: string; label: string }[]
  preview: GatedPreviewKey
  learnMoreUrl?: string
  chip: string
  /** The recommended option (first), and the other ways, in the gate's order. */
  primary?: PaywallOption
  others: PaywallOption[]
  /** Why it is locked, one sentence from pricing-api. */
  message: string
  media?: PaywallInfo['media']
}

/** At most this many capability lines on the page. */
export const MAX_CAPABILITIES = 6

/** The page for a gate's paywall: the gate's content first, the feature's entry for the rest. */
export function gatedPageView(p: PaywallInfo, features: Record<string, GatedFeature> = GATED_FEATURES): GatedPageView {
  const f = features[p.sku]
  const benefits = (p.benefits ?? []).map((b) => b.trim()).filter(Boolean)
  const labels = benefits.length ? benefits : f?.capabilities.map((c) => c.label) ?? []
  return {
    sku: p.sku,
    icon: f?.icon ?? 'lock',
    title: p.title || f?.title || p.sku,
    description: p.headline || f?.description || '',
    capabilities: labels
      .slice(0, MAX_CAPABILITIES)
      .map((label, i) => ({ label, icon: f?.capabilities[i]?.icon ?? 'circle-check' })),
    preview: f?.preview ?? 'generic',
    learnMoreUrl: p.learn_more_url || f?.learnMoreUrl || undefined,
    chip: gatedChip(p),
    primary: p.options[0],
    others: p.options.slice(1),
    message: p.message ?? '',
    media: p.media,
  }
}
