import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { type ITerminalAddon } from '@xterm/xterm'
import Color from 'color'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { XTerm } from 'react-xtermjs'
import { match } from 'ts-pattern'
import { Button, EmptyState, ExternalLink, Icon, LoaderSpinner, toast } from '@qovery/shared/ui'
import { useTerminalReadiness } from '@qovery/shared/util-hooks'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useRunningStatus } from '../..'
import { InputSearch } from './input-search/input-search'
import { TerminalShellActionsAddon } from './terminal-shell-banner-addon'

const MemoizedXTerm = memo(XTerm)

export interface ServiceTerminalProps {
  organizationId: string
  clusterId: string
  projectId: string
  environmentId: string
  serviceId: string
}

export function ServiceTerminal({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
}: ServiceTerminalProps) {
  const { data: runningStatuses } = useRunningStatus({ environmentId, serviceId })
  const hasWrittenShellBannerRef = useRef(false)

  const [addons, setAddons] = useState<Array<ITerminalAddon>>([])
  const [terminalLaunchError, setTerminalLaunchError] = useState<string | null>(null)
  const isTerminalLoading = addons.length < 2
  const isTerminalSubscriptionEnabled = terminalLaunchError === null
  const { attachWebSocket, detachWebSocket, isTerminalReady, resetTerminalReadiness } = useTerminalReadiness()
  const showDelayedLoader = !isTerminalReady
  const fitAddon = addons[0] as FitAddon | undefined

  const getCssVariableHex = (variableName: string): string => {
    const styles = getComputedStyle(document.documentElement)
    return Color(styles.getPropertyValue(variableName)).hex()
  }

  const backgroundColor = getCssVariableHex('--background-1')
  const foreground = getCssVariableHex('--neutral-12')
  const selectionBackground = getCssVariableHex('--brand-3')
  const selectionForeground = getCssVariableHex('--neutral-12')
  const warningTextColor = getCssVariableHex('--warning-11')
  const accent1TextColor = getCssVariableHex('--accent-11')
  const positiveTextColor = getCssVariableHex('--positive-11')
  const subtleTextColor = getCssVariableHex('--neutral-11')
  const terminalBannerColors = useMemo(
    () => ({
      accent1: accent1TextColor,
      positive: positiveTextColor,
      subtle: subtleTextColor,
      warning: warningTextColor,
    }),
    [accent1TextColor, positiveTextColor, subtleTextColor, warningTextColor]
  )
  const terminalOptions = useMemo(
    () => ({
      theme: {
        background: backgroundColor,
        foreground: foreground,
        cursor: foreground,
        cursorAccent: backgroundColor,
        selectionBackground: selectionBackground,
        selectionForeground: selectionForeground,
      },
    }),
    [backgroundColor, foreground, selectionBackground, selectionForeground]
  )

  const [selectedPod, setSelectedPod] = useState<string | undefined>()
  const [selectedContainer, setSelectedContainer] = useState<string | undefined>()

  const selectedOrDefaultPodName = selectedPod ?? runningStatuses?.pods[0]?.name
  const selectedOrDefaultContainerName =
    selectedContainer ?? runningStatuses?.pods.find((pod) => pod.name === selectedOrDefaultPodName)?.containers[0]?.name
  const connectShellCommand = [
    `qovery shell https://console.qovery.com/organization/${organizationId}/project/${projectId}/environment/${environmentId}/application/${serviceId}`,
    selectedOrDefaultPodName ? `--pod=${selectedOrDefaultPodName}` : undefined,
    selectedOrDefaultContainerName ? `--container=${selectedOrDefaultContainerName}` : undefined,
  ]
    .filter((commandPart): commandPart is string => Boolean(commandPart))
    .join(' ')
  const portForwardCommand = `qovery port-forward --organization ${organizationId} --project ${projectId} --environment ${environmentId} --service ${serviceId} --port <local-port:target-port>`
  const getShellCommand = useCallback(() => connectShellCommand, [connectShellCommand])
  const getPortForwardCommand = useCallback(() => portForwardCommand, [portForwardCommand])

  const onOpenHandler = useCallback(
    (_: QueryClient, event: Event) => {
      const websocket = event.target as WebSocket
      const fitAddon = new FitAddon()
      const shouldWriteShellBanner = !hasWrittenShellBannerRef.current

      // As WS are open twice in dev mode / strict mode it doesn't happens in production
      attachWebSocket(websocket)
      setTerminalLaunchError(null)
      hasWrittenShellBannerRef.current = true
      setAddons([
        fitAddon,
        new AttachAddon(websocket),
        new TerminalShellActionsAddon(
          fitAddon,
          terminalBannerColors,
          getPortForwardCommand,
          getShellCommand,
          shouldWriteShellBanner
        ),
      ])
    },
    [attachWebSocket, getPortForwardCommand, getShellCommand, setAddons, terminalBannerColors]
  )

  const onCloseHandler = useCallback(
    (_: QueryClient, event: CloseEvent) => {
      detachWebSocket()
      setAddons([])

      if (event.code !== 1006 && event.reason) {
        setTerminalLaunchError(event.reason)
        toast('ERROR', 'Not available', event.reason)
      }
    },
    [detachWebSocket]
  )

  const onRetryCliLaunch = useCallback(() => {
    detachWebSocket()
    hasWrittenShellBannerRef.current = false
    setAddons([])
    setTerminalLaunchError(null)
    resetTerminalReadiness()
  }, [detachWebSocket, resetTerminalReadiness])
  const terminalUnavailableDescription = useMemo(
    () =>
      match(runningStatuses?.state)
        .with('STOPPED', () => "We could not launch the CLI for this service because it's stopped.")
        .with('ERROR', () => "We could not launch the CLI for this service because it's in error.")
        .otherwise(() => "We could not launch the CLI for this service because it's not running."),
    [runningStatuses?.state]
  )

  // Necesssary to calculate the number of rows and columns (tty) for the terminal
  // https://github.com/xtermjs/xterm.js/issues/1412#issuecomment-724421101
  // 16 is the font height
  const rows = Math.ceil(document.body.clientHeight / 16)
  const cols = Math.ceil(document.body.clientWidth / 8)

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/shell/exec',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      pod_name: selectedPod,
      container_name: selectedContainer,
      tty_height: rows.toString(),
      tty_width: cols.toString(),
    },
    onOpen: onOpenHandler,
    onClose: onCloseHandler,
    enabled: isTerminalSubscriptionEnabled,
  })

  useEffect(() => {
    hasWrittenShellBannerRef.current = false
    resetTerminalReadiness()
  }, [resetTerminalReadiness, selectedContainer, selectedPod])

  useEffect(() => {
    if (fitAddon) {
      setTimeout(() => fitAddon.fit(), 0)
    }
  }, [fitAddon])

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none border-0 bg-background">
      <div className="flex h-16 justify-between border-b border-neutral p-4">
        <div className="flex gap-2 [&_input]:w-[400px]">
          {runningStatuses && runningStatuses.pods.length > 0 && (
            <InputSearch
              value={selectedPod}
              onChange={setSelectedPod}
              data={runningStatuses.pods.map((pod) => pod.name)}
              placeholder="Search by pod"
              size="md"
              trimLabel
            />
          )}
          {runningStatuses && selectedPod && (
            <InputSearch
              value={selectedContainer}
              onChange={setSelectedContainer}
              data={
                runningStatuses.pods
                  .find((pod) => selectedPod === pod?.name)
                  ?.containers.map((container) => container?.name) || []
              }
              placeholder="Search by container"
              size="md"
            />
          )}
        </div>
        <ExternalLink
          as="button"
          href="https://www.qovery.com/docs/cli/overview"
          variant="surface"
          color="neutral"
          size="md"
          className="gap-1.5"
        >
          <Icon iconName="book" />
          CLI docs
        </ExternalLink>
      </div>
      <div className="flex h-full flex-1 flex-col bg-background p-3">
        <div className="relative min-h-0 flex-1">
          {terminalLaunchError ? (
            <EmptyState icon="terminal" title="Unable to launch CLI" description={terminalUnavailableDescription}>
              <Button size="md" color="neutral" onClick={onRetryCliLaunch}>
                Relaunch
              </Button>
            </EmptyState>
          ) : isTerminalLoading ? (
            <div className="flex h-40 items-start justify-center p-5">
              <LoaderSpinner />
            </div>
          ) : (
            <>
              <MemoizedXTerm className="h-full" addons={addons} options={terminalOptions} />
              {showDelayedLoader && (
                <div className="absolute inset-0 flex items-start justify-center border-neutral bg-background pt-7">
                  <LoaderSpinner />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceTerminal
