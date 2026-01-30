import { Controller, useFormContext } from 'react-hook-form'
import { Callout, Checkbox, ExternalLink, Icon } from '@qovery/shared/ui'

export interface ApplyImmediatelyCheckboxProps {
  disabled?: boolean
}

export function ApplyImmediatelyCheckbox({ disabled = false }: ApplyImmediatelyCheckboxProps) {
  const { control, watch } = useFormContext()

  const applyImmediately = watch('apply_immediately')

  return (
    <div className="space-y-3">
      <Controller
        name="apply_immediately"
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className="mt-0.5"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-neutral-400">Apply changes immediately</span>
              <p className="mt-1 text-xs text-neutral-350">
                Apply the changes immediately instead of waiting for the maintenance window.
              </p>
            </div>
          </label>
        )}
      />

      <Callout.Root color="yellow" data-testid="maintenance-warning">
        <Callout.Icon>
          <Icon iconName={applyImmediately ? 'triangle-exclamation' : 'circle-info'} iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text className="text-neutral-400">
          <div className="space-y-3">
            <div>
              Once triggered, the update will be managed by your cloud provider and applied during the configured
              maintenance window. Moreover, the operation might cause a service interruption.{' '}
              <ExternalLink
                className="mt-1"
                href="https://www.qovery.com/docs/configuration/database#applying-changes-to-a-managed-database"
              >
                Have a look at the documentation first
              </ExternalLink>
            </div>
            {applyImmediately && (
              <div className="border-t border-yellow-400/30 pt-3">
                <span className="font-medium">Warning:</span> Applying changes immediately may cause a brief service
                interruption. The operation will be performed outside of your configured maintenance window.
              </div>
            )}
          </div>
        </Callout.Text>
      </Callout.Root>
    </div>
  )
}

export default ApplyImmediatelyCheckbox
