import { type QueryClient } from '@tanstack/react-query'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { type ITerminalAddon } from '@xterm/xterm'
import Color from 'color'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { XTerm } from 'react-xtermjs'
import { match } from 'ts-pattern'
import { v7 as uuidv7 } from 'uuid'
import { type ServiceType } from '@qovery/domains/services/data-access'
import {
  Badge,
  Button,
  EmptyState,
  ExternalLink,
  Icon,
  LoaderSpinner,
  Tooltip,
  toast,
  useModal,
} from '@qovery/shared/ui'
import { useTerminalReadiness } from '@qovery/shared/util-hooks'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import { useRunningStatus, useService } from '../..'
import { type EphemeralShellFormValues, EphemeralShellModal } from './ephemeral-shell-modal/ephemeral-shell-modal'
import { InputSearch } from './input-search/input-search'
import { TerminalShellActionsAddon } from './terminal-shell-banner-addon'

const MemoizedXTerm = memo(XTerm)

const buildCommand = (...parts: Array<string | undefined>): string =>
  parts.filter((part): part is string => Boolean(part)).join(' ')

export interface ServiceTerminalProps {
  organizationId: string
  clusterId: string
  projectId: string
  environmentId: string
  serviceId: string
  serviceType: ServiceType
}

export function ServiceTerminal({
  organizationId,
  clusterId,
  projectId,
  environmentId,
  serviceId,
  serviceType,
}: ServiceTerminalProps) {
  const { data: runningStatuses } = useRunningStatus({ environmentId, serviceId })
  const { data: service } = useService({ serviceId, serviceType })
  const hasWrittenShellBannerRef = useRef(false)
  const activeWebSocketRef = useRef<WebSocket | null>(null)
  const [requestId, setRequestId] = useState(() => uuidv7())

  const [addons, setAddons] = useState<Array<ITerminalAddon>>([])
  const [terminalLaunchError, setTerminalLaunchError] = useState<string | null>(null)
  const isTerminalLoading = addons.length < 2
  const isTerminalSubscriptionEnabled = terminalLaunchError === null
  const { attachWebSocket, detachWebSocket, isTerminalReady, resetTerminalReadiness } = useTerminalReadiness()
  const showDelayedLoader = !isTerminalReady
  const showLoader = isTerminalLoading || showDelayedLoader
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

  const { openModal, closeModal } = useModal()
  const [ephemeralConfig, setEphemeralConfig] = useState<EphemeralShellFormValues | null>(null)
  const supportsEphemeral = serviceType === 'APPLICATION' || serviceType === 'CONTAINER'

  const [selectedPod, setSelectedPod] = useState<string | undefined>()

  const selectedOrDefaultPodName = selectedPod ?? runningStatuses?.pods[0]?.name
  const connectShellCommand = ephemeralConfig
    ? buildCommand(
        `qovery shell --ephemeral --mode clone`,
        `--cpu ${ephemeralConfig.cpu}m`,
        `--memory ${ephemeralConfig.memory}Mi`,
        `https://console.qovery.com/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/${serviceId}`
      )
    : buildCommand(
        `qovery shell https://console.qovery.com/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/${serviceId}`,
        selectedOrDefaultPodName ? `--pod=${selectedOrDefaultPodName}` : undefined
      )
  const portForwardCommand = buildCommand(
    `qovery port-forward https://console.qovery.com/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/${serviceId} --port local-port:target-port`
  )
  // Keep it as a callback so the banner copy action resolves the latest command at click time, necesssary
  // to allow users to use those commands in their private terminal without having to go through the documentation
  const getShellCommand = useCallback(() => connectShellCommand, [connectShellCommand])
  const getPortForwardCommand = useCallback(() => portForwardCommand, [portForwardCommand])

  const onOpenHandler = useCallback(
    (_: QueryClient, event: Event) => {
      const websocket = event.target as WebSocket
      const fitAddon = new FitAddon()
      const shouldWriteShellBanner = !hasWrittenShellBannerRef.current

      // As WS are open twice in dev mode / strict mode it doesn't happens in production
      activeWebSocketRef.current = websocket
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
          shouldWriteShellBanner,
          requestId,
          ephemeralConfig !== null
        ),
      ])
    },
    [attachWebSocket, getPortForwardCommand, getShellCommand, requestId, setAddons, terminalBannerColors]
  )

  const onCloseHandler = useCallback(
    (_: QueryClient, event: CloseEvent) => {
      if (event.target !== activeWebSocketRef.current) {
        return
      }

      activeWebSocketRef.current = null
      detachWebSocket()
      setAddons([])

      if (event.code !== 1006 && event.reason) {
        setTerminalLaunchError(event.reason)
        toast('error', 'Not available', event.reason)
      }
    },
    [detachWebSocket]
  )

  const resetTerminalSession = useCallback(
    (nextEphemeralConfig?: EphemeralShellFormValues | null) => {
      activeWebSocketRef.current = null
      detachWebSocket()
      hasWrittenShellBannerRef.current = false
      setAddons([])
      setTerminalLaunchError(null)
      setRequestId(uuidv7())
      resetTerminalReadiness()
      if (nextEphemeralConfig !== undefined) {
        setEphemeralConfig(nextEphemeralConfig)
      }
    },
    [detachWebSocket, resetTerminalReadiness]
  )

  const onLaunchEphemeral = useCallback(
    (values: EphemeralShellFormValues) => {
      setSelectedPod(undefined)
      resetTerminalSession(values)
    },
    [resetTerminalSession]
  )

  const ephemeralDefaultValues = useMemo((): EphemeralShellFormValues => {
    const cpuMillicores = match(service)
      .with({ serviceType: 'APPLICATION' }, (s) => s.cpu)
      .with({ serviceType: 'CONTAINER' }, (s) => s.cpu)
      .otherwise(() => undefined)
    const memoryMib = match(service)
      .with({ serviceType: 'APPLICATION' }, (s) => s.memory)
      .with({ serviceType: 'CONTAINER' }, (s) => s.memory)
      .otherwise(() => undefined)
    const cpu = cpuMillicores != null && cpuMillicores > 0 ? String(cpuMillicores) : '1000'
    const memory = memoryMib != null && memoryMib > 0 ? String(memoryMib) : '2048'
    return { cpu, memory }
  }, [service])

  const onOpenEphemeralModal = useCallback(() => {
    openModal({
      content: (
        <EphemeralShellModal onClose={closeModal} onLaunch={onLaunchEphemeral} defaultValues={ephemeralDefaultValues} />
      ),
    })
  }, [closeModal, ephemeralDefaultValues, onLaunchEphemeral, openModal])

  const onRetryCliLaunch = useCallback(() => {
    resetTerminalSession()
  }, [resetTerminalSession])

  const onSelectedPodChange = useCallback(
    (pod?: string) => {
      resetTerminalSession()
      setSelectedPod(pod)
    },
    [resetTerminalSession]
  )
  const terminalUnavailableDescription = useMemo(
    () =>
      match(runningStatuses?.state)
        .with('STOPPED', () => "We could not launch the CLI for this service because it's stopped.")
        .with('ERROR', () => "We could not launch the CLI for this service because it's in error.")
        .otherwise(() => 'The CLI is currently unavailable for this service.'),
    [runningStatuses?.state]
  )

  // Necesssary to calculate the number of rows and columns (tty) for the terminal
  // https://github.com/xtermjs/xterm.js/issues/1412#issuecomment-724421101
  // 16 is the font height
  const rows = Math.ceil(document.body.clientHeight / 16)
  const cols = Math.ceil(document.body.clientWidth / 8)

  useReactQueryWsSubscription({
    url: QOVERY_WS + (ephemeralConfig ? '/shell/ephemeral' : '/shell/exec'),
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      service_type: serviceType,
      ...(ephemeralConfig
        ? { mode: 'clone', cpu_override: `${ephemeralConfig.cpu}m`, memory_override: `${ephemeralConfig.memory}Mi` }
        : { pod_name: selectedPod }),
      tty_height: rows.toString(),
      tty_width: cols.toString(),
      external_request_id: requestId,
    },
    onOpen: onOpenHandler,
    onClose: onCloseHandler,
    enabled: isTerminalSubscriptionEnabled,
  })

  useEffect(() => {
    if (fitAddon) {
      setTimeout(() => fitAddon.fit?.(), 0)
    }
  }, [fitAddon])

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none border-0 bg-background">
      <div className="flex h-12 items-center justify-between gap-3 border-b border-neutral px-3">
        <div className="flex min-w-0 items-center gap-3 text-xs text-neutral-subtle">
          {ephemeralConfig ? (
            <>
              <Button variant="surface" color="neutral" size="md" onClick={() => resetTerminalSession(null)}>
                <Icon iconName="arrow-left" />
                Back to live pod
              </Button>
              <Tooltip content={`${ephemeralConfig.cpu}m CPU / ${ephemeralConfig.memory} MiB`} side="bottom">
                <Badge variant="surface" color="brand" size="sm" radius="rounded" className="gap-1">
                  Ephemeral pod
                  <Icon iconName="circle-info" iconStyle="regular" className="text-xs" />
                </Badge>
              </Tooltip>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-neutral-subtle">Connected to live pod:</span>
                {runningStatuses && runningStatuses.pods.length > 0 && (
                  <InputSearch
                    value={selectedOrDefaultPodName}
                    onChange={onSelectedPodChange}
                    data={runningStatuses.pods.map((pod) => pod.name)}
                    placeholder="Select a pod"
                    trimLabel
                  />
                )}
              </div>
              {supportsEphemeral && (
                <Button variant="surface" color="neutral" size="xs" className="h-8" onClick={onOpenEphemeralModal}>
                  Launch ephemeral pod
                </Button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ExternalLink
            as="button"
            href="https://www.qovery.com/docs/cli/overview"
            variant="surface"
            color="neutral"
            size="md"
          >
            <Icon iconName="book" />
            CLI docs
          </ExternalLink>
        </div>
      </div>
      <div className="flex h-full flex-1 flex-col bg-background px-3 pt-5">
        <div className="relative min-h-0 flex-1">
          {terminalLaunchError ? (
            <EmptyState icon="terminal" title="Unable to launch CLI" description={terminalUnavailableDescription}>
              <p className="text-xs text-neutral-subtle">Request ID: {requestId}</p>
              <Button size="md" color="neutral" onClick={onRetryCliLaunch}>
                Relaunch
              </Button>
            </EmptyState>
          ) : (
            <>
              {!isTerminalLoading && <MemoizedXTerm className="h-full" addons={addons} options={terminalOptions} />}
              {showLoader && (
                <div className="absolute inset-0 flex flex-col items-center gap-2 border-neutral bg-background pt-6">
                  <LoaderSpinner />
                  <span className="text-xs text-neutral-subtle">
                    {ephemeralConfig
                      ? 'Provisioning ephemeral pod…'
                      : isTerminalLoading
                        ? 'Connecting…'
                        : 'Waiting for shell…'}
                  </span>
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
