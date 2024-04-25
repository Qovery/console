import { useDeferredValue, useEffect } from 'react'
import { Hits, SearchBox, useInstantSearch } from 'react-instantsearch'
import { useIntercom } from 'react-use-intercom'
import { match } from 'ts-pattern'
import { ExternalLink, Icon, InputSearch } from '@qovery/shared/ui'
import { QOVERY_FEEDBACK_URL, QOVERY_FORUM_URL, QOVERY_STATUS_URL } from '@qovery/shared/util-const'
import { twMerge } from '@qovery/shared/util-js'
import { INSTATUS_APP_ID } from '@qovery/shared/util-node-env'
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
        'flex flex-col bg-white dark:bg-neutral-600 border-l border-neutral-200 dark:border-neutral-500 w-[368px] fixed right-0 shadow-sm animate-slidein-right-md-faded',
        smaller ? 'min-h-page-container-wprogressbar top-[70px]' : 'min-h-page-container top-[4rem]'
      )}
    >
      <div className="flex justify-between px-5 pt-5">
        <div className="flex gap-3 font-bold">
          <span className="flex justify-center items-center rounded bg-purple-500 w-6 h-6 text-sm text-white dark:text-neutral-700">
            <Icon name="icon-solid-lightbulb" />
          </span>
          <span className="text-neutral-500 dark:text-white">Helper</span>
        </div>
        <button type="button" onClick={onClose}>
          <span className="flex w-7 h-7 items-center justify-center bg-neutral-200 dark:bg-neutral-500 text-neutral-350 dark:text-neutral-250 hover:text-neutral-400 dark:hover:text-white hover:bg-neutral-250 dark:hover:bg-brand-500 ease-out duration-300 rounded-full">
            <Icon name="icon-solid-xmark" />
          </span>
        </button>
      </div>
      <div className="flex flex-col grow divide-y divide-neutral-200 dark:divide-neutral-500">
        {docLinks.length > 0 && (
          <div className="text-neutral-400 space-y-5 p-5">
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
        <div className="flex flex-col grow min-h-0 p-5">
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
              className="min-h-0 flex grow shrink-0 basis-0 overflow-y-auto"
              hitComponent={Hit}
            />
          )}
        </div>
        <button
          className="flex justify-center items-center gap-1.5 px-5 h-11 text-neutral-400 dark:text-white font-medium hover:bg-neutral-150 dark:hover:bg-neutral-550 transition"
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
          className="flex justify-center items-center gap-1.5 px-5 h-11 text-neutral-400 dark:text-white font-medium hover:bg-neutral-150 dark:hover:bg-neutral-550 transition"
          href={QOVERY_FORUM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon iconName="user-group" className="text-brand-500" />
          <span className="text-sm">Community forum</span>
        </a>
        <a
          className="flex justify-center items-center gap-1.5 px-5 h-11 text-neutral-400 dark:text-white font-medium hover:bg-neutral-150 dark:hover:bg-neutral-550 transition"
          href={QOVERY_FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon iconName="comment-lines" className="text-brand-500" />
          <span className="text-sm">Feedback</span>
        </a>
        {appStatus && appStatus.status ? (
          <a
            className="flex items-center justify-center gap-2 px-5 h-10 text-xs text-neutral-350 dark:text-neutral-250 hover:bg-neutral-150 dark:hover:bg-neutral-550 transition"
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
    </div>
  )
}

export default AssistantPanel
