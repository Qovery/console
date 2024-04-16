import { useDeferredValue } from 'react'
import { Hits, SearchBox, useInstantSearch } from 'react-instantsearch'
import { useIntercom } from 'react-use-intercom'
import { match } from 'ts-pattern'
import { ExternalLink, Icon, InputSearch } from '@qovery/shared/ui'
import { DotStatus } from '../dot-status/dot-status'
import { Hit } from '../hit/hit'
import { useContextualDocLinks } from '../hooks/use-contextual-doc-links/use-contextual-doc-links'
import { useQoveryStatus } from '../hooks/use-qovery-status/use-qovery-status'

export interface AssistantPanelProps {
  onClose: () => void
}

export function AssistantPanel({ onClose }: AssistantPanelProps) {
  const { data } = useQoveryStatus()
  const { showMessages: showIntercomMessenger } = useIntercom()
  const { setIndexUiState, indexUiState } = useInstantSearch()
  const docLinks = useContextualDocLinks()
  const valueDoc = useDeferredValue(indexUiState.query ?? '')

  // TODO turn into env var
  const INSTATUS_APP_ID = 'ckufh5o901496598atoppn8ub2lk'
  const QOVERY_FORUM_URL = 'https://discuss.qovery.com/'
  const QOVERY_STATUS_URL = 'https://status.qovery.com/'
  const appStatus = data?.find(({ id }) => id === INSTATUS_APP_ID)

  return (
    <div className="flex flex-col bg-white border-l border-neutral-200 w-[368px] min-h-page-container fixed right-0 top-[4rem] shadow-sm">
      <div className="flex justify-between px-5 pt-5">
        <div className="flex gap-3 font-bold">
          <span className="flex justify-center items-center rounded bg-purple-500 w-6 h-6 text-sm text-white">
            <Icon name="icon-solid-lightbulb" />
          </span>
          <span className="text-neutral-500">Helper</span>
        </div>
        <button type="button" onClick={onClose}>
          <span className="flex w-7 h-7 items-center justify-center bg-neutral-200 text-neutral-350 hover:text-neutral-400 hover:bg-neutral-250 ease-out duration-300 rounded-full">
            <Icon name="icon-solid-xmark" />
          </span>
        </button>
      </div>
      <div className="flex flex-col grow divide-y divide-neutral-200">
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
          className="flex justify-center items-center gap-1.5 px-5 py-4 text-neutral-400 font-medium"
          type="button"
          onClick={() => showIntercomMessenger()}
        >
          <Icon iconName="robot" className="text-brand-500" />
          <span className="text-sm">Contact support</span>
        </button>
        <a
          href={QOVERY_FORUM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center gap-1.5 px-5 py-4 text-neutral-400 font-medium"
        >
          <Icon iconName="user-group" className="text-brand-500" />
          <span className="text-sm">Community forum</span>
        </a>
        {appStatus && appStatus.status && (
          <a
            href={QOVERY_STATUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs text-neutral-350"
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
        )}
      </div>
    </div>
  )
}

export default AssistantPanel
