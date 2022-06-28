import { ReactNode, useState } from 'react'
import { useParams } from 'react-router'
import {
  Link,
  Button,
  ButtonSize,
  ButtonStyle,
  Icon,
  Tabs,
  Tooltip,
  Truncate,
  ErrorLogsProps,
} from '@console/shared/ui'
import { ClusterLogsError } from 'qovery-typescript-axios'

export const enum TabsLogsSection {
  INFORMATION = 'INFORMATION',
  ERROR = 'ERROR',
}

export interface TabsLogsProps {
  tabInformation?: ReactNode
  errors?: ErrorLogsProps[]
  defaultSection?: TabsLogsSection
}

export function TabsLogs(props: TabsLogsProps) {
  const { tabInformation, errors, defaultSection = TabsLogsSection.INFORMATION } = props

  const { organizationId = '' } = useParams()

  const [section, setSection] = useState(errors && errors?.length > 0 ? TabsLogsSection.ERROR : defaultSection)

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
            <span className="relative top-[-1px] text-xs ml-2 px-1 h-4 bg-error-500 text-text-100 rounded-sm">1</span>
          )}
        </p>
      ),
      active: section === TabsLogsSection.ERROR,
      onClick: () => setSection(TabsLogsSection.ERROR),
    },
  ]

  const copyToClipboard = (error: ClusterLogsError) => {
    navigator.clipboard.writeText(`Transmitter: ${error.event_details?.transmitter?.name} -
      ${error.underlying_error?.message}`)
  }

  return (
    <div className="w-[360px] shrink-0 border-l border-t border-element-light-darker-100">
      <div className="py-2 px-5">
        <Tabs className="bg-transparent" classNameBtn="grow justify-center" items={items} isDark fullWidth />
        <div data-testid="sections" className="mt-6">
          {section === TabsLogsSection.INFORMATION && tabInformation}
          {section === TabsLogsSection.ERROR && (
            <>
              {errors && errors.length > 0 && errors[errors.length - 1].error ? (
                <>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-error-500 mr-3">
                      <Icon name="icon-solid-triangle-exclamation" className="text-text-100" />
                    </div>
                    <div>
                      <Tooltip content={errors[errors.length - 1].error.tag || ''}>
                        <p className="text-text-100 font-medium">
                          <Truncate text={errors[errors.length - 1].error.tag || ''} truncateLimit={28} />
                        </p>
                      </Tooltip>
                      <span data-testid="error-line" className="text-text-400 text-xs">
                        Line {errors[errors.length - 1].index}{' '}
                      </span>
                    </div>
                  </div>
                  <div className="bg-element-light-darker-500 mt-4 p-2 rounded ml-8">
                    <div className="flex items-center justify-between">
                      <p className="text-error-500 text-xs font-medium">Full error</p>
                      <Tooltip content="Copy">
                        <div className="cursor-pointer" onClick={() => copyToClipboard(errors[0].error)}>
                          <Icon name="icon-solid-copy" className="text-xs text-text-300 hover:text-text-100" />
                        </div>
                      </Tooltip>
                    </div>
                    <p data-testid="error-msg" className="text-text-200 text-xs">
                      Transmitter: {errors[errors.length - 1].error.event_details?.transmitter?.name} -{' '}
                      {errors[errors.length - 1].error.underlying_error?.message}
                    </p>
                  </div>
                  {errors[errors.length - 1].error.hint_message && (
                    <div className="bg-element-light-darker-300 mt-3 p-2 rounded ml-8">
                      <p className="text-xs text-accent2-400 font-medium mb-1">Solution</p>
                      <p data-testid="solution-msg" className="text-text-100 text-xs mb-2">
                        {errors[errors.length - 1].error.hint_message}
                      </p>
                      <Button
                        className="mr-2"
                        iconLeft="icon-solid-wheel"
                        external={true}
                        link={`https://console.qovery.com/platform/organization/${organizationId}/settings/clusters`}
                        style={ButtonStyle.BASIC}
                        size={ButtonSize.TINY}
                      >
                        Cluster settings
                      </Button>
                      {errors[errors.length - 1].error.link && (
                        <Button
                          iconLeft="icon-solid-book"
                          external={true}
                          link={errors[errors.length - 1].error.link}
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
            external={true}
            iconRight="icon-solid-arrow-up-right-from-square"
          />
        </div>
      )}
    </div>
  )
}

export default TabsLogs
