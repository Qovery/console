import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useHelmRepositories } from '@qovery/domains/organizations/feature'
import { type ArgumentTypes, useCreateHelmService } from '@qovery/domains/service-helm/feature'
import { useDeployService } from '@qovery/domains/services/feature'
import {
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_GENERAL_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_HELM_CREATION_VALUES_STEP_1_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Heading, Icon, Section, truncateText } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Helm')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const { generalForm, valuesOverrideFileForm, valuesOverrideArgumentsForm, setCurrentStep } = useHelmCreateContext()
  const generalData = generalForm.getValues()
  const valuesOverrideFileData = valuesOverrideFileForm.getValues()
  const valuesOverrideArgumentData = valuesOverrideArgumentsForm.getValues()
  setCurrentStep(4)

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`

  const { mutateAsync: createHelmService } = useCreateHelmService()
  const { mutateAsync: deployService } = useDeployService({ environmentId })
  const { data: helmRepositories = [] } = useHelmRepositories({ organizationId })
  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const [isLoadingCreateAndDeploy, setIsLoadingCreateAndDeploy] = useState(false)

  const onSubmit = async (withDeploy: boolean) => {
    if (withDeploy) {
      setIsLoadingCreateAndDeploy(true)
    } else {
      setIsLoadingCreate(true)
    }

    const source = match(generalData.source_provider)
      .with('GIT', () => {
        return {
          git_repository: {
            url: buildGitRepoUrl(generalData.provider ?? '', generalData.repository),
            branch: generalData.branch,
            root_path: generalData.root_path,
            git_token_id: generalData.git_token_id,
          },
        }
      })
      .with('HELM_REPOSITORY', () => ({
        helm_repository: {
          repository: generalData.repository,
          chart_name: generalData.chart_name,
          chart_version: generalData.chart_version,
        },
      }))
      .exhaustive()

    const valuesOverrideFile = match(valuesOverrideFileData.type)
      .with('GIT_REPOSITORY', () => {
        return {
          git: {
            git_repository: {
              url: buildGitRepoUrl(valuesOverrideFileData.provider ?? '', valuesOverrideFileData.repository!),
              branch: valuesOverrideFileData.branch!,
              git_token_id: valuesOverrideFileData.git_token_id,
            },
            paths: valuesOverrideFileData.paths?.split(',') ?? [],
          },
        }
      })
      .with('YAML', () => ({
        raw: {
          values: [
            {
              name: 'override',
              content: valuesOverrideFileData.content!,
            },
          ],
        },
      }))
      .with('NONE', () => null)
      .exhaustive()

    const getValuesByType = (type: ArgumentTypes) => {
      return valuesOverrideArgumentData.arguments.filter((a) => a.type === type).map((a) => [a.key, a.json ?? a.value])
    }

    try {
      const response = await createHelmService({
        environmentId,
        helmRequest: {
          name: generalData.name,
          description: generalData.description,
          source,
          allow_cluster_wide_resources: generalData.allow_cluster_wide_resources,
          arguments: JSON.parse(generalData.arguments),
          timeout_sec: parseInt(generalData.timeout_sec, 10),
          auto_deploy: generalData.auto_deploy || (valuesOverrideFileData.auto_deploy ?? false),
          values_override: {
            set: getValuesByType('--set'),
            set_string: getValuesByType('--set-string'),
            set_json: getValuesByType('--set-json'),
            file: valuesOverrideFile,
          },
        },
      })

      if (withDeploy) {
        await deployService({ serviceId: response.id, serviceType: 'HELM' })
        setIsLoadingCreateAndDeploy(false)
      }

      setIsLoadingCreate(false)
      navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL)
    } catch (error) {
      setIsLoadingCreateAndDeploy(false)
      setIsLoadingCreate(false)
    }
  }

  return (
    <FunnelFlowBody>
      <Section>
        <Heading className="mb-2">Ready to create your Helm chart</Heading>
        <p className="text-sm text-neutral-350 mb-10">
          The setup is done, you can now create and deploy your Helm chart.
        </p>

        <div className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-2">
          <Icon iconName="check" className="text-green-500 mr-2" />
          <div className="flex-grow mr-2">
            <div className="text-sm text-neutral-400 font-bold mb-5">Helm General Data</div>

            <div className="text-neutral-400 text-ssm mb-2 font-medium">Helm chart general</div>

            <ul className="text-neutral-350 text-sm list-none">
              <li>
                <span className="font-medium">Name:</span> {generalData.name}
              </li>
              {generalData.description && (
                <li>
                  <span className="font-medium">Description:</span> {generalData.description}
                </li>
              )}
            </ul>

            <div className="my-4 border-b border-neutral-250 border-dashed" />

            <div className="text-neutral-400 text-ssm mb-2 font-medium">Source</div>

            {generalData.source_provider === 'GIT' && (
              <ul className="text-neutral-350 text-sm list-none">
                <li>
                  <span className="font-medium">Repository:</span> {generalData.repository}
                </li>
                <li>
                  <span className="font-medium">Branch:</span> {generalData.branch}
                </li>
                <li>
                  <span className="font-medium">Root path:</span> {generalData.root_path}
                </li>
              </ul>
            )}

            {generalData.source_provider === 'HELM_REPOSITORY' && (
              <ul className="text-neutral-350 text-sm list-none">
                <li>
                  <span className="font-medium">Repository:</span>{' '}
                  {helmRepositories.find(({ id }) => id === generalData.repository)?.name}
                </li>
                <li>
                  <span className="font-medium">Chart name:</span> {generalData.chart_name}
                </li>
                <li>
                  <span className="font-medium">Version:</span> {generalData.chart_version}
                </li>
              </ul>
            )}

            <div className="my-4 border-b border-neutral-250 border-dashed" />

            <div className="text-neutral-400 text-ssm mb-2 font-medium">Build and deploy</div>

            <ul className="text-neutral-350 text-sm list-none">
              <li>
                <span className="font-medium">Helm parameters:</span> {generalData.arguments?.toString()}
              </li>
              <li>
                <span className="font-medium">Helm timeout:</span> {generalData.timeout_sec}
              </li>
              <li>
                <span className="font-medium">Allow cluster-wide resources:</span>{' '}
                {Boolean(generalData.allow_cluster_wide_resources).toString()}
              </li>
              <li>
                <span className="font-medium">Auto-deploy:</span>{' '}
                {match({ generalData, valuesOverrideFileData })
                  .with(
                    {
                      generalData: { source_provider: 'GIT', auto_deploy: true },
                      valuesOverrideFileData: { type: 'GIT_REPOSITORY' },
                    },
                    () => 'On (chart and values)'
                  )
                  .with({ generalData: { source_provider: 'GIT', auto_deploy: true } }, () => 'On (chart)')
                  .with(
                    {
                      generalData: { source_provider: 'HELM_REPOSITORY' },
                      valuesOverrideFileData: { auto_deploy: true },
                    },
                    () => 'On (values)'
                  )
                  .otherwise(() => 'Off')}
              </li>
            </ul>
          </div>

          <Button
            color="neutral"
            variant="surface"
            onClick={() => navigate(pathCreate + SERVICES_CREATION_GENERAL_URL)}
          >
            <Icon iconName="gear" />
          </Button>
        </div>

        {(valuesOverrideFileData.type !== 'NONE' || valuesOverrideArgumentData.arguments.length > 0) && (
          <div className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100">
            <Icon iconName="check" className="text-green-500 mr-2" />
            <div className="flex-grow mr-2">
              <div className="text-sm text-neutral-400 font-bold mb-5">Variables</div>

              {valuesOverrideFileData.type === 'GIT_REPOSITORY' && (
                <ul className="text-neutral-350 text-sm list-none">
                  <li>
                    <span className="font-medium">From Git Provider:</span> {valuesOverrideFileData.provider}
                  </li>
                  <li>
                    <span className="font-medium">Repository:</span> {valuesOverrideFileData.repository}
                  </li>
                  <li>
                    <span className="font-medium">Branch:</span> {valuesOverrideFileData.branch}
                  </li>
                  <li>
                    <span className="font-medium">Overrides path:</span> {valuesOverrideFileData.paths}
                  </li>
                </ul>
              )}

              {valuesOverrideFileData.type === 'YAML' && (
                <ul className="text-neutral-350 text-sm list-none">
                  <li>
                    <span className="font-medium">From YAML:</span> {truncateText(valuesOverrideFileData.content!, 50)}
                    ...
                  </li>
                </ul>
              )}

              {valuesOverrideArgumentData.arguments.length > 0 && (
                <ul className="text-neutral-350 text-sm list-none">
                  <li>
                    <span className="font-medium">Manual:</span> {valuesOverrideArgumentData.arguments.length} variables
                    added
                  </li>
                </ul>
              )}
            </div>

            <Button
              color="neutral"
              variant="surface"
              onClick={() => navigate(pathCreate + SERVICES_HELM_CREATION_VALUES_STEP_1_URL)}
            >
              <Icon iconName="gear" />
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-10">
          <Button type="button" size="lg" variant="surface" color="neutral" onClick={() => navigate(-1)}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="lg"
              variant="surface"
              color="neutral"
              disabled={isLoadingCreateAndDeploy}
              onClick={() => onSubmit(false)}
              loading={isLoadingCreate}
            >
              Create
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isLoadingCreate}
              onClick={() => onSubmit(true)}
              loading={isLoadingCreateAndDeploy}
            >
              Create and deploy
            </Button>
          </div>
        </div>
      </Section>
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
