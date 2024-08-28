import { type ClusterLogsError } from 'qovery-typescript-axios'
import { type ReactNode, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CLUSTERS_GENERAL_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { CopyToClipboardButtonIcon, ExternalLink, Icon, Link, Tabs, Tooltip, Truncate } from '@qovery/shared/ui'
import { type ErrorLogsProps } from '../layout-logs'

export const enum TabsClusterLogsSection {
  INFORMATION = 'INFORMATION',
  ERROR = 'ERROR',
}

export interface TabsClusterLogsProps {
  scrollToError: () => void
  tabInformation?: ReactNode
  errors?: ErrorLogsProps[]
  defaultSection?: TabsClusterLogsSection
}

export function TabsClusterLogs(props: TabsClusterLogsProps) {
  const { scrollToError, tabInformation, errors, defaultSection = TabsClusterLogsSection.INFORMATION } = props

  const { organizationId = '' } = useParams()

  const [section, setSection] = useState(errors && errors?.length > 0 ? TabsClusterLogsSection.ERROR : defaultSection)

  const [displayFullError, setDisplayFullError] = useState(false)

  const items = [
    {
      name: 'Information',
      active: section === TabsClusterLogsSection.INFORMATION,
      onClick: () => setSection(TabsClusterLogsSection.INFORMATION),
    },
    {
      name: (
        <p className="text-sm font-medium">
          Error{' '}
          {errors && errors.length > 0 && (
            <span className="relative -top-px ml-2 h-4 rounded-sm bg-red-500 px-1 text-xs text-neutral-50">1</span>
          )}
        </p>
      ),
      active: section === TabsClusterLogsSection.ERROR,
      onClick: () => setSection(TabsClusterLogsSection.ERROR),
    },
  ]

  const currentError = errors && errors.length > 0 && errors[errors.length - 1].error
  const truncateErrorMessage =
    currentError && currentError.underlying_error?.message?.slice(0, !displayFullError ? 240 : Infinity)

  return (
    <div data-testid="tabs-logs" className="relative h-[calc(100%+0.5rem)] w-[360px] shrink-0 bg-neutral-650">
      <div className="px-5 py-2">
        <Tabs className="bg-transparent" classNameBtn="grow justify-center" items={items} fullWidth />
        <div data-testid="sections" className="mt-6">
          {section === TabsClusterLogsSection.INFORMATION && tabInformation}
          {section === TabsClusterLogsSection.ERROR && (
            <div>
              {currentError ? (
                <>
                  <div className="flex items-center">
                    <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500">
                      <Icon name="icon-solid-triangle-exclamation" className="text-neutral-50" />
                    </div>
                    <div>
                      <Tooltip content={currentError.tag || ''}>
                        <p className="font-medium text-neutral-50">
                          <Truncate text={currentError.tag || ''} truncateLimit={28} />
                        </p>
                      </Tooltip>
                      <span data-testid="error-line" className="text-xs text-neutral-350">
                        Line {errors[errors.length - 1].index} - After {errors[errors.length - 1].timeAgo} minute
                        {parseInt(errors[errors.length - 1].timeAgo || '', 10) > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`ml-8 mt-4 rounded bg-neutral-700 p-2 ${
                      (currentError.underlying_error?.message || '').length > 240
                        ? 'cursor-pointer select-none transition-all duration-150 ease-in-out hover:bg-neutral-650'
                        : ''
                    }`}
                    onClick={() =>
                      (errors[0].error?.underlying_error?.message || '')?.length > 240 &&
                      setDisplayFullError(!displayFullError)
                    }
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-xs font-medium text-red-500">Full error</p>
                      <div className="flex text-xs">
                        <p
                          onClick={() => scrollToError()}
                          className="mr-2.5 cursor-pointer font-bold text-red-500 transition-colors hover:text-red-600"
                        >
                          <span className="relative -top-px mr-1 text-2xs">{errors[errors.length - 1].index}</span>
                          <Icon name="icon-solid-arrow-circle-right" className="cursor-pointer" />
                        </p>
                        <CopyToClipboardButtonIcon
                          className="text-neutral-300 hover:text-neutral-50"
                          content={`Transmitter: ${
                            (errors[0].error as ClusterLogsError).event_details?.transmitter?.name
                          } - ${errors[0].error?.underlying_error?.message}`}
                        />
                      </div>
                    </div>
                    <p data-testid="error-msg" className="relative text-xs text-neutral-100">
                      Transmitter: {(currentError as ClusterLogsError).event_details?.transmitter?.name} -{' '}
                      {truncateErrorMessage}
                      {!displayFullError && (currentError.underlying_error?.message || '').length > 240 && (
                        <>
                          ...
                          <Icon name="icon-solid-angle-down" className="absolute bottom-0 right-0" />
                        </>
                      )}
                    </p>
                  </div>
                  {currentError.hint_message && (
                    <div className="ml-8 mt-3 rounded bg-neutral-600 p-2">
                      <p className="mb-1 text-xs font-medium text-sky-400">Solution</p>
                      <p data-testid="solution-msg" className="mb-2 text-xs text-neutral-50">
                        {currentError.hint_message}
                      </p>
                      <Link
                        as="button"
                        color="neutral"
                        variant="surface"
                        size="md"
                        to={CLUSTERS_URL(organizationId) + CLUSTERS_GENERAL_URL}
                        className="mr-2 gap-1"
                      >
                        Cluster settings
                        <Icon iconName="gear" />
                      </Link>
                      {currentError.link && (
                        <ExternalLink as="button" href={currentError.link} className="gap-1" size="md">
                          Documentation
                          <Icon iconName="book" />
                        </ExternalLink>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div data-testid="no-error-screen" className="px-3 py-6 text-center">
                  <Icon name="icon-solid-wave-pulse" className="text-neutral-350" />
                  <p className="mt-1 text-xs font-medium text-neutral-350">No error available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {section === TabsClusterLogsSection.ERROR && (
        <div className="mt-5 border-t border-neutral-550 px-5 py-6">
          <p className="mb-3 text-sm text-neutral-350">Need more help?</p>
          <ExternalLink href="https://discuss.qovery.com">Ask for support on our forum</ExternalLink>
        </div>
      )}
    </div>
  )
}

export default TabsClusterLogs
