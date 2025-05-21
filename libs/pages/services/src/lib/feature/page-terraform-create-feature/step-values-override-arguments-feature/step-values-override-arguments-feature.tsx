import { type HelmRequestAllOfSourceOneOf, type HelmRequestAllOfSourceOneOf1 } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ValuesOverrideArgumentsSetting } from '@qovery/domains/service-helm/feature'
import { SERVICES_HELM_CREATION_SUMMARY_URL, SERVICES_HELM_CREATION_VALUES_STEP_1_URL } from '@qovery/shared/routes'
import { Button, FunnelFlowBody } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepValuesOverrideArgumentsFeature() {
  useDocumentTitle('General - Values override as arguments')

  const { generalForm, setCurrentStep, valuesOverrideArgumentsForm, creationFlowUrl } = useHelmCreateContext()

  const generalData = generalForm.getValues()

  const source = match(generalData.source_provider)
    .with('GIT', (): HelmRequestAllOfSourceOneOf => {
      return {
        git_repository: {
          url: buildGitRepoUrl(generalData.provider ?? '', generalData.repository),
          branch: generalData.branch,
          root_path: generalData.root_path,
          git_token_id: generalData.git_token_id,
        },
      }
    })
    .with(
      'HELM_REPOSITORY',
      (): HelmRequestAllOfSourceOneOf1 => ({
        helm_repository: {
          repository: generalData.repository,
          chart_name: generalData.chart_name,
          chart_version: generalData.chart_version,
        },
      })
    )
    .exhaustive()

  const navigate = useNavigate()

  useEffect(() => {
    setCurrentStep(3)
  }, [setCurrentStep])

  const onSubmit = valuesOverrideArgumentsForm.handleSubmit(() => {
    navigate(creationFlowUrl + SERVICES_HELM_CREATION_SUMMARY_URL)
  })

  return (
    <FunnelFlowBody>
      <FormProvider {...valuesOverrideArgumentsForm}>
        <ValuesOverrideArgumentsSetting methods={valuesOverrideArgumentsForm} onSubmit={onSubmit} source={source}>
          <div className="mt-10 flex justify-between">
            <Button
              type="button"
              size="lg"
              variant="plain"
              color="neutral"
              onClick={() => navigate(creationFlowUrl + SERVICES_HELM_CREATION_VALUES_STEP_1_URL)}
            >
              Back
            </Button>
            <div className="flex gap-3">
              <Button
                type="submit"
                size="lg"
                onClick={onSubmit}
                disabled={!valuesOverrideArgumentsForm.formState.isValid}
              >
                Continue
              </Button>
            </div>
          </div>
        </ValuesOverrideArgumentsSetting>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepValuesOverrideArgumentsFeature
