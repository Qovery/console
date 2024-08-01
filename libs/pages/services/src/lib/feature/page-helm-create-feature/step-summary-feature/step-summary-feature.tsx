import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useHelmRepositories } from '@qovery/domains/organizations/feature'
import { type ArgumentTypes, useCreateHelmService } from '@qovery/domains/service-helm/feature'
import { useDeployService } from '@qovery/domains/services/feature'
import {
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_GENERAL_URL,
  SERVICES_HELM_CREATION_VALUES_STEP_1_URL,
  SERVICES_HELM_CREATION_VALUES_STEP_2_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Heading, Icon, Section, truncateText } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl, parseCmd } from '@qovery/shared/util-js'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Helm')

  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const navigate = useNavigate()

  const { generalForm, valuesOverrideFileForm, valuesOverrideArgumentsForm, setCurrentStep, creationFlowUrl } =
    useHelmCreateContext()
  const generalData = generalForm.getValues()
  const valuesOverrideFileData = valuesOverrideFileForm.getValues()
  const valuesOverrideArgumentData = valuesOverrideArgumentsForm.getValues()

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

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
          icon_uri: generalData.icon_uri,
          source,
          allow_cluster_wide_resources: generalData.allow_cluster_wide_resources,
          arguments: parseCmd(generalData.arguments),
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

      if (slug && option) {
        posthog.capture('create-service', {
          selectedServiceType: slug,
          selectedServiceSubType: option,
        })
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

        <form className="space-y-10">
          <p className="text-sm text-neutral-350">
            The basic application setup is done, you can now deploy your application or move forward with some advanced
            setup.
          </p>

          <div className="flex flex-col gap-6">
            <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
              <div className="flex justify-between">
                <Heading>General information</Heading>
                <Button
                  type="button"
                  variant="plain"
                  size="md"
                  onClick={() => navigate(creationFlowUrl + SERVICES_CREATION_GENERAL_URL)}
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
              <ul className="list-none space-y-2 text-sm text-neutral-400">
                <li>
                  <strong className="font-medium">Name:</strong> {generalData.name}
                </li>
                {generalData.description && (
                  <li>
                    <strong className="font-medium">Description:</strong>
                    <br />
                    {generalData.description}
                  </li>
                )}
              </ul>
              <hr className="my-4 border-t border-dashed border-neutral-250" />
              {generalData.source_provider === 'GIT' && (
                <ul className="list-none space-y-2 text-sm text-neutral-400">
                  <li>
                    <strong className="font-medium">Repository:</strong> {generalData.repository}
                  </li>
                  <li>
                    <strong className="font-medium">Branch:</strong> {generalData.branch}
                  </li>
                  <li>
                    <strong className="font-medium">Root path:</strong> {generalData.root_path}
                  </li>
                </ul>
              )}

              {generalData.source_provider === 'HELM_REPOSITORY' && (
                <ul className="list-none space-y-2 text-sm text-neutral-400">
                  <li>
                    <strong className="font-medium">Repository:</strong>{' '}
                    {helmRepositories.find(({ id }) => id === generalData.repository)?.name}
                  </li>
                  <li>
                    <strong className="font-medium">Chart name:</strong> {generalData.chart_name}
                  </li>
                  <li>
                    <strong className="font-medium">Version:</strong> {generalData.chart_version}
                  </li>
                </ul>
              )}
              <hr className="my-4 border-t border-dashed border-neutral-250" />
              <ul className="list-none space-y-2 text-sm text-neutral-400">
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
            </Section>

            {(valuesOverrideFileData.type !== 'NONE' || valuesOverrideArgumentData.arguments.length > 0) && (
              <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
                <div className="flex justify-between">
                  <Heading>Values</Heading>
                  <Button
                    type="button"
                    variant="plain"
                    size="md"
                    onClick={() => navigate(creationFlowUrl + SERVICES_HELM_CREATION_VALUES_STEP_1_URL)}
                  >
                    <Icon className="text-base" iconName="gear-complex" />
                  </Button>
                </div>
                {valuesOverrideFileData.type === 'GIT_REPOSITORY' && (
                  <ul className="list-none space-y-2 text-sm text-neutral-400">
                    <li>
                      <strong className="font-medium">From Git Provider:</strong> {valuesOverrideFileData.provider}
                    </li>
                    <li>
                      <strong className="font-medium">Repository:</strong> {valuesOverrideFileData.repository}
                    </li>
                    <li>
                      <strong className="font-medium">Branch:</strong> {valuesOverrideFileData.branch}
                    </li>
                    <li>
                      <strong className="font-medium">Overrides path:</strong> {valuesOverrideFileData.paths}
                    </li>
                  </ul>
                )}

                {valuesOverrideFileData.type === 'YAML' && (
                  <ul className="list-none space-y-2 text-sm text-neutral-400">
                    <li>
                      <strong className="font-medium">From YAML:</strong>{' '}
                      {truncateText(valuesOverrideFileData.content!, 50)}
                      ...
                    </li>
                  </ul>
                )}

                {valuesOverrideArgumentData.arguments.length > 0 && (
                  <ul className="list-none space-y-2 text-sm text-neutral-400">
                    <li>
                      <strong className="font-medium">Manual:</strong> {valuesOverrideArgumentData.arguments.length}{' '}
                      variables added
                    </li>
                  </ul>
                )}
              </Section>
            )}
          </div>

          <div className="mt-10 flex justify-between">
            <Button
              type="button"
              size="lg"
              variant="plain"
              onClick={() => navigate(creationFlowUrl + SERVICES_HELM_CREATION_VALUES_STEP_2_URL)}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
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
                type="button"
                size="lg"
                disabled={isLoadingCreate}
                onClick={() => onSubmit(true)}
                loading={isLoadingCreateAndDeploy}
              >
                Create and deploy
              </Button>
            </div>
          </div>
        </form>
      </Section>
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
