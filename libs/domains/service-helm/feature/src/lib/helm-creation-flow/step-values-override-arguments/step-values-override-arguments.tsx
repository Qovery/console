import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { buildHelmSourceFromGeneralData } from '@qovery/domains/services/feature'
import { Button, Callout, FunnelFlowBody, Icon } from '@qovery/shared/ui'
import { ValuesOverrideArgumentsSettingBase } from '../../values-override-arguments-setting/values-override-arguments-setting'
import { useHelmCreateContext } from '../helm-creation-flow'

export function HelmStepValuesOverrideArguments() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const { environmentId = '' } = useParams({ strict: false })
  const { generalForm, valuesOverrideArgumentsForm, setCurrentStep, creationFlowUrl } = useHelmCreateContext()

  const generalData = generalForm.getValues()
  const source = buildHelmSourceFromGeneralData(generalData)

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const handleSubmit = valuesOverrideArgumentsForm.handleSubmit((data) => {
    valuesOverrideArgumentsForm.reset(data)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...valuesOverrideArgumentsForm}>
        <ValuesOverrideArgumentsSettingBase
          methods={valuesOverrideArgumentsForm}
          onSubmit={handleSubmit}
          source={source}
          environmentId={environmentId}
        >
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
            <Button type="submit" size="lg" disabled>
              Continue
            </Button>
          </div>
        </ValuesOverrideArgumentsSettingBase>
      </FormProvider>
    </FunnelFlowBody>
  )
}
