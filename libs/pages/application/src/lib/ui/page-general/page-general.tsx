import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { EnableObservabilityModal } from '@qovery/domains/observability/feature'
import { TerraformResourcesSection } from '@qovery/domains/service-terraform/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { PodStatusesCallout, PodsMetrics, ServiceDetails } from '@qovery/domains/services/feature'
import { OutputVariables } from '@qovery/domains/variables/feature'
import { Button, ExternalLink, Icon, TabsPrimitives, useModal } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'

const { Tabs } = TabsPrimitives

export interface PageGeneralProps {
  serviceId: string
  environmentId: string
  service: AnyService
  hasNoMetrics: boolean
}

function ObservabilityCallout() {
  const [isOpen, setIsOpen] = useLocalStorage('observability-callout-open', true)
  const { openModal } = useModal()

  if (!isOpen) return null

  return (
    <div className="relative flex gap-2 overflow-hidden rounded-md p-6 text-neutral-50 [background:linear-gradient(91deg,_#7062F5_0%,_#8F4FD8_99.96%)]">
      <motion.div
        className="absolute inset-0 opacity-80"
        animate={{
          background: [
            'linear-gradient(45deg, #7062F5, #8F4FD8, #6366F1, #8B5CF6, #7062F5)',
            'linear-gradient(45deg, #8F4FD8, #6366F1, #8B5CF6, #7062F5, #8F4FD8)',
            'linear-gradient(45deg, #6366F1, #8B5CF6, #7062F5, #8F4FD8, #6366F1)',
            'linear-gradient(45deg, #7062F5, #8F4FD8, #6366F1, #8B5CF6, #7062F5)',
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <svg
        className="absolute bottom-0 right-0"
        xmlns="http://www.w3.org/2000/svg"
        width="936"
        height="96"
        fill="none"
        viewBox="0 0 936 96"
      >
        <g clipPath="url(#clip0_1104_64202)" opacity="0.5">
          <path
            fill="url(#paint0_linear_1104_64202)"
            d="M-237.361 6.154-280 19.487V120h1496V44.359l-3.63-9.23-15.42 1.538-14.52-7.436-32.66 7.436V24.359l-36.29 15.897-49.89 21.026V45.897l-32.66 15.385-9.98-4.102-14.52-16.924-36.286 11.282-36.288-17.948-8.165 15.128-14.516-16.154-11.794 7.692-52.618 8.462h-58.969l-29.938-12.051-28.124 31.282-19.052-10.77-43.546 10.77-12.701-22.052-22.68 7.95-28.124-2.309-26.309-22.307-28.124 35.897-26.309-19.23-18.145 19.23-75.299 9.744-13.208-9.744-16.73 9.744-14.515-4.103-41.732 4.103V53.846l-29.031-2.307-7.992-22.308-11.967 27.948-19.739-24.615-20.178 38.205-24.495-22.051-34.475 22.051-23.734-13.59-22.534 7.95L138 51.538l-11.567 9.743-23.588-15.385v-26.41l-55.34 17.18V24.359L23.917 36.667l-29.03-17.18-26.31 9.744-9.98-12.308-21.772 12.308-16.33-4.872-9.98 8.205-9.979 4.103-15.423 3.59L-128.495 0l-21.773 15.385-24.495 30.512L-185.649 0l-16.33 16.923L-210.144 0l-8.165 24.359-10.887-21.538-4.536 15.897z"
            opacity="0.35"
          ></path>
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_1104_64202"
            x1="-275.567"
            x2="1178.3"
            y1="114.5"
            y2="30.54"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.013" stopColor="#C7D3E4" stopOpacity="0"></stop>
            <stop offset="1" stopColor="#C7D3E4"></stop>
          </linearGradient>
          <clipPath id="clip0_1104_64202">
            <path fill="#fff" d="M0 0h936v158H0z"></path>
          </clipPath>
        </defs>
      </svg>
      <div className="absolute bottom-0 left-0 h-full w-full opacity-30">
        <div className="absolute bottom-0 right-0 flex h-full w-full justify-between gap-0.5 p-0.5">
          {Array.from({ length: 10 }).map((_, index) => (
            <svg
              key={index}
              className={index < 4 ? 'opacity-0' : ''}
              xmlns="http://www.w3.org/2000/svg"
              width="2"
              height="100%"
              fill="none"
              viewBox="0 0 2 94"
            >
              <path
                stroke="#C6D3E7"
                strokeDasharray="0.58 2.31"
                strokeLinecap="square"
                strokeWidth="0.579"
                d="M.855 92.813V1.248"
              />
            </svg>
          ))}
        </div>
        <div className="absolute bottom-0 right-0 flex h-full flex-col justify-between p-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <svg key={index} xmlns="http://www.w3.org/2000/svg" width="100%" height="2" fill="none" viewBox="0 0 687 2">
              <path
                stroke="url(#paint0_linear_1104_64197)"
                strokeDasharray="0.58 2.31"
                strokeLinecap="square"
                strokeWidth="0.579"
                d="M.614.868h685.489"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_1104_64197"
                  x1="0"
                  x2="686.818"
                  y1="0.579"
                  y2="0.579"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#C6D3E7" stopOpacity="0"></stop>
                  <stop offset="0.495" stopColor="#C6D3E7"></stop>
                </linearGradient>
              </defs>
            </svg>
          ))}
        </div>
      </div>

      <div className="relative flex h-full w-full items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path
                fill="#fff"
                d="M6.56 2.578a.39.39 0 0 1-.202.342L2.738 4.91a.39.39 0 0 0-.201.342v5.498a.39.39 0 0 0 .202.342l3.619 1.989a.39.39 0 0 1 .202.341V16L.405 12.618A.78.78 0 0 1 0 11.934V4.066a.78.78 0 0 1 .405-.684L6.56 0zM15.595 3.382c.25.137.405.4.405.684v7.868a.78.78 0 0 1-.405.684L9.44 16v-2.578a.39.39 0 0 1 .202-.343l3.62-1.988a.39.39 0 0 0 .201-.342V5.251a.39.39 0 0 0-.202-.342L9.642 2.92a.39.39 0 0 1-.202-.342V0z"
              ></path>
              <path
                fill="#fff"
                fillRule="evenodd"
                d="M10.393 9.315v-2.63L8 5.371 5.608 6.685v2.63L8 10.629z"
                clipRule="evenodd"
              ></path>
            </svg>
            Observabilty is here!
          </p>
          <p className="text-sm">
            Designed to make troubleshooting and observability accessible to everyone on your team!
          </p>
        </div>
        <Button
          radius="full"
          size="sm"
          className="bg-neutral-50 text-neutral-700 hover:bg-neutral-150 focus:bg-neutral-150 active:scale-[0.97] active:bg-neutral-150"
          onClick={() =>
            openModal({
              content: <EnableObservabilityModal />,
              options: {
                width: 680,
              },
            })
          }
        >
          Discover feature
        </Button>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="absolute right-2 top-2 flex h-3.5 w-3.5 items-center justify-center p-0.5 text-neutral-50 transition-colors hover:text-neutral-200"
      >
        <Icon iconName="xmark" iconStyle="regular" />
      </button>
    </div>
  )
}

export function PageGeneral({ serviceId, environmentId, service, hasNoMetrics }: PageGeneralProps) {
  const [activeTab, setActiveTab] = useState('variables')

  const isLifecycleJob = useMemo(() => service?.serviceType === 'JOB' && service.job_type === 'LIFECYCLE', [service])
  const isTerraformService = useMemo(() => service?.serviceType === 'TERRAFORM', [service])
  const isCronJob = useMemo(() => service?.serviceType === 'JOB' && service.job_type === 'CRON', [service])

  return (
    <div className="flex grow flex-row">
      <div className="flex min-h-0 flex-1 grow flex-col gap-6 overflow-y-auto px-10 py-7">
        {hasNoMetrics && <ObservabilityCallout />}
        <PodStatusesCallout environmentId={environmentId} serviceId={serviceId} />
        {!isTerraformService && (
          <PodsMetrics environmentId={environmentId} serviceId={serviceId}>
            {isCronJob && (
              <div className="grid grid-cols-[min-content_1fr] gap-x-3 gap-y-1 rounded border border-neutral-250 bg-neutral-100 p-3 text-xs text-neutral-350">
                <Icon className="row-span-2" iconName="circle-info" iconStyle="regular" />
                <p>
                  The number of past Completed or Failed job execution retained in the history and their TTL can be
                  customized in the advanced settings.
                </p>
                <ExternalLink
                  className="text-xs"
                  href="https://www.qovery.com/docs/configuration/service-advanced-settings#cronjob-failed-jobs-history-limit"
                >
                  See documentation
                </ExternalLink>
              </div>
            )}
          </PodsMetrics>
        )}
        {isLifecycleJob && <OutputVariables serviceId={serviceId} serviceType={service?.serviceType} />}
        {isTerraformService && (
          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full rounded-lg border border-neutral-200"
          >
            <Tabs.List className="rounded-t-lg border-b border-neutral-200 bg-neutral-100">
              <Tabs.Trigger value="variables">Output Variables</Tabs.Trigger>
              <Tabs.Trigger value="resources">Infrastructure Resources</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="variables">
              <OutputVariables serviceId={serviceId} serviceType={service?.serviceType} />
            </Tabs.Content>
            <Tabs.Content value="resources">
              <TerraformResourcesSection terraformId={serviceId} />
            </Tabs.Content>
          </Tabs.Root>
        )}
      </div>
      <ServiceDetails
        className="w-1/4 max-w-[360px] flex-1 border-l"
        environmentId={environmentId}
        serviceId={serviceId}
      />
    </div>
  )
}

export default PageGeneral
