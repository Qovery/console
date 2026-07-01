import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Link as RouterLink, useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'
import { ClusterStateEnum, StateEnum } from 'qovery-typescript-axios'
import { type SVGAttributes, useCallback, useEffect, useRef, useState } from 'react'
import { ClusterInstallationGuideModal, useClusterStatuses, useClusters } from '@qovery/domains/clusters/feature'
import { CreateCloneEnvironmentModal, useDeploymentRule, useEnvironments } from '@qovery/domains/environments/feature'
import { useOrganization } from '@qovery/domains/organizations/feature'
import { useProjects } from '@qovery/domains/projects/feature'
import { useServiceStatuses, useServices } from '@qovery/domains/services/feature'
import { IconEnum } from '@qovery/shared/enums'
import { McpSuggestionCard } from '@qovery/shared/mcp-suggestion/feature'
import { AnimatedGradientText, Button, Heading, Icon, Link, LogoIcon, useModal } from '@qovery/shared/ui'
import { useLocalStorage, useSupportChat } from '@qovery/shared/util-hooks'
import { twMerge } from '@qovery/shared/util-js'
import { useOrganizationOnboarding, useUpdateOrganizationOnboarding } from './use-organization-onboarding'

const QUEUED_CLUSTER_STATUSES: ClusterStateEnum[] = [ClusterStateEnum.DEPLOYMENT_QUEUED, ClusterStateEnum.QUEUED]
const ACTIVE_DEPLOYING_CLUSTER_STATUSES: ClusterStateEnum[] = [ClusterStateEnum.DEPLOYING, ClusterStateEnum.BUILDING]
const ALL_DEPLOYING_CLUSTER_STATUSES: ClusterStateEnum[] = [
  ...QUEUED_CLUSTER_STATUSES,
  ...ACTIVE_DEPLOYING_CLUSTER_STATUSES,
]

const QUEUED_SERVICE_STATUSES: StateEnum[] = [StateEnum.DEPLOYMENT_QUEUED, StateEnum.QUEUED]
const ACTIVE_DEPLOYING_SERVICE_STATUSES: StateEnum[] = [StateEnum.DEPLOYING, StateEnum.BUILDING]
const ALL_DEPLOYING_SERVICE_STATUSES: StateEnum[] = [...QUEUED_SERVICE_STATUSES, ...ACTIVE_DEPLOYING_SERVICE_STATUSES]

export interface SectionOnboardingProps {
  organizationId: string
}

const COMPLETION_ILLUSTRATION_ROW_TONES = [
  '366333336963333366366333336963333366366333336963333366',
  '369633333663366333336963333366336633333696333336633663333',
  '366336633333696333366336633333696333366336633333696333',
  '333336963333366336633333696333336633663333369633333663366',
  '333336633663333369333336633663333369333336633663333369',
  '336633333636333336633663333363633333663366333336363333366',
  '366333336963333366336633333696333336633663333369633333663',
  '696333336633663333696333336633663333696333336633663333',
  '366336633333696333333663366333336963333336633663333369633333',
  '333369633333663366333336963333366336633333696333336633663',
  '333336633663333369633333366336633333696333333663366333336963',
  '366333336963333366366333336963333366366333336963333366',
  '369633333663366333336963333366336633333696333336633663333',
  '366336633333696333366336633333696333366336633333696333',
  '333336963333366336633333696333336633663333369633333663366',
  '333336633663333369333336633663333369333336633663333369',
  '336633333636333336633663333363633333663366333336363333366',
] as const

const COMPLETION_ILLUSTRATION_HEX_FILL = {
  3: 'var(--positive-3)',
  6: 'var(--positive-6)',
  9: 'var(--positive-9)',
} as const

type CompletionIllustrationHexTone = keyof typeof COMPLETION_ILLUSTRATION_HEX_FILL

const COMPLETION_ILLUSTRATION_HEX_GAP = 10.5
const COMPLETION_ILLUSTRATION_HEX_PATH = 'M0 0L3.89711 2.25V6.75L0 9L-3.89711 6.75V2.25L0 0Z'
const COMPLETION_ILLUSTRATION_HEX_COLUMN_COUNT = 50
const COMPLETION_ILLUSTRATION_HEX_HALF_WIDTH = 3.89711
const COMPLETION_ILLUSTRATION_HEX_HEIGHT = 9
const COMPLETION_ILLUSTRATION_ROW_START_Y = -5
const COMPLETION_ILLUSTRATION_ROW_GAP = 9
const COMPLETION_ILLUSTRATION_ROW_OFFSET = {
  even: -13.25,
  odd: -8,
} as const

const COMPLETION_ILLUSTRATION_PATTERN_MIN_X = Math.floor(
  Math.min(COMPLETION_ILLUSTRATION_ROW_OFFSET.even, COMPLETION_ILLUSTRATION_ROW_OFFSET.odd) -
    COMPLETION_ILLUSTRATION_HEX_HALF_WIDTH
)
const COMPLETION_ILLUSTRATION_PATTERN_MAX_X = Math.ceil(
  Math.max(COMPLETION_ILLUSTRATION_ROW_OFFSET.even, COMPLETION_ILLUSTRATION_ROW_OFFSET.odd) +
    (COMPLETION_ILLUSTRATION_HEX_COLUMN_COUNT - 1) * COMPLETION_ILLUSTRATION_HEX_GAP +
    COMPLETION_ILLUSTRATION_HEX_HALF_WIDTH
)
const COMPLETION_ILLUSTRATION_PATTERN_MAX_Y =
  COMPLETION_ILLUSTRATION_ROW_START_Y +
  (COMPLETION_ILLUSTRATION_ROW_TONES.length - 1) * COMPLETION_ILLUSTRATION_ROW_GAP +
  COMPLETION_ILLUSTRATION_HEX_HEIGHT
const COMPLETION_ILLUSTRATION_PATTERN_BOUNDS = {
  x: COMPLETION_ILLUSTRATION_PATTERN_MIN_X,
  y: COMPLETION_ILLUSTRATION_ROW_START_Y,
  width: COMPLETION_ILLUSTRATION_PATTERN_MAX_X - COMPLETION_ILLUSTRATION_PATTERN_MIN_X,
  height: COMPLETION_ILLUSTRATION_PATTERN_MAX_Y - COMPLETION_ILLUSTRATION_ROW_START_Y,
} as const

const COMPLETION_ILLUSTRATION_ROWS = COMPLETION_ILLUSTRATION_ROW_TONES.map((tones, index) => ({
  x: index % 2 === 0 ? COMPLETION_ILLUSTRATION_ROW_OFFSET.even : COMPLETION_ILLUSTRATION_ROW_OFFSET.odd,
  y: COMPLETION_ILLUSTRATION_ROW_START_Y + index * COMPLETION_ILLUSTRATION_ROW_GAP,
  tones,
}))

function CompletionPartyHornIllustration({ className, ...props }: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      className={twMerge('h-36 w-full overflow-hidden', className)}
      viewBox="0 0 488 148"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <mask
          id="completion-party-horn-pattern-mask"
          maskUnits="userSpaceOnUse"
          x={COMPLETION_ILLUSTRATION_PATTERN_BOUNDS.x}
          y={COMPLETION_ILLUSTRATION_PATTERN_BOUNDS.y}
          width={COMPLETION_ILLUSTRATION_PATTERN_BOUNDS.width}
          height={COMPLETION_ILLUSTRATION_PATTERN_BOUNDS.height}
          style={{ maskType: 'alpha' }}
        >
          <rect {...COMPLETION_ILLUSTRATION_PATTERN_BOUNDS} fill="url(#completion-party-horn-paint-0)" />
          <rect {...COMPLETION_ILLUSTRATION_PATTERN_BOUNDS} fill="url(#completion-party-horn-paint-1)" />
          <rect {...COMPLETION_ILLUSTRATION_PATTERN_BOUNDS} fill="url(#completion-party-horn-paint-2)" />
          <rect {...COMPLETION_ILLUSTRATION_PATTERN_BOUNDS} fill="url(#completion-party-horn-paint-3)" />
          <rect {...COMPLETION_ILLUSTRATION_PATTERN_BOUNDS} fill="url(#completion-party-horn-paint-4)" />
        </mask>
        <radialGradient
          id="completion-party-horn-paint-0"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(8.13334 88) rotate(35.743) scale(102.713 57.3123)"
        >
          <stop stopColor="#D9D9D9" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="completion-party-horn-paint-1"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-45.5 63.5 -109.592 -10.0666 136 10.5)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9D9D9" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="completion-party-horn-paint-2"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(432.5 7.5) rotate(139.764) scale(93.6617 109.413)"
        >
          <stop stopColor="#D9D9D9" />
          <stop offset="0.931262" stopColor="#737373" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="completion-party-horn-paint-3"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-32.5333 55.5 -9.70457 -51.6187 488 45.5)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9D9D9" />
          <stop offset="1" stopColor="#737373" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="completion-party-horn-paint-4"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(267.5 -53.5) rotate(69.1748) scale(87.1966 148.017)"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
        <filter
          id="completion-party-horn-shadow"
          x="-4.21224"
          y="-4.33333"
          width="72.6081"
          height="72.6087"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2.66667" />
          <feComposite in2="hardAlpha" operator="out" result="outerShadowAlpha" />
          <feFlood floodColor="currentColor" floodOpacity="0.2" result="outerShadowColor" />
          <feComposite in="outerShadowColor" in2="outerShadowAlpha" operator="in" result="outerShadow" />
          <feBlend mode="normal" in="outerShadow" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlphaInnerDark"
          />
          <feOffset dy="-1.33333" />
          <feGaussianBlur stdDeviation="1.33333" />
          <feComposite in2="hardAlphaInnerDark" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlphaInnerLight"
          />
          <feOffset dy="1.33333" />
          <feGaussianBlur stdDeviation="0.666667" />
          <feComposite in2="hardAlphaInnerLight" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="effect2_innerShadow" result="effect3_innerShadow" />
        </filter>
      </defs>

      <g mask="url(#completion-party-horn-pattern-mask)">
        {COMPLETION_ILLUSTRATION_ROWS.map((row) =>
          Array.from({ length: COMPLETION_ILLUSTRATION_HEX_COLUMN_COUNT }).map((_, index) => {
            const tone = Number(row.tones[index % row.tones.length]) as CompletionIllustrationHexTone

            return (
              <path
                key={`${row.y}-${index}`}
                d={COMPLETION_ILLUSTRATION_HEX_PATH}
                fill={COMPLETION_ILLUSTRATION_HEX_FILL[tone]}
                transform={`translate(${row.x + index * COMPLETION_ILLUSTRATION_HEX_GAP} ${row.y})`}
              />
            )
          })
        )}
      </g>

      <g className="text-positive" filter="url(#completion-party-horn-shadow)" transform="translate(212 42)">
        <path
          d="M5.06256 4C5.06256 3.20435 5.37863 2.44129 5.94124 1.87868C6.50385 1.31607 7.26691 1 8.06256 1C8.85821 1 9.62128 1.31607 10.1839 1.87868C10.7465 2.44129 11.0626 3.20435 11.0626 4C11.0626 4.79565 10.7465 5.55871 10.1839 6.12132C9.62128 6.68393 8.85821 7 8.06256 7C7.26691 7 6.50385 6.68393 5.94124 6.12132C5.37863 5.55871 5.06256 4.79565 5.06256 4ZM57.0626 20C57.0626 19.2044 57.3786 18.4413 57.9412 17.8787C58.5039 17.3161 59.2669 17 60.0626 17C60.8582 17 61.6213 17.3161 62.1839 17.8787C62.7465 18.4413 63.0626 19.2044 63.0626 20C63.0626 20.7957 62.7465 21.5587 62.1839 22.1213C61.6213 22.6839 60.8582 23 60.0626 23C59.2669 23 58.5039 22.6839 57.9412 22.1213C57.3786 21.5587 57.0626 20.7957 57.0626 20ZM60.0626 53C60.8582 53 61.6213 53.3161 62.1839 53.8787C62.7465 54.4413 63.0626 55.2044 63.0626 56C63.0626 56.7957 62.7465 57.5587 62.1839 58.1213C61.6213 58.6839 60.8582 59 60.0626 59C59.2669 59 58.5039 58.6839 57.9412 58.1213C57.3786 57.5587 57.0626 56.7957 57.0626 56C57.0626 55.2044 57.3786 54.4413 57.9412 53.8787C58.5039 53.3161 59.2669 53 60.0626 53ZM59.4751 4.5875C60.2501 5.3625 60.2501 6.6375 59.4751 7.4125L57.1001 9.7875C55.6876 11.2 53.7626 12 51.7626 12H50.3876C48.6376 12 47.4126 13.7125 47.9626 15.3625C49.3751 19.6125 46.2126 24 41.7376 24H40.3626C39.4251 24 38.5126 24.375 37.8501 25.0375L35.4751 27.4125C34.7001 28.1875 33.4251 28.1875 32.6501 27.4125C31.8751 26.6375 31.8751 25.3625 32.6501 24.5875L35.0251 22.2125C36.4376 20.8 38.3626 20 40.3626 20H41.7376C43.4876 20 44.7126 18.2875 44.1626 16.6375C42.7501 12.3875 45.9126 8 50.3876 8H51.7626C52.7001 8 53.6126 7.625 54.2751 6.9625L56.6501 4.5875C57.4251 3.8125 58.7001 3.8125 59.4751 4.5875ZM30.0626 4V7.025C30.0626 10.7375 28.5876 14.3 25.9626 16.925L23.4751 19.4125C22.7001 20.1875 21.4251 20.1875 20.6501 19.4125C19.8751 18.6375 19.8751 17.3625 20.6501 16.5875L23.1376 14.1C25.0126 12.225 26.0626 9.675 26.0626 7.025V4C26.0626 2.9 26.9626 2 28.0626 2C29.1626 2 30.0626 2.9 30.0626 4ZM11.1626 26.5375C12.0626 23.675 15.6876 22.7875 17.8001 24.9125L39.1501 46.2625C41.2751 48.3875 40.3876 52 37.5251 52.9L6.33756 62.75C3.25006 63.725 0.337565 60.825 1.31256 57.725L11.1626 26.5375ZM36.3126 49.0875L14.9751 27.75L12.9751 34.0875L13.4751 34.5875L29.4751 50.5875L29.9751 51.0875L36.3126 49.0875ZM25.6751 52.45L11.6126 38.3875L9.12506 46.25L9.46256 46.5875L17.4626 54.5875L17.8001 54.925L25.6626 52.4375L25.6751 52.45ZM5.12506 58.9375L13.5126 56.2875L7.77506 50.55L5.12506 58.9375ZM62.0626 36C62.0626 37.1 61.1626 38 60.0626 38H57.0376C54.3876 38 51.8376 39.05 49.9626 40.925L47.4751 43.4125C46.7001 44.1875 45.4251 44.1875 44.6501 43.4125C43.8751 42.6375 43.8751 41.3625 44.6501 40.5875L47.1376 38.1C49.7626 35.475 53.3251 34 57.0376 34H60.0626C61.1626 34 62.0626 34.9 62.0626 36Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

export function SectionOnboarding({ organizationId }: SectionOnboardingProps) {
  const [localDismissed, setLocalDismissed] = useLocalStorage(`onboarding_section_dismissed_${organizationId}`, false)
  const { openModal, closeModal, enableAlertClickOutside } = useModal()
  const navigate = useNavigate()
  const { showPylonForm } = useSupportChat()

  const { data: organization } = useOrganization({ organizationId })
  const { data: onboarding, isLoading: isOnboardingLoading } = useOrganizationOnboarding({ organizationId })
  const { mutate: updateOnboarding } = useUpdateOrganizationOnboarding({ organizationId })

  const { data: clusters = [] } = useClusters({ organizationId })
  const { data: clusterStatuses = [] } = useClusterStatuses({
    organizationId,
    refetchInterval: 3000,
  })
  const { data: projects = [] } = useProjects({ organizationId })

  const firstProject = projects[0]
  const { data: environments = [] } = useEnvironments({ projectId: firstProject?.id ?? '' })
  const firstEnvironment = environments[0]
  const { data: services = [] } = useServices({ environmentId: firstEnvironment?.id })
  const { data: serviceStatuses } = useServiceStatuses({ environmentId: firstEnvironment?.id })
  const completionModalOpenedRef = useRef(false)

  const isClusterDeployed = clusterStatuses.some((s) => s.status === ClusterStateEnum.DEPLOYED && s.is_deployed)
  const isClusterQueued =
    clusters.length > 0 &&
    !isClusterDeployed &&
    clusterStatuses.some((s) => QUEUED_CLUSTER_STATUSES.includes(s.status as ClusterStateEnum))
  const isClusterDeploying =
    clusters.length > 0 &&
    !isClusterDeployed &&
    clusterStatuses.some((s) => ACTIVE_DEPLOYING_CLUSTER_STATUSES.includes(s.status as ClusterStateEnum))
  const deployingClusterStatus = clusterStatuses.find((s) =>
    ALL_DEPLOYING_CLUSTER_STATUSES.includes(s.status as ClusterStateEnum)
  )
  const isClusterFailed =
    !isClusterDeployed &&
    clusterStatuses.some(
      (s) => s.status === ClusterStateEnum.DEPLOYMENT_ERROR || s.status === ClusterStateEnum.INVALID_CREDENTIALS
    )
  const failedClusterStatus = clusterStatuses.find(
    (s) => s.status === ClusterStateEnum.DEPLOYMENT_ERROR || s.status === ClusterStateEnum.INVALID_CREDENTIALS
  )

  const hasCluster = clusters.length > 0
  const hasEnvironment = environments.length > 0

  const allServiceStatuses = [
    ...(serviceStatuses?.applications ?? []),
    ...(serviceStatuses?.containers ?? []),
    ...(serviceStatuses?.jobs ?? []),
    ...(serviceStatuses?.helms ?? []),
    ...(serviceStatuses?.databases ?? []),
    ...(serviceStatuses?.terraforms ?? []),
  ]
  const hasService = services.length > 0
  const isServiceDeployed = allServiceStatuses.some((s) => s.state === StateEnum.DEPLOYED)
  const isServiceQueued =
    hasService && !isServiceDeployed && allServiceStatuses.some((s) => QUEUED_SERVICE_STATUSES.includes(s.state))
  const isServiceDeploying =
    hasService &&
    !isServiceDeployed &&
    allServiceStatuses.some((s) => ACTIVE_DEPLOYING_SERVICE_STATUSES.includes(s.state))
  const deployingServiceStatus = allServiceStatuses.find((s) => ALL_DEPLOYING_SERVICE_STATUSES.includes(s.state))
  const isServiceFailed =
    !isServiceDeployed &&
    allServiceStatuses.some((s) => s.state === StateEnum.DEPLOYMENT_ERROR || s.state === StateEnum.BUILD_ERROR)
  const failedServiceStatus = allServiceStatuses.find(
    (s) => s.state === StateEnum.DEPLOYMENT_ERROR || s.state === StateEnum.BUILD_ERROR
  )
  const isServiceStopped =
    hasService &&
    !isServiceDeployed &&
    !isServiceQueued &&
    !isServiceDeploying &&
    !isServiceFailed &&
    allServiceStatuses.some((s) => s.state === StateEnum.STOPPED || s.state === StateEnum.STOP_ERROR)
  const stoppedServiceStatus = allServiceStatuses.find(
    (s) => s.state === StateEnum.STOPPED || s.state === StateEnum.STOP_ERROR
  )

  const useCases = (onboarding?.use_cases ?? '').split(',').filter(Boolean)
  const hasEphemeralEnvironments = useCases.includes('ephemeral-environments')
  const hasRde = useCases.includes('rde')

  const { data: deploymentRule } = useDeploymentRule({ environmentId: firstEnvironment?.id ?? '' })
  const isPreviewEnabled = hasEphemeralEnvironments && (deploymentRule?.auto_preview ?? false)

  const requiredStepsTotal = 4 + (hasEphemeralEnvironments ? 1 : 0)
  const completedCount = [
    true,
    isClusterDeployed,
    hasEnvironment,
    isServiceDeployed,
    ...(hasEphemeralEnvironments ? [isPreviewEnabled] : []),
  ].filter(Boolean).length
  const allRequiredDone = completedCount === requiredStepsTotal
  const progressPercent = Math.round((completedCount / requiredStepsTotal) * 100)

  const [clusterExpanded, setClusterExpanded] = useState(!hasCluster)

  const isDismissed = onboarding?.status === 'DISMISSED' || onboarding?.status === 'COMPLETED' || localDismissed

  const dismiss = () => {
    setLocalDismissed(true)
    updateOnboarding('DISMISSED')
  }

  const complete = useCallback(() => {
    setLocalDismissed(true)
    updateOnboarding('COMPLETED')
  }, [setLocalDismissed, updateOnboarding])

  const openInstallationGuideModal = ({ isDemo = false }: { isDemo?: boolean } = {}) =>
    openModal({
      options: { width: 500 },
      content: (
        <ClusterInstallationGuideModal mode="CREATE" isDemo={isDemo} type="ON_PREMISE" onClose={() => closeModal()} />
      ),
    })

  const openCreateEnvironmentModal = () => {
    if (!firstProject) return
    openModal({
      content: (
        <CreateCloneEnvironmentModal
          onClose={closeModal}
          onSuccess={closeModal}
          projectId={firstProject.id}
          organizationId={organizationId}
        />
      ),
      options: { fakeModal: true },
    })
  }

  useEffect(() => {
    if (
      !organization ||
      isOnboardingLoading ||
      !onboarding?.use_cases ||
      !allRequiredDone ||
      isDismissed ||
      completionModalOpenedRef.current
    ) {
      return
    }

    completionModalOpenedRef.current = true
    enableAlertClickOutside(false)

    openModal({
      content: (
        <div className="flex flex-col items-center pb-8 text-center">
          <div className="mb-6 h-36 w-full">
            <CompletionPartyHornIllustration />
          </div>
          <div className="mb-6 flex flex-col gap-1 px-6">
            <p className="text-base font-medium text-neutral">You're all set!</p>
            <p className="text-sm text-neutral-subtle">
              Your workspace is completely ready to use.
              <br />
              Here&apos;s what you can explore next.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 px-6">
            {hasRde && (
              <Button
                type="button"
                onClick={() => {
                  complete()
                  closeModal()
                  showPylonForm('request-ai-builder-portal')
                }}
                color="neutral"
                variant="solid"
                size="md"
                className="gap-2"
              >
                <Icon iconName="wand-magic-sparkles" />
                AI portal access
              </Button>
            )}
            <Button
              type="button"
              color="neutral"
              variant={hasRde ? 'outline' : 'solid'}
              size="md"
              className="gap-2"
              onClick={() => {
                complete()
                closeModal()
                navigate({ to: '/organization/$organizationId/settings/members', params: { organizationId } })
              }}
            >
              <Icon iconName="user-plus" />
              Invite team
            </Button>
          </div>
        </div>
      ),
    })
  }, [
    allRequiredDone,
    closeModal,
    complete,
    enableAlertClickOutside,
    hasRde,
    isDismissed,
    isOnboardingLoading,
    navigate,
    onboarding?.use_cases,
    openModal,
    organization,
    organizationId,
    showPylonForm,
  ])

  if (!organization || isOnboardingLoading) return null
  if (!onboarding?.use_cases) return null

  if (isDismissed) return null
  if (allRequiredDone) return null

  const stepRowClass = 'flex h-[52px] items-center gap-2 px-4 py-3'
  const stepIconClass = 'w-4 text-center text-sm text-neutral-subtle'

  const CLUSTERS_OPTIONS = [
    {
      highlight: true,
      tag: 'Recommended',
      title: 'Qovery managed',
      description:
        'Qovery will install and manage the Kubernetes cluster and the underlying infrastructure on your cloud provider account.',
      icon: <LogoIcon width="14" height="14" />,
      compatibleWith: [IconEnum.AWS, IconEnum.GCP, IconEnum.AZURE, IconEnum.SCW_GRAY] as IconEnum[],
      action: 'create-cluster' as const,
      dataAction: 'onboarding__cluster-option-managed',
    },
    {
      highlight: false,
      tag: 'Self-managed',
      title: 'Bring your own cluster',
      icon: 'cloud',
      description:
        'You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge required.',
      compatibleWith: [
        IconEnum.AWS,
        IconEnum.GCP,
        IconEnum.AZURE,
        IconEnum.SCW_GRAY,
        IconEnum.OVH_CLOUD,
        IconEnum.DO,
        IconEnum.ORACLE_CLOUD,
        IconEnum.HETZNER,
        IconEnum.IBM_CLOUD,
        IconEnum.CIVO,
      ] as IconEnum[],
      action: 'installation-guide' as const,
      isDemo: false,
      dataAction: 'onboarding__cluster-option-byoc',
    },
    {
      highlight: false,
      tag: 'Demo',
      title: 'Local machine',
      icon: 'laptop-code',
      description:
        'Deploy a local Kubernetes cluster on your laptop using Docker Desktop. No cloud account or credit card required!',
      compatibleWith: null,
      action: 'installation-guide' as const,
      isDemo: true,
      dataAction: 'onboarding__cluster-option-demo',
    },
  ]

  const getCardClass = (highlight: boolean) =>
    twMerge(
      clsx(
        'flex flex-col gap-3 rounded-md border border-neutral bg-surface-neutral p-3 text-left transition-colors focus:outline-none',
        {
          'border-brand-subtle bg-surface-brand-subtle hover:border-brand-component hover:bg-surface-brand-component':
            highlight,
          'hover:bg-surface-neutral-subtle': !highlight,
        }
      )
    )

  const renderClusterCardContent = (option: (typeof CLUSTERS_OPTIONS)[number]) => (
    <>
      <span
        className={twMerge(
          clsx(
            'flex h-5 max-w-max items-center rounded-full bg-surface-neutral-component px-2 text-xs font-medium text-neutral-subtle',
            { 'bg-surface-brand-solid text-neutralInvert': option.highlight }
          )
        )}
      >
        {option.tag}
      </span>
      <span className="flex flex-col gap-1.5">
        <p className="flex items-center gap-1 text-ssm font-medium text-neutral">
          {typeof option.icon === 'string' ? (
            <Icon iconName={option.icon as IconName} className="text-xs text-neutral-subtle" />
          ) : (
            option.icon
          )}
          {option.title}
        </p>
        <p className="text-ssm text-neutral-subtle">{option.description}</p>
      </span>
      <span className="mt-auto flex flex-col gap-1">
        <span className="font-code text-2xs uppercase text-neutral">Compatible with</span>
        {option.compatibleWith ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {option.compatibleWith.map((provider) => (
              <Icon key={provider} name={provider} width={14} height={14} />
            ))}
          </div>
        ) : (
          <span className="text-ssm text-neutral-subtle">Every computer</span>
        )}
      </span>
    </>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Heading level={2}>Getting started</Heading>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-6 w-6 items-center justify-center rounded text-neutral-subtle transition-colors hover:bg-surface-neutral-subtle hover:text-neutral focus:outline-none"
          aria-label="Dismiss onboarding"
        >
          <Icon iconName="xmark" className="text-ssm" />
        </button>
      </div>

      {!allRequiredDone && (
        <McpSuggestionCard
          variant="setup"
          title="Let your agent do the configuration with"
          description="Just install our AI skills and ask your agent to get you started!"
        />
      )}

      <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
        <div className="flex h-12 items-center gap-4 border-b border-neutral bg-surface-neutral-subtle px-4 py-3">
          <span className="shrink-0 font-code text-xs uppercase text-neutral">Onboarding checklist</span>
          <div className="h-1 flex-1 overflow-hidden rounded-[1px] bg-surface-neutral-componentHover">
            <div
              className="h-full rounded-[1px] bg-surface-positive-solid shadow-[0_1px_1px_0_rgba(255,255,255,0.05)_inset,0_-1px_2px_0_rgba(0,0,0,0.16)_inset,0_0_4px_0_rgba(48,164,108,0.20)] transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="shrink-0 font-code text-xs tabular-nums text-neutral-subtle">{progressPercent}%</span>
        </div>

        <div className="divide-y divide-neutral">
          <div className={stepRowClass}>
            <Icon iconName="bolt" className={stepIconClass} />
            <span className="flex-1 text-sm font-medium text-neutral-subtle line-through">
              Create and setup my workspace
            </span>
            <Icon iconName="circle-check" className="text-sm text-positive" />
          </div>

          <div>
            <button
              type="button"
              className={twMerge(
                clsx(stepRowClass, 'w-full text-left', !isClusterDeployed && 'hover:bg-surface-neutral-subtle')
              )}
              onClick={() => !isClusterDeployed && setClusterExpanded((v) => !v)}
              disabled={isClusterDeployed}
            >
              <Icon iconName="cube" className={stepIconClass} />
              <span
                className={clsx(
                  'flex-1 text-sm font-medium',
                  isClusterDeployed ? 'text-neutral-subtle line-through' : 'text-neutral'
                )}
              >
                Create and deploy my first cluster
              </span>
              {isClusterDeployed ? (
                <Icon iconName="circle-check" className="text-sm text-positive" />
              ) : isClusterQueued ? (
                <span className="text-ssm font-normal text-neutral-subtle">Deployment queued...</span>
              ) : isClusterDeploying ? (
                <Link
                  to="/organization/$organizationId/cluster/$clusterId/cluster-logs"
                  params={{ organizationId, clusterId: deployingClusterStatus?.cluster_id ?? '' }}
                  color="brand"
                  underline
                  size="sm"
                  className="group flex truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand">
                    <span className="flex items-center gap-0.5">
                      Deploying... <Icon iconName="arrow-up-right" />
                    </span>
                  </AnimatedGradientText>
                </Link>
              ) : isClusterFailed ? (
                <Link
                  to="/organization/$organizationId/cluster/$clusterId/cluster-logs"
                  params={{ organizationId, clusterId: failedClusterStatus?.cluster_id ?? '' }}
                  color="red"
                  underline
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {failedClusterStatus?.status === ClusterStateEnum.INVALID_CREDENTIALS
                    ? 'Invalid cloud credentials'
                    : 'Last deployment failed'}
                  <Icon iconName="arrow-up-right" />
                </Link>
              ) : (
                <Icon iconName={clusterExpanded ? 'angle-up' : 'angle-down'} className="text-xs text-neutral-subtle" />
              )}
            </button>

            {clusterExpanded && !hasCluster && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {CLUSTERS_OPTIONS.map((option) =>
                    option.action === 'create-cluster' ? (
                      <RouterLink
                        key={option.title}
                        to="/organization/$organizationId/cluster/new"
                        params={{ organizationId }}
                        data-action={option.dataAction}
                        className={getCardClass(option.highlight)}
                      >
                        {renderClusterCardContent(option)}
                      </RouterLink>
                    ) : (
                      <button
                        key={option.title}
                        type="button"
                        data-action={option.dataAction}
                        onClick={() => openInstallationGuideModal({ isDemo: option.isDemo })}
                        className={getCardClass(option.highlight)}
                      >
                        {renderClusterCardContent(option)}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={stepRowClass}>
            <Icon iconName="box" className={stepIconClass} />
            <span
              className={clsx(
                'flex-1 text-sm font-medium',
                hasEnvironment
                  ? 'text-neutral-subtle line-through'
                  : hasCluster
                    ? 'text-neutral'
                    : 'text-neutral-subtle'
              )}
            >
              Create my first environment
            </span>
            {hasEnvironment ? (
              <Icon iconName="circle-check" className="text-sm text-positive" />
            ) : hasCluster ? (
              <Button size="sm" color="neutral" variant="solid" onClick={openCreateEnvironmentModal}>
                <Icon iconName="circle-plus" />
                New Environment
              </Button>
            ) : null}
          </div>

          <div className={stepRowClass}>
            <Icon iconName="rocket" className={stepIconClass} />
            <span
              className={clsx(
                'flex-1 text-sm font-medium',
                isServiceDeployed
                  ? 'text-neutral-subtle line-through'
                  : hasEnvironment
                    ? 'text-neutral'
                    : 'text-neutral-subtle'
              )}
            >
              Create and deploy my first application
            </span>
            {isServiceDeployed ? (
              <Icon iconName="circle-check" className="text-sm text-positive" />
            ) : isServiceQueued ? (
              <span className="text-ssm font-normal text-neutral-subtle">Deployment queued...</span>
            ) : isServiceDeploying ? (
              <Link
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
                params={{
                  organizationId,
                  projectId: firstProject?.id ?? '',
                  environmentId: firstEnvironment?.id ?? '',
                  serviceId: deployingServiceStatus?.id ?? '',
                  executionId: deployingServiceStatus?.execution_id ?? '',
                }}
                color="brand"
                underline
                size="sm"
                className="group flex truncate"
              >
                <AnimatedGradientText shimmerWidth={80} className="group-hover:text-brand">
                  <span className="flex items-center gap-0.5">
                    Deploying... <Icon iconName="arrow-up-right" />
                  </span>
                </AnimatedGradientText>
              </Link>
            ) : isServiceFailed ? (
              <Link
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/logs/$executionId"
                params={{
                  organizationId,
                  projectId: firstProject?.id ?? '',
                  environmentId: firstEnvironment?.id ?? '',
                  serviceId: failedServiceStatus?.id ?? '',
                  executionId: failedServiceStatus?.execution_id ?? '',
                }}
                color="red"
                underline
                size="sm"
              >
                Last deployment failed <Icon iconName="arrow-up-right" />
              </Link>
            ) : isServiceStopped ? (
              <Link
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId"
                params={{
                  organizationId,
                  projectId: firstProject?.id ?? '',
                  environmentId: firstEnvironment?.id ?? '',
                  serviceId: stoppedServiceStatus?.id ?? '',
                }}
                color="neutral"
                underline
                size="sm"
              >
                Service stopped <Icon iconName="arrow-up-right" />
              </Link>
            ) : hasEnvironment ? (
              <Link
                as="button"
                size="sm"
                color="neutral"
                variant="solid"
                to="/organization/$organizationId/project/$projectId/environment/$environmentId/service/new"
                params={{
                  organizationId,
                  projectId: firstProject?.id ?? '',
                  environmentId: firstEnvironment?.id ?? '',
                }}
              >
                <Icon iconName="circle-plus" />
                New Service
              </Link>
            ) : null}
          </div>

          {hasEphemeralEnvironments && (
            <div className={stepRowClass}>
              <Icon iconName="flask" className={stepIconClass} />
              <span
                className={clsx(
                  'flex-1 text-sm font-medium',
                  isPreviewEnabled
                    ? 'text-neutral-subtle line-through'
                    : isServiceDeployed
                      ? 'text-neutral'
                      : 'text-neutral-subtle'
                )}
              >
                Turn on preview environment
              </span>
              {isPreviewEnabled ? (
                <Icon iconName="circle-check" className="text-sm text-positive" />
              ) : isServiceDeployed ? (
                <Link
                  as="button"
                  size="sm"
                  color="neutral"
                  variant="solid"
                  to="/organization/$organizationId/project/$projectId/environment/$environmentId/settings/preview-environments"
                  params={{
                    organizationId,
                    projectId: firstProject?.id ?? '',
                    environmentId: firstEnvironment?.id ?? '',
                  }}
                >
                  <Icon iconName="gear" />
                  Configure
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SectionOnboarding
