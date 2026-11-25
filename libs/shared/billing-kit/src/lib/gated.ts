/*
 * The full-page paywall (<GatedPage>): what each gated feature shows, and how the gate's paywall
 * maps onto the page. Pure (no React, no runtime import) so it runs in plain Node tests.
 *
 * The gate's own content wins (staff edit it in the back office: title, headline as the
 * description, benefits as the capabilities, image or video, learn more link). GATED_FEATURES adds
 * what the payload does not carry (the capability icons and the product preview) and fills what an
 * older server leaves out. A SKU without an entry gets the generic preview and the gate's text.
 *
 * Previews: a feature can have two, the console and Claude Code (a still, plus an optional muted
 * loop and its poster), served by pricing-api from billing.qovery.com/paywall-media. Media staff
 * set on the gate replace the matching default (media for the console, claude_media for Claude Code).
 */
import type { GateIntro, GateReason, PaywallInfo, PaywallOption, PaywallOptionType } from './types'

/** The product previews <GatedPage> can draw (GatedPreviews.tsx). */
export type GatedPreviewKey =
  | 'blueprints'
  | 'managed-cluster'
  | 'self-managed-cluster'
  | 'members'
  | 'observe'
  | 'sso'
  | 'generic'

/** One product preview: a still image, and optionally a short muted loop with its first frame as poster. */
export interface GatedMedia {
  image?: string
  /** Video sources, best first (WebM, then MP4). */
  video?: string[]
  poster?: string
}

export type GatedPreviewTab = 'console' | 'claude'
export type GatedPreviews = Partial<Record<GatedPreviewTab, GatedMedia>>

/** Where the default previews live (web/paywall-media, served by pricing-api). A new render goes in a new folder. */
export const PAYWALL_MEDIA_BASE = 'https://billing.qovery.com/paywall-media/v1'

/** The rendered set for a feature: console.webp + console.webm/mp4 + console-poster.webp, the same for claude. */
export function mediaSet(
  slug: string,
  tabs: GatedPreviewTab[] = ['console', 'claude'],
  base = PAYWALL_MEDIA_BASE
): GatedPreviews {
  const out: GatedPreviews = {}
  for (const tab of tabs) {
    const at = `${base}/${slug}/${tab}`
    out[tab] = { image: `${at}.webp`, video: [`${at}.webm`, `${at}.mp4`], poster: `${at}-poster.webp` }
  }
  return out
}

export interface GatedFeature {
  /** FontAwesome icon next to the feature name in the top strip. */
  icon: string
  title: string
  description: string
  /** Icons for the capability lines, in order; the labels are fallbacks for the gate's benefits. */
  capabilities: { icon: string; label: string }[]
  preview: GatedPreviewKey
  /** Rendered previews (console, Claude Code); the drawn `preview` stays the fallback. */
  media?: GatedPreviews
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
    media: mediaSet('blueprints'),
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
    media: mediaSet('managed-cluster'),
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
    media: mediaSet('self-managed-cluster'),
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
    media: mediaSet('observe'),
    learnMoreUrl: 'https://www.qovery.com/docs/configuration/integrations/observability/qovery-observe',
  },
  sso: {
    icon: 'key',
    title: 'Single sign-on',
    description: 'Your team signs in to the console with your identity provider, and access follows your directory.',
    capabilities: [
      { icon: 'id-badge', label: 'Okta, Microsoft Entra ID, Google Workspace and more' },
      { icon: 'right-to-bracket', label: 'SAML or OpenID Connect' },
      { icon: 'user-plus', label: 'Members added at their first sign-in' },
      { icon: 'shield-check', label: "Your identity provider's MFA and password rules apply" },
    ],
    preview: 'sso',
    learnMoreUrl: 'https://www.qovery.com/docs/configuration/organization/sso',
  },
  'rbac.custom_roles': {
    icon: 'user-shield',
    title: 'Custom roles',
    description: 'Give each team the access it needs, per cluster, per project and per environment type.',
    capabilities: [
      { icon: 'sliders', label: 'Manage, deploy, read-only or no access, per environment type' },
      { icon: 'shield-check', label: 'Production kept read-only while development stays open' },
      { icon: 'terminal', label: 'Shell and port-forward allowed only where you choose' },
      { icon: 'cube', label: 'Cluster access set separately' },
      { icon: 'clock-rotate-left', label: 'Every change recorded in the audit log' },
    ],
    preview: 'generic',
    media: mediaSet('custom-roles'),
    learnMoreUrl: 'https://www.qovery.com/docs/configuration/organization/members-rbac',
  },
  'audit.retention_days': {
    icon: 'clock-rotate-left',
    title: 'Log and audit retention',
    description: "Keep your organization's audit logs for longer, and find out who changed what months later.",
    capabilities: [
      { icon: 'list-check', label: 'Every change to clusters, environments, services and members' },
      { icon: 'user', label: 'Who did it, from the console, the API, Terraform or an agent' },
      { icon: 'filter', label: 'Search and filter by date, event, target and user' },
      { icon: 'box-archive', label: 'Older history for audits and incident reviews' },
    ],
    preview: 'generic',
    media: mediaSet('log-retention'),
    learnMoreUrl: 'https://www.qovery.com/docs/getting-started/security-and-compliance/audit-logs',
  },
  'terraform.provider': {
    icon: 'file-code',
    title: 'Terraform services',
    description:
      'Run your Terraform or OpenTofu code as a service in an environment: plan, apply, and outputs your apps can read.',
    capabilities: [
      { icon: 'code-branch', label: 'Terraform or OpenTofu, from your Git repository' },
      { icon: 'server', label: 'Runs on your cluster, with the state kept for you' },
      { icon: 'list-check', label: 'Plan first, then apply, from the console or the API' },
      { icon: 'sliders', label: 'Variables detected from your code, tfvars files supported' },
      { icon: 'arrow-right-arrow-left', label: 'Outputs become environment variables for your services' },
    ],
    preview: 'generic',
    media: mediaSet('terraform'),
    learnMoreUrl: 'https://www.qovery.com/docs/configuration/terraform',
  },
  environments: {
    icon: 'layer-group',
    title: 'Environments',
    description: 'Run more environments side by side: production, staging and one for each team or feature.',
    capabilities: [
      { icon: 'layer-group', label: 'Production, staging and development, each on its own' },
      { icon: 'clone', label: 'Clone an environment, with its services, to any project or cluster' },
      { icon: 'code-pull-request', label: 'Preview environments per pull request do not count' },
      { icon: 'cube', label: 'Each environment on the cluster you choose' },
    ],
    preview: 'generic',
    media: mediaSet('environments'),
    learnMoreUrl: 'https://www.qovery.com/docs/configuration/environment',
  },
}

/** The feature has page content (an entry above): the console opens <GatedPage> for it rather than the dialog. */
export const hasGatedPage = (sku?: string, features: Record<string, GatedFeature> = GATED_FEATURES) =>
  !!sku && Object.prototype.hasOwnProperty.call(features, sku)

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

/**
 * The add-on as an action, "Add a managed cluster" (the same words as pricing-api's
 * engine.AddonAction). The name loses its capital unless it is a brand or an acronym (Qovery, SSO),
 * and takes "a" or "an" when it reads as one thing: not for a quantity, a plural or a longer phrase
 * ("Add 500 build minutes", "Add HIPAA with BAA").
 */
export function addonAction(name?: string): string {
  let n = (name ?? '').trim()
  if (!n) return 'Add the add-on'
  const words = n.split(/\s+/)
  const first = words[0]
  const acronym = first.length > 1 && first.toUpperCase() === first && first.toLowerCase() !== first
  if (!acronym && !first.startsWith('Qovery') && /^[A-Z][a-z]+(?:[-'’][a-z]+)*$/.test(first))
    n = n[0].toLowerCase() + n.slice(1)
  const phrase = words.some((w) => {
    const x = w.toLowerCase().replace(/^[()[\]/.:;]+|[()[\]/.:;]+$/g, '')
    return (x.endsWith('s') && !x.endsWith('ss')) || ['on', 'per', 'with', 'for', 'of', 'in'].includes(x)
  })
  if (/^[0-9]/.test(first) || n.includes(',') || phrase) return `Add ${n}`
  const an = acronym ? 'AEFHILMNORSX'.includes(first[0]) : /^[aeiou]/i.test(n)
  return `Add ${an ? 'an' : 'a'} ${n}`
}

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
      const price =
        o.amount != null && o.amount > 0 && o.currency
          ? ` for ${shortMoney(o.amount, o.currency)}/${o.period ?? 'month'}`
          : ''
      return { icon, label: `${addonAction(o.addon_name)}${price}` }
    }
    case 'request_admin':
      return { icon, label: 'Ask an admin' }
    case 'contact_sales':
      return { icon, label: 'Talk to us' }
    case 'update_payment':
      return { icon, label: 'Update payment method' }
  }
}

/**
 * The dialog's short title (the page keeps the headline as its description, the dialog as its
 * subtitle). It says why, when the gate says: a limit in use is not "not in your plan".
 */
export function dialogTitle(title: string, reason?: GateReason): string {
  if (reason === 'limit_reached') return "You have reached your plan's limit"
  if (reason === 'not_in_plan' || reason === 'trial_used') {
    const last = title.trim().split(/\s+/).pop() ?? ''
    return `${title} ${last.endsWith('s') && !last.endsWith('ss') ? 'are' : 'is'} not in your plan`
  }
  return title
}

/** A "Free" plan or option is never a way to get a paid feature. */
const isFree = (o: PaywallOption) => /\bfree\b/i.test(gatedCta(o).label)

/**
 * The other ways, as small "Or ..." links under the main button: in the gate's order, never the
 * main button's action again, never a free plan, each action once.
 */
export function gatedOthers(options: PaywallOption[]): PaywallOption[] {
  const [primary, ...rest] = options
  if (!primary) return []
  const seen = new Set([gatedCta(primary).label])
  return rest.filter((o) => {
    const label = gatedCta(o).label
    if (seen.has(label) || isFree(o)) return false
    seen.add(label)
    return true
  })
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
  /** The recommended option (first), and the other ways, in the gate's order (gatedOthers). */
  primary?: PaywallOption
  others: PaywallOption[]
  /** Why it is locked, one sentence from pricing-api. */
  message: string
  media?: PaywallInfo['media']
  /** The previews to show, staff media first (gatedPreviews). */
  previews: GatedPreviews
}

/** At most this many capability lines on the page. */
export const MAX_CAPABILITIES = 6

/** The page for a gate's paywall: the gate's content first, the feature's entry for the rest. */
export function gatedPageView(p: PaywallInfo, features: Record<string, GatedFeature> = GATED_FEATURES): GatedPageView {
  const f = features[p.sku]
  const options = p.options.filter((option) => !isFree(option))
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
    chip: gatedChip({ options }),
    primary: options[0],
    others: gatedOthers(options),
    message: p.message ?? '',
    media: p.media,
    previews: gatedPreviews(p, f),
  }
}

/** The intro's chip: the plan that includes the feature. */
export function introChip(i: Pick<GateIntro, 'plan'>): string {
  return i.plan?.name ? `Included in your ${i.plan.name} plan` : 'Included in your plan'
}

/**
 * The page for an intro (a feature the plan already includes): the same content as the paywall,
 * the chip says it is included, and no option: the page's one button is the intro's Continue.
 */
export function introPageView(i: GateIntro, features: Record<string, GatedFeature> = GATED_FEATURES): GatedPageView {
  const v = gatedPageView(
    {
      sku: i.sku,
      title: i.title,
      headline: i.headline,
      benefits: i.benefits,
      media: i.media,
      claude_media: i.claude_media,
      learn_more_url: i.learn_more_url,
      message: '',
      options: [],
      audience: 'billing',
    },
    features
  )
  return { ...v, chip: introChip(i), primary: undefined, others: [] }
}

const fromGate = (m: { url: string; kind: 'image' | 'video' }): GatedMedia =>
  m.kind === 'video' ? { video: [m.url] } : { image: m.url }

/** The previews: what staff set on the gate wins, slot by slot (media = console, claude_media = Claude Code). */
export function gatedPreviews(p: Pick<PaywallInfo, 'media' | 'claude_media'>, f?: GatedFeature): GatedPreviews {
  const out: GatedPreviews = {}
  const inConsole = p.media ? fromGate(p.media) : f?.media?.console
  const claude = p.claude_media ? fromGate(p.claude_media) : f?.media?.claude
  if (inConsole) out.console = inConsole
  if (claude) out.claude = claude
  return out
}

/** The tabs of the preview switch, in order. The switch shows only when there are two. */
export const previewTabs = (previews: GatedPreviews): GatedPreviewTab[] =>
  (['console', 'claude'] as const).filter((t) => !!previews[t])

export const PREVIEW_TAB_LABEL: Record<GatedPreviewTab, string> = { console: 'Console', claude: 'Coding Agent' }

/**
 * How to show one preview: the loop when motion is fine; the still under reduced motion (or a
 * paused video on its first frame when staff gave only a video); nothing without media.
 */
export function previewRender(
  m: GatedMedia | undefined,
  reducedMotion: boolean
): 'video' | 'image' | 'paused-video' | 'none' {
  if (!m) return 'none'
  if (m.video?.length && !reducedMotion) return 'video'
  if (m.image) return 'image'
  if (m.video?.length) return 'paused-video'
  return 'none'
}

/** The still for the small dialog: staff media first, else the console preview's still or poster. */
export function dialogImage(
  p: Pick<PaywallInfo, 'sku' | 'media'>,
  features: Record<string, GatedFeature> = GATED_FEATURES
): string | undefined {
  if (p.media) return undefined
  const m = features[p.sku]?.media?.console
  return m?.image ?? m?.poster
}
