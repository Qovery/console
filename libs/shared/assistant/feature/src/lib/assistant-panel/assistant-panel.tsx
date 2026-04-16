import { motion, useReducedMotion } from 'framer-motion'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { match } from 'ts-pattern'
import { ExternalLink, Icon, InputSearch, LoaderSpinner } from '@qovery/shared/ui'
import { QOVERY_STATUS_URL } from '@qovery/shared/util-const'
import { useDebounce, useSupportChat } from '@qovery/shared/util-hooks'
import { INSTATUS_APP_ID } from '@qovery/shared/util-node-env'
import { DotStatus } from '../dot-status/dot-status'
import { useContextualDocLinks } from '../hooks/use-contextual-doc-links/use-contextual-doc-links'
import { useSearchDocumentation } from '../hooks/use-mintlify-search/use-mintlify-search'
import { useQoveryStatus } from '../hooks/use-qovery-status/use-qovery-status'
import { MintlifyHit } from '../mintlify-hit/mintlify-hit'

export interface AssistantPanelProps {
  onClose: () => void
  smaller?: boolean
  compactTopOffset?: boolean
}

export function AssistantPanel({ smaller = false, compactTopOffset = false, onClose }: AssistantPanelProps) {
  const { data } = useQoveryStatus()
  const { showChat } = useSupportChat()
  const docLinks = useContextualDocLinks()
  const [searchValue, setSearchValue] = useState('')
  const shouldReduceMotion = useReducedMotion()
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const { data: results = [], isLoading } = useSearchDocumentation(debouncedSearchValue)

  const appStatus = data?.find(({ id }) => id === INSTATUS_APP_ID)

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onClose])

  const portalTarget = typeof document !== 'undefined' ? document.body : null

  const topOffset = smaller ? 'calc(6.75rem + 6px)' : compactTopOffset ? 'calc(2.75rem + 1px)' : 'calc(6.75rem + 1px)'
  const panelHeight = `calc(100dvh - ${topOffset})`

  if (!portalTarget) {
    return null
  }

  return createPortal(
    <motion.div
      initial={shouldReduceMotion ? false : { top: topOffset, height: panelHeight, x: 32, opacity: 0 }}
      animate={{ top: topOffset, height: panelHeight, x: 0, opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { x: 32, opacity: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              top: {
                duration: 0.12,
                ease: [0.2, 0, 0, 1],
              },
              height: {
                duration: 0.12,
                ease: [0.2, 0, 0, 1],
              },
              x: {
                type: 'spring',
                stiffness: 900,
                damping: 40,
                mass: 0.5,
              },
              opacity: {
                duration: 0.12,
              },
            }
      }
      className="fixed right-0 z-overlay flex w-[368px] flex-col overflow-hidden border-l border-neutral bg-background shadow-sm will-change-[top,height,transform]"
    >
      <div className="flex justify-between px-5 pt-5">
        <div className="flex gap-3 font-bold">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-brand-solid text-sm text-neutralInvert">
            <Icon iconName="lightbulb" />
          </span>
          <span className="text-neutral">Helper</span>
        </div>
        <button type="button" onClick={onClose}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-neutral-subtle text-neutral-subtle duration-300 ease-out hover:bg-surface-brand-component hover:text-brand">
            <Icon iconName="xmark" />
          </span>
        </button>
      </div>
      <div className="flex grow flex-col divide-y divide-neutral">
        {docLinks.length > 0 && (
          <div className="space-y-5 p-5 text-neutral">
            <span className="font-semibold">How does it works</span>
            <div className="flex flex-col space-y-3 text-sm">
              {docLinks.map(({ label, link }) => (
                <ExternalLink className="inline [&>i]:ml-1" key={`${label}${link}`} href={link}>
                  {label}
                </ExternalLink>
              ))}
            </div>
          </div>
        )}
        <div className="flex min-h-0 grow flex-col p-5">
          <InputSearch
            className="mb-5"
            placeholder="Search documentation…"
            onChange={(value: string) => {
              setSearchValue(value)
            }}
            autofocus
          />
          {debouncedSearchValue.length > 0 && (
            <div className="flex min-h-0 shrink-0 grow basis-0 flex-col space-y-5 overflow-y-auto">
              {isLoading && (
                <div className="flex justify-center">
                  <LoaderSpinner />
                </div>
              )}
              {!isLoading && results.length === 0 && (
                <div className="text-sm text-neutral-subtle">No results found</div>
              )}
              {!isLoading && results.map((result, index) => <MintlifyHit key={index} result={result} />)}
            </div>
          )}
        </div>
        <button
          className="flex h-11 items-center justify-center gap-1.5 px-5 font-medium text-neutral transition hover:bg-surface-neutral-subtle"
          type="button"
          onClick={() => {
            showChat()
            onClose()
          }}
        >
          <Icon iconName="robot" className="text-brand" />
          <span className="text-sm">Contact support</span>
        </button>
        <button
          className="flex h-11 items-center justify-center gap-1.5 px-5 font-medium text-neutral transition hover:bg-surface-neutral-subtle"
          type="button"
          onClick={() => {
            posthog.capture('feedback_button_clicked_new_navigation')
            onClose()
          }}
        >
          <Icon iconName="comment-lines" className="text-brand" />
          <span className="text-sm">Feedback</span>
        </button>
        {appStatus && appStatus.status ? (
          <a
            className="flex h-10 items-center justify-center gap-2 px-5 text-xs text-neutral-subtle transition hover:bg-surface-neutral-subtle"
            href={QOVERY_STATUS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>
              {match(appStatus)
                .with({ status: 'OPERATIONAL' }, () => 'All systems operational')
                .with({ status: 'MAJOROUTAGE' }, () => 'Major outage ongoing')
                .with({ status: 'MINOROUTAGE' }, () => 'Minor outage ongoing')
                .with({ status: 'PARTIALOUTAGE' }, () => 'Partial outage ongoing')
                .exhaustive()}
            </span>
            <DotStatus
              color={match(appStatus)
                .with({ status: 'OPERATIONAL' }, () => 'green' as const)
                .with({ status: 'MAJOROUTAGE' }, () => 'red' as const)
                .with({ status: 'MINOROUTAGE' }, () => 'yellow' as const)
                .with({ status: 'PARTIALOUTAGE' }, () => 'yellow' as const)
                .exhaustive()}
            />
          </a>
        ) : (
          <div className="h-10"></div>
        )}
      </div>
    </motion.div>,
    portalTarget
  )
}

export default AssistantPanel
