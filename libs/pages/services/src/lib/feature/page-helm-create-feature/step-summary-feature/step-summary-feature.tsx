import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { getGitTokenValue } from '@qovery/domains/organizations/feature'
import { useCreateHelmService } from '@qovery/domains/service-helm/feature'
import {
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_GENERAL_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Heading, Icon, IconAwesomeEnum, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Helm')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const navigate = useNavigate()

  const { generalForm, setCurrentStep } = useHelmCreateContext()
  const generalData = generalForm.getValues()
  setCurrentStep(3)

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`

  const { mutateAsync: createHelmService, isLoading: isLoadingCreateHelm } = useCreateHelmService()

  const onSubmit = async (withDeploy: boolean) => {
    const source = match(generalData.source_provider)
      .with('GIT', () => {
        const gitToken = getGitTokenValue(generalData.provider ?? '')

        return {
          git_repository: {
            url: buildGitRepoUrl(gitToken?.type ?? generalData.provider ?? '', generalData.repository),
            branch: generalData.branch,
            root_path: generalData.root_path,
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

    try {
      await createHelmService({
        environmentId,
        helmRequest: {
          name: generalData.name,
          description: generalData.description,
          source,
          allow_cluster_wide_resources: generalData.auto_preview!,
          arguments: JSON.parse(generalData.arguments),
          timeout_sec: generalData.timeout_sec,
          auto_deploy: generalData.auto_deploy,
          values_override: {},
        },
      })
      navigate(SERVICES_URL(organizationId, projectId, environmentId) + SERVICES_GENERAL_URL)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <FunnelFlowBody>
      <Section>
        <Heading className="mb-2">Ready to create your Helm chart</Heading>
        <p className="text-sm text-neutral-350 mb-10">
          The setup is done, you can now create and deploy your Helm chart.
        </p>

        <div className="flex p-4 w-full border rounded border-neutral-250 bg-neutral-100 mb-10">
          <Icon name={IconAwesomeEnum.CHECK} className="text-green-500 mr-2" />
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
                  <span className="font-medium">Repository:</span> {generalData.repository}
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
                {generalData.auto_preview?.toString()}
              </li>
              {generalData.source_provider === 'GIT' && (
                <li>
                  <span className="font-medium">Auto-deploy:</span> {generalData.auto_deploy?.toString()}
                </li>
              )}
            </ul>
          </div>

          <Button
            color="neutral"
            variant="surface"
            onClick={() => navigate(pathCreate + SERVICES_CREATION_GENERAL_URL)}
          >
            <Icon name={IconAwesomeEnum.WHEEL} />
          </Button>
        </div>

        <div className="flex justify-between">
          <Button type="button" size="lg" variant="surface" color="neutral" onClick={() => navigate(-1)}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="lg"
              variant="surface"
              color="neutral"
              onClick={() => onSubmit(false)}
              loading={isLoadingCreateHelm}
            >
              Create
            </Button>
            <Button type="submit" size="lg" onClick={() => onSubmit(true)} loading={isLoadingCreateHelm}>
              Create and deploy
            </Button>
          </div>
        </div>
      </Section>
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
