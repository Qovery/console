import { type Organization } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { BlockContent, Button, Checkbox, Icon, LoaderSpinner, Section } from '@qovery/shared/ui'
import { CopilotTermsOfService } from '../copilot-terms-of-service/copilot-terms-of-service'

export interface SectionAICopilotOptInProps {
  organization?: Organization
  isLoading?: boolean
  onEnable: () => void
}

interface OptInFormData {
  hasAcceptedTerms: boolean
}

export function SectionAICopilotOptIn({ organization, isLoading, onEnable }: SectionAICopilotOptInProps) {
  const methods = useForm<OptInFormData>({
    mode: 'onChange',
    defaultValues: {
      hasAcceptedTerms: false,
    },
  })

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = methods

  const onSubmit = handleSubmit(() => {
    onEnable()
  })

  return (
    <FormProvider {...methods}>
      <Section>
        <BlockContent title="Opt-in to Copilot" classNameContent="p-0">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <LoaderSpinner className="w-5" />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Icon iconName="robot" className="mr-2 text-brand" />
                      <p className="text-sm font-medium text-neutral">Opt-in to Copilot</p>
                    </div>
                    <p className="text-xs text-neutral-subtle">
                      Please review and accept the following terms to enable Copilot for your organization.
                    </p>
                  </div>

                  <CopilotTermsOfService />

                  <Controller
                    name="hasAcceptedTerms"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <span className="text-sm text-neutral">
                          I have read and accept the Copilot Terms of Service
                        </span>
                      </label>
                    )}
                  />

                  <Button type="submit" size="md" color="brand" disabled={!isValid} className="mt-4">
                    <Icon iconName="circle-check" />
                    Enable Copilot
                  </Button>
                </div>
              </div>
            </form>
          )}
        </BlockContent>
      </Section>
    </FormProvider>
  )
}

export default SectionAICopilotOptIn
