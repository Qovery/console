import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { buildHelmSourceFromGeneralData } from '@qovery/domains/services/feature'
import { Button, FunnelFlowBody } from '@qovery/shared/ui'
import { ValuesOverrideArgumentsSetting } from '../../values-override-arguments-setting/values-override-arguments-setting'
import { useHelmCreateContext } from '../helm-creation-flow'

export function HelmStepValuesOverrideArguments() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const { generalForm, valuesOverrideArgumentsForm, setCurrentStep, creationFlowUrl } = useHelmCreateContext()

  const generalData = generalForm.getValues()
  const source = buildHelmSourceFromGeneralData(generalData)

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const handleSubmit = valuesOverrideArgumentsForm.handleSubmit((data) => {
    valuesOverrideArgumentsForm.reset(data)
    navigate({ to: `${creationFlowUrl}/summary`, search })
  })

  const watchArguments = valuesOverrideArgumentsForm.watch('arguments') ?? []
  const isContinueDisabled = watchArguments.length > 0 && !valuesOverrideArgumentsForm.formState.isValid

  return (
    <FunnelFlowBody>
      <FormProvider {...valuesOverrideArgumentsForm}>
        <ValuesOverrideArgumentsSetting methods={valuesOverrideArgumentsForm} onSubmit={handleSubmit} source={source}>
          <div className="mt-10 flex justify-between">
            <Button
              type="button"
              size="lg"
              variant="plain"
              color="neutral"
              onClick={() => navigate({ to: `${creationFlowUrl}/values-override-file`, search })}
            >
              Back
            </Button>
            <Button type="submit" size="lg" disabled={isContinueDisabled}>
              Continue
            </Button>
          </div>
        </ValuesOverrideArgumentsSetting>
      </FormProvider>
    </FunnelFlowBody>
  )
}
