/*
 * The full-page paywall: where the console has a page for a feature the plan does not include,
 * the page itself is the pitch. A top strip with the feature and how to get it, then two columns:
 * what it does, the button the gate decides (trial, upgrade, add-on, ask an admin, talk to us),
 * "Learn more" and the capabilities; and a faded, decorative preview of the feature in use: a
 * muted loop (its still under reduced motion), with a "Console | Coding Agent" switch when the
 * feature has both previews. Without media, the drawn preview (GatedPreviews.tsx).
 *
 *   const pw = usePaywall(client, organizationId, { actions: ['blueprint.create'] }, { variant: 'page' })
 *   if (pw.locked('blueprint.create')) return <GatedPage organizationId={organizationId} client={client} gate={pw.gate('blueprint.create')} />
 *
 * The button opens <Paywall> on that option's confirm step. "Not now" shows only with onClose.
 *
 * With intro (a feature the plan already includes, shown once per person): the same page, the chip
 * "Included in your <Plan> plan", and one button, the intro's Continue (onContinue), then Learn
 * more. No trial, upgrade or add-on. Shown, Continue and Not now are recorded (client.gateIntro).
 */
import * as Dialog from '@radix-ui/react-dialog'
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { Badge, Button, ExternalLink, Heading, Icon, SegmentedControl } from '@qovery/shared/ui'
import type { PricingClient } from '../data-access/client'
import { openPaymentMethodPage } from '../invoices/invoices-page'
import type { Gate, GateIntro, IntroAction, PaywallInfo, PaywallOption, PaywallOptionType } from '../types'
import { markIntroSeen } from '../utils/rules'
import {
  type GatedMedia,
  type GatedPreviewTab,
  PREVIEW_TAB_LABEL,
  gatedCta,
  gatedPageView,
  introPageView,
  previewRender,
  previewTabs,
} from './gated'
import { GatedPreview } from './gated-previews'
import { Paywall, type PaywallProps } from './paywall'

export interface GatedPageProps {
  organizationId: string
  client: PricingClient
  gate?: Gate
  paywall?: PaywallInfo
  /** The action, for the dialog's confirm steps (a paywall from core's 402). */
  action?: string
  /** "Not now": shown only when the page can be left (a page opened over another one). */
  onClose?: () => void
  onDone?: PaywallProps['onDone']
  onContactSales?: () => void
  onUpdatePayment?: () => void
  /** Over the whole window (the console opening it from a lock). Default: in the page's own flow. */
  overlay?: boolean
  /** Keep a route paywall open while the host refreshes its gate after confirmation. */
  keepOpenAfterDone?: boolean
  /** The intro of a feature the plan includes (gate.intro): shown when there is no paywall. */
  intro?: GateIntro
  /** The intro's Continue: go on with what the person was doing. */
  onContinue?: () => void
}

// The preview fades to the right and to the bottom: a taste, not a screenshot to read.
const FADE = {
  maskImage:
    'linear-gradient(to right, #000 55%, transparent 98%), linear-gradient(to bottom, #000 55%, transparent 98%)',
  WebkitMaskImage:
    'linear-gradient(to right, #000 55%, transparent 98%), linear-gradient(to bottom, #000 55%, transparent 98%)',
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
} as const

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const subscribeMotion = (onChange: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => undefined
  const m = window.matchMedia(REDUCED_MOTION)
  m.addEventListener?.('change', onChange)
  return () => m.removeEventListener?.('change', onChange)
}
const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.(REDUCED_MOTION).matches

/** True once the element has come near the viewport: the video loads only then. */
function useNearViewport<T extends Element>() {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (near || !el) return
    if (typeof IntersectionObserver === 'undefined') return setNear(true)
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [near])
  return [ref, near] as const
}

const MEDIA_CLASS = 'w-[760px] max-w-none rounded-lg border border-neutral'

/** One preview: the loop when motion is fine and the page is near, the still otherwise. Decorative. */
function PreviewMedia({ media, reducedMotion, near }: { media: GatedMedia; reducedMotion: boolean; near: boolean }) {
  const how = previewRender(media, reducedMotion)
  const sources = (media.video ?? []).map((src) => (
    <source key={src} src={src} type={/\.webm($|[?#])/i.test(src) ? 'video/webm' : 'video/mp4'} />
  ))
  if (how === 'video' && near) {
    return (
      <video
        key={media.video?.join()}
        data-testid="gated-preview-video"
        className={MEDIA_CLASS}
        poster={media.poster ?? media.image}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
      >
        {sources}
      </video>
    )
  }
  const still = how === 'image' ? media.image : media.poster ?? media.image
  if ((how === 'video' || how === 'image') && still)
    return (
      <img
        data-testid="gated-preview-image"
        src={still}
        alt=""
        loading="lazy"
        decoding="async"
        className={MEDIA_CLASS}
      />
    )
  if (how === 'paused-video' || how === 'video')
    return (
      <video
        key={media.video?.join()}
        className={MEDIA_CLASS}
        muted
        playsInline
        preload={near ? 'metadata' : 'none'}
        tabIndex={-1}
      >
        {sources}
      </video>
    )
  return null
}

export function GatedPage({
  organizationId,
  client,
  gate,
  paywall,
  action,
  onClose,
  onDone,
  onContactSales,
  onUpdatePayment,
  overlay,
  keepOpenAfterDone = false,
  intro: introProp,
  onContinue,
}: GatedPageProps) {
  const p = gate?.paywall ?? paywall
  const intro = p ? undefined : introProp
  const sku = p?.sku ?? intro?.sku ?? gate?.sku ?? ''
  const [open, setOpen] = useState<PaywallOption>()
  const [picked, setPicked] = useState<GatedPreviewTab>('console')
  const [previewPaused, setPreviewPaused] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false)
  const [previewRef, near] = useNearViewport<HTMLDivElement>()
  const acted = useRef(false)
  const finished = useRef(false)

  const event = useCallback(
    (ev: 'shown' | 'clicked' | 'dismissed', choice?: PaywallOptionType) => {
      if (sku && client.gateEvent && client.mode !== 'preview')
        client.gateEvent(organizationId, { sku, event: ev, choice }).catch(() => undefined)
    },
    [client, organizationId, sku]
  )
  // An intro is recorded apart from the paywall's funnel, per person; a failure never blocks.
  const introEvent = useCallback(
    (a: IntroAction) => {
      if (sku && client.gateIntro && client.mode !== 'preview')
        client.gateIntro(organizationId, { sku, action: a }).catch(() => undefined)
    },
    [client, organizationId, sku]
  )
  const isIntro = !!intro
  useEffect(() => {
    acted.current = false
    finished.current = false
    if (!sku) return
    if (!isIntro) {
      event('shown')
      return
    }
    if (client.mode !== 'preview') markIntroSeen(organizationId, sku)
    introEvent('shown')
  }, [sku, isIntro]) // eslint-disable-line react-hooks/exhaustive-deps

  const headingId = useId()
  if (!p && !intro) return null
  const view = p ? gatedPageView(p) : introPageView(intro as GateIntro)
  const primary = view.primary
  const primaryCta = primary && gatedCta(primary)
  const tabs = previewTabs(view.previews)
  const tab = tabs.includes(picked) ? picked : tabs[0]
  const media = tab ? view.previews[tab] : undefined
  const hasAnimatedPreview = !!media && previewRender(media, reducedMotion) === 'video'

  const choose = (o: PaywallOption) => {
    acted.current = true
    event('clicked', o.type)
    if (o.type === 'contact_sales') {
      onContactSales?.()
      onClose?.()
      return
    }
    if (o.type === 'update_payment') {
      if (onUpdatePayment) onUpdatePayment()
      else openPaymentMethodPage(client, organizationId).catch(() => undefined)
      onClose?.()
      return
    }
    setOpen(o)
  }
  const dismiss =
    onClose &&
    (() => {
      if (!acted.current) {
        if (intro) introEvent('dismissed')
        else event('dismissed')
      }
      onClose()
    })
  const goOn = () => {
    acted.current = true
    introEvent('continued')
    onContinue?.()
  }

  const heading = (
    <Heading level={1} id={overlay ? undefined : headingId} className="text-pretty">
      {view.title}
    </Heading>
  )
  const page = (
    <section
      aria-labelledby={overlay ? undefined : headingId}
      className="flex min-h-full w-full min-w-0 flex-col bg-background"
    >
      <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-neutral px-4 py-2 sm:px-6">
        <Icon iconName={view.icon as 'lock'} iconStyle="regular" className="text-sm text-neutral-subtle" />
        <span className="min-w-0 truncate text-sm font-medium text-neutral">{view.title}</span>
        <Badge color={intro ? 'green' : 'neutral'} variant="surface" size="sm" className="shrink-0 font-medium">
          {view.chip}
        </Badge>
        {client.mode === 'preview' && (
          <Badge color="yellow" variant="surface" size="sm" className="shrink-0 font-medium">
            Preview
          </Badge>
        )}
        {dismiss && (
          <Button size="sm" variant="plain" color="neutral" className="ml-auto" onClick={dismiss}>
            Not now
          </Button>
        )}
      </div>
      <div className="flex flex-1 items-center">
        <div className="mx-auto grid w-full min-w-0 max-w-[1200px] grid-cols-1 items-center gap-8 px-4 py-8 sm:px-6 min-[900px]:grid-cols-[340px_minmax(0,1fr)] min-[900px]:gap-12 min-[900px]:px-10 min-[900px]:py-16">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-2">
              {overlay ? <Dialog.Title asChild>{heading}</Dialog.Title> : heading}
              {view.description && <p className="text-sm leading-6 text-neutral-subtle">{view.description}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {intro && (
                <Button size="lg" color="brand" onClick={goOn}>
                  {intro.cta || 'Continue'}
                  <Icon iconName="arrow-right" iconStyle="regular" />
                </Button>
              )}
              {primary && primaryCta && (
                <Button size="lg" color="brand" onClick={() => choose(primary)}>
                  <Icon iconName={primaryCta.icon as 'plus'} iconStyle="regular" />
                  {primaryCta.label}
                </Button>
              )}
              {view.learnMoreUrl && (
                <ExternalLink as="button" size="lg" variant="outline" color="neutral" href={view.learnMoreUrl}>
                  Learn more
                </ExternalLink>
              )}
            </div>
            {view.others.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-subtle">
                <span>Or</span>
                {view.others.map((o) => (
                  <button
                    key={o.type + (o.plan ?? o.addon ?? '')}
                    type="button"
                    onClick={() => choose(o)}
                    className="text-neutral hover:underline"
                  >
                    {gatedCta(o).label}
                  </button>
                ))}
              </div>
            )}
            {view.capabilities.length > 0 && (
              <ul className="flex flex-col gap-3 border-t border-neutral pt-5">
                {view.capabilities.map((c) => (
                  <li key={c.label} className="flex items-start gap-3 text-sm text-neutral">
                    <Icon
                      iconName={c.icon as 'check'}
                      iconStyle="regular"
                      className="mt-0.5 w-4 shrink-0 text-center text-neutral-subtle"
                    />
                    <span className="min-w-0">{c.label}</span>
                  </li>
                ))}
              </ul>
            )}
            {view.message && <p className="text-sm text-neutral-subtle">{view.message}</p>}
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            {tabs.length > 1 && (
              <SegmentedControl.Root
                value={tab}
                onValueChange={(v) => setPicked(v as GatedPreviewTab)}
                aria-label="Preview"
                data-testid="gated-preview-switch"
                className="self-start text-xs"
              >
                {tabs.map((t) => (
                  <SegmentedControl.Item key={t} value={t}>
                    {PREVIEW_TAB_LABEL[t]}
                  </SegmentedControl.Item>
                ))}
              </SegmentedControl.Root>
            )}
            {hasAnimatedPreview && (
              <Button
                size="sm"
                variant="outline"
                color="neutral"
                className="self-start"
                onClick={() => setPreviewPaused((paused) => !paused)}
              >
                {previewPaused ? 'Play preview' : 'Pause preview'}
              </Button>
            )}
            <div
              ref={previewRef}
              aria-hidden="true"
              data-testid="gated-preview"
              className="pointer-events-none relative h-[280px] min-w-0 select-none overflow-hidden min-[900px]:h-[520px]"
              style={FADE}
            >
              <div className="origin-top-left scale-[0.62] min-[900px]:scale-100">
                {media ? (
                  <PreviewMedia media={media} reducedMotion={reducedMotion} near={near && !previewPaused} />
                ) : (
                  <GatedPreview
                    preview={view.preview}
                    title={view.title}
                    lines={view.capabilities.map((c) => c.label)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {open && (
        <Paywall
          organizationId={organizationId}
          client={client}
          gate={gate}
          paywall={paywall}
          action={action}
          startWith={open}
          onContactSales={onContactSales}
          onUpdatePayment={onUpdatePayment}
          onClose={() => {
            setOpen(undefined)
            if (finished.current && !keepOpenAfterDone) onClose?.()
          }}
          onDone={(what) => {
            finished.current = true
            onDone?.(what)
          }}
        />
      )}
    </section>
  )
  if (!overlay) return page
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) dismiss?.()
      }}
    >
      <Dialog.Portal>
        <Dialog.Content aria-describedby={undefined} className="fixed inset-0 z-overlay overflow-y-auto bg-background">
          {page}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
