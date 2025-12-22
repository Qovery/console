import { type AlertRuleResponse, type AlertTargetType, type ServiceLightResponse } from 'qovery-typescript-axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ServiceAvatar } from '@qovery/domains/services/feature'
import {
  DropdownMenu,
  Icon,
  InputSearch,
  LoaderSpinner,
  ModalCrud,
  Popover,
  Truncate,
  dropdownMenuItemVariants,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useCreateAlertRule } from '../../hooks/use-create-alert-rule/use-create-alert-rule'
import { useServicesSearch } from '../../hooks/use-services-search/use-services-search'

export interface AlertRulesCloneModalProps {
  alertRule: AlertRuleResponse
  organizationId: string
  onClose: () => void
}

function ServiceItem({ service, onRemove }: { service: ServiceLightResponse; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-3">
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
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-400">{service.name}</span>
          <span className="text-xs text-neutral-350">
            {service.project_name} / {service.environment_name}
          </span>
        </span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-350 transition-colors hover:bg-neutral-200 hover:text-neutral-400"
      >
        <Icon iconName="circle-minus" className="text-sm" />
      </button>
    </div>
  )
}

export function AlertRulesCloneModal({ alertRule, organizationId, onClose }: AlertRulesCloneModalProps) {
  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      selectedServices: [] as string[],
    },
  })
  const { mutate: cloneAlertRule, isLoading: isCloneAlertRuleLoading } = useCreateAlertRule({
    organizationId,
  })
  const { data: services = [], isLoading: isLoadingServices } = useServicesSearch({ organizationId })
  const [searchValue, setSearchValue] = useState('')
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const shouldFocusInputRef = useRef(false)
  const isUserInteractionRef = useRef(false)

  const focusInput = () => {
    if (inputContainerRef.current) {
      const input = inputContainerRef.current.querySelector<HTMLInputElement>('input[data-testid="input-search"]')
      if (input) {
        setTimeout(() => {
          input.focus()
        }, 0)
      }
    }
  }

  useEffect(() => {
    if (shouldFocusInputRef.current && isDropdownOpen && inputContainerRef.current) {
      focusInput()
      shouldFocusInputRef.current = false
    }
  }, [isDropdownOpen])

  const filteredServices = useMemo(() => {
    const availableServices = services.filter((s) => !selectedServiceIds.has(s.id))
    if (!searchValue) return availableServices.slice(0, 20)
    return availableServices
      .filter((service) => service.name?.toLowerCase().includes(searchValue.toLowerCase()))
      .slice(0, 20)
  }, [services, searchValue, selectedServiceIds])

  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.has(s.id))
  }, [services, selectedServiceIds])

  const addService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const newSet = new Set(prev)
      newSet.add(serviceId)
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

  const onSubmit = methods.handleSubmit(() => {
    selectedServices.forEach((service) => {
      cloneAlertRule({
        payload: {
          organization_id: organizationId,
          cluster_id: alertRule.cluster_id,
          target: {
            target_id: service.id,
            target_type: service.service_type as AlertTargetType,
          },
          name: alertRule.name,
          tag: alertRule.tag,
          description: alertRule.description,
          condition: alertRule.condition,
          for_duration: alertRule.for_duration,
          severity: alertRule.severity,
          enabled: alertRule.enabled,
          alert_receiver_ids: alertRule.alert_receiver_ids ?? [],
          presentation: alertRule.presentation,
        },
      })
    })
    onClose()
  })

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Service selection"
        description="Please select all the services you want to clone your alerts on"
        onClose={onClose}
        onSubmit={onSubmit}
        loading={isCloneAlertRuleLoading}
        submitLabel="Clone alerts"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-400">Add service</label>
            <DropdownMenu.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <Popover.Root
                open={isDropdownOpen}
                onOpenChange={(open) => {
                  if (!open && isUserInteractionRef.current) {
                    isUserInteractionRef.current = false
                    return
                  }
                  setIsDropdownOpen(open)
                }}
              >
                <div className="relative">
                  <Popover.Trigger>
                    <button
                      type="button"
                      className="pointer-events-none absolute inset-0 w-full opacity-0"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </Popover.Trigger>
                  <div
                    ref={inputContainerRef}
                    className="relative z-10"
                    onPointerDown={(e) => {
                      isUserInteractionRef.current = true
                      e.stopPropagation()
                      if (!isDropdownOpen) {
                        setIsDropdownOpen(true)
                        shouldFocusInputRef.current = true
                      } else {
                        focusInput()
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isDropdownOpen) {
                        focusInput()
                      } else {
                        shouldFocusInputRef.current = true
                      }
                    }}
                  >
                    <InputSearch
                      placeholder="Search for services to clone alerts on"
                      onChange={(value) => {
                        setSearchValue(value)
                        if (!isDropdownOpen) {
                          setIsDropdownOpen(true)
                        }
                      }}
                    />
                  </div>
                </div>
                <DropdownMenu.Content asChild>
                  <Popover.Content
                    className="w-[448px]"
                    align="start"
                    sideOffset={4}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="bg-white dark:bg-neutral-700" onKeyDown={(e) => e.stopPropagation()}>
                      {isLoadingServices ? (
                        <div className="flex h-20 items-center justify-center">
                          <LoaderSpinner className="w-5" />
                        </div>
                      ) : filteredServices.length === 0 ? (
                        <div className="px-3 py-4 text-center">
                          <Icon iconName="wave-pulse" className="text-neutral-350" />
                          <p className="mt-1 text-xs text-neutral-350">No services found</p>
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto py-1">
                          {filteredServices.map((service) => (
                            <Popover.Close key={service.id} onClick={() => setSearchValue('')}>
                              <DropdownMenu.Item
                                className={twMerge(
                                  dropdownMenuItemVariants({ color: 'brand' }),
                                  'flex items-center gap-3 px-3 py-2'
                                )}
                                onClick={() => {
                                  addService(service.id)
                                }}
                              >
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
                                <span className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-neutral-400">
                                    <Truncate text={service.name ?? ''} truncateLimit={25} />
                                  </span>
                                  <span className="text-xs text-neutral-350">
                                    {service.project_name} / {service.environment_name}
                                  </span>
                                </span>
                              </DropdownMenu.Item>
                            </Popover.Close>
                          ))}
                        </div>
                      )}
                    </div>
                  </Popover.Content>
                </DropdownMenu.Content>
              </Popover.Root>
            </DropdownMenu.Root>
          </div>

          {selectedServices.length > 0 && (
            <div>
              <p className="mb-2 text-2xs font-medium uppercase text-neutral-350">Selected services</p>
              <div className="divide-y divide-neutral-200">
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
