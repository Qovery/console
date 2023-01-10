import { ClusterLogsError } from 'qovery-typescript-axios'
import { ReactNode, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button, { ButtonSize, ButtonStyle } from '../../../buttons/button/button'
import CopyToClipboard from '../../../copy-to-clipboard/copy-to-clipboard'
import Icon from '../../../icon/icon'
import Link from '../../../link/link'
import Tabs from '../../../tabs/tabs'
import Tooltip from '../../../tooltip/tooltip'
import Truncate from '../../../truncate/truncate'
import { ErrorLogsProps } from '../layout-logs'

export const enum TabsLogsSection {
  INFORMATION = 'INFORMATION',
  ERROR = 'ERROR',
}

export interface TabsLogsProps {
  scrollToError: () => void
  tabInformation?: ReactNode
  errors?: ErrorLogsProps[]
  defaultSection?: TabsLogsSection
}

export function TabsLogs(props: TabsLogsProps) {
  const { scrollToError, tabInformation, errors, defaultSection = TabsLogsSection.INFORMATION } = props

  const { organizationId = '' } = useParams()

  const [section, setSection] = useState(errors && errors?.length > 0 ? TabsLogsSection.ERROR : defaultSection)

  const [displayFullError, setDisplayFullError] = useState(false)

  const items = [
    {
      name: 'Information',
      active: section === TabsLogsSection.INFORMATION,
      onClick: () => setSection(TabsLogsSection.INFORMATION),
    },
    {
      name: (
        <p className="font-medium text-sm">
          Error{' '}
          {errors && errors.length > 0 && (
            <span className="relative -top-px text-xs ml-2 px-1 h-4 bg-error-500 text-text-100 rounded-sm">1</span>
          )}
        </p>
      ),
      active: section === TabsLogsSection.ERROR,
      onClick: () => setSection(TabsLogsSection.ERROR),
    },
  ]

  const currentError = errors && errors.length > 0 && errors[errors.length - 1].error
  const truncateErrorMessage =
    currentError && currentError.underlying_error?.message?.slice(0, !displayFullError ? 240 : Infinity)

  return (
    <div
      data-testid="tabs-logs"
      className="w-[360px] h-[100vh-64px] shrink-0 border-l border-t border-element-light-darker-100 bg-element-light-darker-400"
    >
      <div className="py-2 px-5">
        <Tabs className="bg-transparent" classNameBtn="grow justify-center" items={items} fullWidth />
        <div data-testid="sections" className="mt-6">
          {section === TabsLogsSection.INFORMATION && tabInformation}
          {section === TabsLogsSection.ERROR && (
            <>
              {currentError ? (
                <>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-error-500 mr-3">
                      <Icon name="icon-solid-triangle-exclamation" className="text-text-100" />
                    </div>
                    <div>
                      <Tooltip content={currentError.tag || ''}>
                        <p className="text-text-100 font-medium">
                          <Truncate text={currentError.tag || ''} truncateLimit={28} />
                        </p>
                      </Tooltip>
                      <span data-testid="error-line" className="text-text-400 text-xs">
                        Line {errors[errors.length - 1].index} - After {errors[errors.length - 1].timeAgo} minute
                        {parseInt(errors[errors.length - 1].timeAgo || '', 10) > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`bg-element-light-darker-500 mt-4 p-2 rounded ml-8 ${
                      (currentError.underlying_error?.message || '').length > 240
                        ? 'cursor-pointer select-none hover:bg-element-light-darker-400 transition-all ease-in-out duration-150'
                        : ''
                    }`}
                    onClick={() =>
                      (errors[0].error?.underlying_error?.message || '')?.length > 240 &&
                      setDisplayFullError(!displayFullError)
                    }
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-error-500 text-xs font-medium">Full error</p>
                      <div className="flex text-xs">
                        <p
                          onClick={() => scrollToError()}
                          className="transition-colors cursor-pointer text-error-500 hover:text-error-600 font-bold mr-2.5"
                        >
                          <span className="text-xxs relative -top-px mr-1">{errors[errors.length - 1].index}</span>
                          <Icon name="icon-solid-arrow-circle-right" className="cursor-pointer" />
                        </p>
                        <CopyToClipboard
                          className="text-text-300 hover:text-text-100"
                          content={`Transmitter: ${
                            (errors[0].error as ClusterLogsError).event_details?.transmitter?.name
                          } - ${errors[0].error?.underlying_error?.message}`}
                        />
                      </div>
                    </div>
                    <p data-testid="error-msg" className="relative text-text-200 text-xs">
                      Transmitter: {(currentError as ClusterLogsError).event_details?.transmitter?.name} -{' '}
                      {truncateErrorMessage}
                      {!displayFullError && (currentError.underlying_error?.message || '').length > 240 && (
                        <>
                          ...
                          <Icon name="icon-solid-angle-down" className="absolute right-0 bottom-0" />
                        </>
                      )}
                    </p>
                  </div>
                  {currentError.hint_message && (
                    <div className="bg-element-light-darker-300 mt-3 p-2 rounded ml-8">
                      <p className="text-xs text-accent2-400 font-medium mb-1">Solution</p>
                      <p data-testid="solution-msg" className="text-text-100 text-xs mb-2">
                        {currentError.hint_message}
                      </p>
                      <Button
                        className="mr-2"
                        iconLeft="icon-solid-wheel"
                        external
                        link={`https://console.qovery.com/platform/organization/${organizationId}/settings/clusters`}
                        style={ButtonStyle.BASIC}
                        size={ButtonSize.TINY}
                      >
                        Cluster settings
                      </Button>
                      {currentError.link && (
                        <Button
                          iconLeft="icon-solid-book"
                          external
                          link={currentError.link}
                          style={ButtonStyle.STROKED}
                          size={ButtonSize.TINY}
                        >
                          Documentation
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div data-testid="no-error-screen" className="text-center px-3 py-6">
                  <Icon name="icon-solid-wave-pulse" className="text-text-400" />
                  <p className="text-text-400 font-medium text-xs mt-1">No error available</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {section === TabsLogsSection.ERROR && (
        <div className="px-5 py-6 border-t border-element-light-darker-200 mt-5">
          <p className="text-text-400 text-sm mb-3">Need more help?</p>
          <Link
            className="font-medium"
            link="https://discuss.qovery.com"
            linkLabel="Ask for support on our forum"
            external
            iconRight="icon-solid-arrow-up-right-from-square"
          />
        </div>
      )}
    </div>
  )
}

export default TabsLogs
