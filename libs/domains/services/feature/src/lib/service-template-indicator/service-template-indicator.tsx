import { type VariantProps, cva } from 'class-variance-authority'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Icon, Indicator, type IndicatorProps, Tooltip } from '@qovery/shared/ui'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'

const indicatorVariants = cva('rounded-full bg-white', {
  variants: {
    size: {
      md: ['h-6', 'w-6', 'top-2.5', 'right-2.5'],
      sm: ['h-4', 'w-4', 'top-1.5', 'right-1'],
      xs: ['h-2', 'w-2', 'top-1', 'right-0.5'],
    },
    defaultVariants: {
      size: 'md',
    },
  },
})

export interface ServiceTemplateIndicatorProps
  extends Omit<IndicatorProps, 'content'>,
    VariantProps<typeof indicatorVariants> {
  service: AnyService
}

export function ServiceTemplateIndicator({
  className,
  children,
  size,
  service,
  ...props
}: ServiceTemplateIndicatorProps) {
  const templateType = match(service)
    .with({ serviceType: 'JOB', job_type: 'LIFECYCLE' }, ({ schedule: { lifecycle_type } }) =>
      lifecycle_type !== 'GENERIC' ? lifecycle_type : undefined
    )
    .with({ serviceType: 'DATABASE', mode: 'MANAGED' }, () => 'AWS')
    .with({ serviceType: 'DATABASE', mode: 'CONTAINER' }, () => 'CONTAINER')
    .otherwise(() => null)
  if (templateType) {
    return (
      <Indicator
        className={twMerge(indicatorVariants({ size }), className)}
        content={
          <Tooltip content={`via ${upperCaseFirstLetter(templateType)}`}>
            <span className="flex h-full w-full items-center justify-center">
              <Icon className="h-[calc(100%-2px)] w-[calc(100%-2px)]" name={templateType} />
            </span>
          </Tooltip>
        }
        children={children}
        {...props}
      />
    )
  } else {
    return children
  }
}

export default ServiceTemplateIndicator
