import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Icon, InputTextSmall, ModalCrud } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

interface CreateKeyAlertsModalProps {
  onClose: () => void
  service?: AnyService
  onSubmit: (data: CreateKeyAlertsFormData) => void
}

interface CreateKeyAlertsFormData {
  targetedService: string
  metricCategories: string[]
}

interface MetricCategory {
  id: string
  label: string
  iconName: IconName
}

const METRIC_CATEGORIES: MetricCategory[] = [
  { id: 'instances', label: 'Instances', iconName: 'cloud' },
  { id: 'k8s_event', label: 'k8s event', iconName: 'cube' },
  { id: 'cpu', label: 'CPU', iconName: 'microchip' },
  { id: 'memory', label: 'Memory', iconName: 'server' },
  { id: 'network', label: 'Network', iconName: 'code' },
  { id: 'logs', label: 'Logs', iconName: 'file-lines' },
]

export function CreateKeyAlertsModal({ onClose, service, onSubmit: onSubmitProp }: CreateKeyAlertsModalProps) {
  const methods = useForm<CreateKeyAlertsFormData>({
    mode: 'onChange',
    defaultValues: {
      targetedService: service?.id ?? undefined,
      metricCategories: [],
    },
    resolver: (values) => {
      const errors: Record<string, { type: string; message: string }> = {}
      if (!values.metricCategories || values.metricCategories.length === 0) {
        errors['metricCategories'] = {
          type: 'required',
          message: 'At least one category must be selected',
        }
      }
      return {
        values,
        errors,
      }
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    onSubmitProp(data)
  })

  const watchMetricCategories = methods.watch('metricCategories')

  const toggleCategory = (categoryId: string) => {
    const currentCategories = watchMetricCategories || []
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId]

    methods.setValue('metricCategories', newCategories, { shouldValidate: true })
  }

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title="Create key alerts"
        description="Please select the type of alert want to add to your service."
        onClose={onClose}
        onSubmit={onSubmit}
        submitLabel="Configure alerts"
      >
        <div className="-mt-1 flex flex-col gap-5">
          <div className="relative">
            <Controller
              name="targetedService"
              control={methods.control}
              render={({ field }) => (
                <InputTextSmall
                  label="Targeted service"
                  name="targetedService"
                  inputClassName="pl-7 text-neutral-350"
                  value={service?.name ?? ''}
                  onChange={(value) => field.onChange(value)}
                  disabled={!!service}
                  placeholder="Search service"
                />
              )}
            />
            <Icon
              iconName="search"
              iconStyle="regular"
              className="absolute left-2 top-1/2 mt-[1px] -translate-y-1/2 text-sm text-neutral-350"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col text-sm">
              <h3 className="text-sm font-medium text-neutral-400">Metric categories</h3>
              <p className="text-neutral-350">Choose the metric categories you want to generate alerts for</p>
            </div>

            <div className="mb-1 grid grid-cols-3 gap-2">
              {METRIC_CATEGORIES.map((category) => {
                const isSelected = watchMetricCategories?.includes(category.id)

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        event.stopPropagation()
                        toggleCategory(category.id)
                      }
                    }}
                    className={twMerge(
                      'group flex flex-col items-center justify-center gap-2 rounded-lg border p-4 outline-none transition-colors hover:border-brand-500 focus:border-brand-500 focus:ring-0',
                      isSelected ? 'border-brand-500' : 'border-neutral-200 bg-white'
                    )}
                    autoFocus={false}
                  >
                    <div
                      className={twMerge(
                        'flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-150 text-neutral-400 transition-colors group-hover:bg-brand-50 group-hover:text-brand-500 group-focus:bg-brand-50 group-focus:text-brand-500',
                        isSelected ? 'bg-brand-50 text-brand-500' : 'bg-neutral-150 text-neutral-400'
                      )}
                    >
                      <Icon iconName={category.iconName} iconStyle="regular" className="text-base" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">{category.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}

export default CreateKeyAlertsModal
