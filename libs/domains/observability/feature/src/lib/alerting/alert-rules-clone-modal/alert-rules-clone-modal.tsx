import clsx from 'clsx'
import { Command } from 'cmdk'
import { type AlertRuleResponse, type AlertTargetType, type ServiceLightResponse } from 'qovery-typescript-axios'
import { useMemo, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import {
  Button,
  Icon,
  LoaderSpinner,
  ModalCrud,
  Popover,
  ToastEnum,
  Truncate,
  dropdownMenuItemVariants,
  toast,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useClusters } from '../../hooks/use-clusters/use-clusters'
import { useCreateAlertRule } from '../../hooks/use-create-alert-rule/use-create-alert-rule'
import { useServicesSearch } from '../../hooks/use-services-search/use-services-search'

export interface AlertRulesCloneModalProps {
  organizationId: string
  onClose: () => void
  alertRule?: AlertRuleResponse
  alertRules?: AlertRuleResponse[]
}

function ServiceItem({ service, onRemove }: { service: ServiceLightResponse; onRemove: () => void }) {
  return (
    <div className="flex w-full items-center justify-between gap-3 py-3">
      <span className="flex w-full items-center gap-3">
        <ServiceAvatar
          size="xs"
          service={
            service.service_type === 'JOB'
              ? {
                  icon_uri: service.icon_uri,
                  serviceType: 'JOB' as const,
                  job_type: service.job_type ?? 'CRON',
                }
              : {
                  icon_uri: service.icon_uri,
                  serviceType: service.service_type,
                }
          }
        />
        <span className="flex w-full items-center justify-between gap-2">
          <span className="text-sm font-medium text-neutral">
            <Truncate text={service.name} truncateLimit={30} />
          </span>
          <span className="text-ssm font-normal text-neutral">
            <Truncate text={service.project_name} truncateLimit={15} /> /{' '}
            <Truncate text={service.environment_name} truncateLimit={15} />
          </span>
        </span>
      </span>
      <Button variant="outline" color="neutral" size="xs" onClick={onRemove} className="w-6 justify-center">
        <Icon iconName="circle-minus" iconStyle="regular" className="text-sm" />
      </Button>
    </div>
  )
}

export function AlertRulesCloneModal({ alertRule, alertRules, organizationId, onClose }: AlertRulesCloneModalProps) {
  const rulesToClone = alertRules ?? (alertRule ? [alertRule] : [])
  const firstRule = rulesToClone[0]

  const methods = useForm({
    mode: 'all',
    defaultValues: {
      selectedServices: [] as string[],
    },
  })
  const { register } = methods
  register('selectedServices', {
    validate: (value: string[]) => value.length > 0 || 'At least one service must be selected',
  })
  const { mutateAsync: cloneAlertRule } = useCreateAlertRule({
    organizationId,
  })
  const { data: clusters = [] } = useClusters({ organizationId })
  const clustersWithObservabilityEnabled = clusters.filter(({ metrics_parameters }) => metrics_parameters?.enabled)
  const { data: services = [], isLoading: isLoadingServices } = useServicesSearch({
    organizationId,
    clusterIds: clustersWithObservabilityEnabled.map(({ id }) => id),
  })
  const [searchValue, setSearchValue] = useState('')
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredServices = useMemo(() => {
    if (!searchValue) return services.slice(0, 20)
    return services.filter((service) => service.name?.toLowerCase().includes(searchValue.toLowerCase())).slice(0, 20)
  }, [services, searchValue])

  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.has(s.id))
  }, [services, selectedServiceIds])

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId)
      } else {
        newSet.add(serviceId)
      }
      methods.setValue('selectedServices', Array.from(newSet), { shouldValidate: true })
      return newSet
    })
    setSearchValue('')
  }

  const removeService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(serviceId)
      methods.setValue('selectedServices', Array.from(newSet), { shouldValidate: true })
      return newSet
    })
  }

  const onSubmit = methods.handleSubmit(async () => {
    if (!firstRule?.cluster_id) {
      return
    }

    setIsCloning(true)
    try {
      await Promise.all(
        rulesToClone.flatMap((rule) =>
          selectedServices.map((service) =>
            cloneAlertRule({
              payload: {
                organization_id: organizationId,
                cluster_id: rule.cluster_id ?? firstRule.cluster_id,
                target: {
                  target_id: service.id,
                  target_type: service.service_type as AlertTargetType,
                },
                name: rule.name,
                tag: rule.tag,
                description: rule.description,
                condition: rule.condition,
                for_duration: rule.for_duration,
                severity: rule.severity,
                enabled: rule.enabled,
                alert_receiver_ids: rule.alert_receiver_ids ?? [],
                presentation: rule.presentation,
              },
            })
          )
        )
      )
      toast(ToastEnum.SUCCESS, 'Alert rules cloned successfully')
      onClose()
    } catch (error) {
      console.error('Error cloning alert rules:', error)
    } finally {
      setIsCloning(false)
    }
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Service selection"
        description={
          rulesToClone.length > 1
            ? `Please select all the services you want to clone ${rulesToClone.length} alerts on`
            : 'Please select all the services you want to clone your alerts on'
        }
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isCloning}
        submitLabel="Clone alerts"
      >
        <div className="flex flex-col gap-4">
          {/* This is a workaround to prevent the input from being focused when the user opens the modal */}
          <button
            type="button"
            className="pointer-events-none absolute h-0 w-0 select-none opacity-0 outline-none"
          ></button>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral">Add service</label>
            <Popover.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <Command className="relative overflow-visible bg-transparent" shouldFilter={false}>
                <Popover.Trigger onClick={(e) => e.preventDefault()}>
                  <div className="relative">
                    <Icon
                      iconStyle="regular"
                      iconName="magnifying-glass"
                      className="pointer-events-none absolute left-3 top-1/2 block -translate-y-1/2 text-base leading-none text-neutral"
                    />
                    <Command.Input
                      ref={inputRef}
                      placeholder="Search for services to clone alerts on"
                      value={searchValue}
                      onValueChange={(value) => {
                        setSearchValue(value)
                        if (!isDropdownOpen) {
                          setIsDropdownOpen(true)
                        }
                      }}
                      onFocus={() => {
                        setIsDropdownOpen(true)
                      }}
                      className="h-10 w-full rounded border border-neutral bg-transparent pl-10 pr-6 text-sm leading-none text-neutral placeholder:text-neutral-subtle focus:border-brand-11 focus:outline-none focus:transition-[border-color]"
                    />
                    {searchValue && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSearchValue('')
                          inputRef.current?.focus()
                        }}
                      >
                        <Icon className="text-sm text-neutral" iconName="circle-xmark" />
                      </button>
                    )}
                  </div>
                </Popover.Trigger>
                <Popover.Content
                  className="w-[448px] p-0"
                  align="start"
                  sideOffset={4}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  container={document.body}
                >
                  <Command.List className="max-h-60 overflow-y-auto rounded border border-neutral p-2">
                    {isLoadingServices ? (
                      <div className="flex h-20 items-center justify-center">
                        <LoaderSpinner className="w-4" />
                      </div>
                    ) : filteredServices.length === 0 ? (
                      <Command.Empty>
                        <div className="px-3 py-4 text-center">
                          <Icon iconName="wave-pulse" className="text-neutral-subtle" />
                          <p className="mt-1 text-xs text-neutral-subtle">No services found</p>
                        </div>
                      </Command.Empty>
                    ) : (
                      filteredServices.map((service) => {
                        const isSelected = selectedServiceIds.has(service.id)
                        return (
                          <Command.Item
                            key={service.id}
                            value={`${service.name} ${service.project_name} ${service.environment_name}`}
                            onSelect={() => {
                              toggleService(service.id)
                              setIsDropdownOpen(false)
                            }}
                            className={twMerge(
                              dropdownMenuItemVariants({
                                color: 'brand',
                                className: clsx(
                                  'gap-2 data-[selected=true]:bg-surface-brand-subtle',
                                  isSelected &&
                                    'bg-surface-positive-subtle text-positive hover:bg-surface-positive-subtle hover:text-positive focus:bg-surface-positive-subtle focus:text-positive data-[selected=true]:bg-surface-positive-subtle'
                                ),
                              })
                            )}
                          >
                            {isSelected ? (
                              <Icon iconName="circle-check" iconStyle="regular" className="text-base text-positive" />
                            ) : (
                              <ServiceAvatar
                                size="xs"
                                service={
                                  service.service_type === 'JOB'
                                    ? {
                                        icon_uri: service.icon_uri,
                                        serviceType: 'JOB' as const,
                                        job_type: service.job_type ?? 'CRON',
                                      }
                                    : {
                                        icon_uri: service.icon_uri,
                                        serviceType: service.service_type,
                                      }
                                }
                              />
                            )}
                            <span className="flex flex-1 items-center gap-2">
                              <span className="text-sm font-medium">
                                <Truncate text={service.name ?? ''} truncateLimit={30} />
                              </span>
                              <span
                                className={clsx('ml-auto text-xs font-normal', { 'text-neutral-subtle': !isSelected })}
                              >
                                <Truncate text={service.project_name} truncateLimit={15} /> /{' '}
                                <Truncate text={service.environment_name} truncateLimit={15} />
                              </span>
                            </span>
                          </Command.Item>
                        )
                      })
                    )}
                  </Command.List>
                </Popover.Content>
              </Command>
            </Popover.Root>
          </div>

          {selectedServices.length > 0 && (
            <div>
              <p className="mb-2 text-2xs font-medium uppercase text-neutral">Selected services</p>
              <div className="divide-y divide-neutral">
                {selectedServices.map((service) => (
                  <ServiceItem key={service.id} service={service} onRemove={() => removeService(service.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
