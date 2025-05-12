import { useDeferredValue, useEffect } from 'react'
import { Hits, SearchBox, useInstantSearch } from 'react-instantsearch'
import { useIntercom } from 'react-use-intercom'
import { match } from 'ts-pattern'
import { ExternalLink, Icon, InputSearch } from '@qovery/shared/ui'
import { QOVERY_FEEDBACK_URL, QOVERY_FORUM_URL, QOVERY_STATUS_URL } from '@qovery/shared/util-const'
import { twMerge } from '@qovery/shared/util-js'
import { INSTATUS_APP_ID } from '@qovery/shared/util-node-env'
import { AssistantIconSwitcher } from '../assistant-icon-switcher/assistant-icon-switcher'
import { DotStatus } from '../dot-status/dot-status'
import { Hit } from '../hit/hit'
import { useContextualDocLinks } from '../hooks/use-contextual-doc-links/use-contextual-doc-links'
import { useQoveryStatus } from '../hooks/use-qovery-status/use-qovery-status'

export interface AssistantPanelProps {
  onClose: () => void
  smaller?: boolean
}

export function AssistantPanel({ smaller = false, onClose }: AssistantPanelProps) {
  const { data } = useQoveryStatus()
  const { showMessages: showIntercomMessenger } = useIntercom()
  const { setIndexUiState, indexUiState } = useInstantSearch()
  const docLinks = useContextualDocLinks()
  const valueDoc = useDeferredValue(indexUiState.query ?? '')

  const appStatus = data?.find(({ id }) => id === INSTATUS_APP_ID)

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <div
      className={twMerge(
        'fixed right-0 flex w-[368px] animate-slidein-right-md-faded flex-col border-l border-neutral-200 bg-white shadow-sm dark:border-neutral-500 dark:bg-neutral-600',
        smaller ? 'top-[70px] min-h-page-container-wprogressbar' : 'top-[4rem] min-h-page-container'
      )}
    >
      <div className="flex justify-between px-5 pt-5">
        <div className="flex gap-3 font-bold">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-purple-500 text-sm text-white dark:text-neutral-700">
            <Icon name="icon-solid-lightbulb" />
          </span>
          <span className="text-neutral-500 dark:text-white">Helper</span>
        </div>
        <button type="button" onClick={onClose}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-neutral-350 duration-300 ease-out hover:bg-neutral-250 hover:text-neutral-400 dark:bg-neutral-500 dark:text-neutral-250 dark:hover:bg-brand-500 dark:hover:text-white">
            <Icon name="icon-solid-xmark" />
          </span>
        </button>
      </div>
      <div className="flex grow flex-col divide-y divide-neutral-200 dark:divide-neutral-500">
        {docLinks.length > 0 && (
          <div className="space-y-5 p-5 text-neutral-400">
            <span className="font-semibold">How does it works</span>
            <div className="flex flex-col space-y-3 text-sm">
              {docLinks.map(({ label, link }) => (
                <ExternalLink key={`${label}${link}`} href={link}>
                  {label}
                </ExternalLink>
              ))}
            </div>
          </div>
        )}
        <div className="flex min-h-0 grow flex-col p-5">
          <SearchBox className="hidden" />
          <InputSearch
            className="mb-5"
            placeholder="Search documentation..."
            onChange={(value: string) => {
              setIndexUiState((prevIndexUiState) => ({
                ...prevIndexUiState,
                query: value,
              }))
            }}
          />
          {valueDoc.length > 0 && (
            <Hits
              classNames={{ list: 'space-y-5' }}
              className="flex min-h-0 shrink-0 grow basis-0 overflow-y-auto"
              hitComponent={Hit}
            />
          )}
        </div>
        <button
          className="flex h-11 items-center justify-center gap-1.5 px-5 font-medium text-neutral-400 transition hover:bg-neutral-150 dark:text-white dark:hover:bg-neutral-550"
          type="button"
          onClick={() => {
            showIntercomMessenger()
            onClose()
          }}
        >
          <Icon iconName="robot" className="text-brand-500" />
          <span className="text-sm">Contact support</span>
        </button>
        <a
          className="flex h-11 items-center justify-center gap-1.5 px-5 font-medium text-neutral-400 transition hover:bg-neutral-150 dark:text-white dark:hover:bg-neutral-550"
          href={QOVERY_FORUM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon iconName="user-group" className="text-brand-500" />
          <span className="text-sm">Community forum</span>
        </a>
        <a
          className="flex h-11 items-center justify-center gap-1.5 px-5 font-medium text-neutral-400 transition hover:bg-neutral-150 dark:text-white dark:hover:bg-neutral-550"
          href={QOVERY_FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon iconName="comment-lines" className="text-brand-500" />
          <span className="text-sm">Feedback</span>
        </a>
        {appStatus && appStatus.status ? (
          <div className="relative">
            <a
              className="flex h-10 items-center justify-center gap-2 px-5 text-xs text-neutral-350 transition hover:bg-neutral-150 dark:text-neutral-250 dark:hover:bg-neutral-550"
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
            <div className="absolute inset-y-0 right-2 flex items-center">
              <AssistantIconSwitcher />
            </div>
          </div>
        ) : (
          <div className="h-10"></div>
        )}
      </div>
    </div>
  )
}

export default AssistantPanel
