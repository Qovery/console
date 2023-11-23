import { useNavigate, useParams } from 'react-router-dom'
import { SERVICES_CREATION_GENERAL_URL, SERVICES_HELM_CREATION_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Heading, Icon, IconAwesomeEnum, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Helm')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { generalForm, setCurrentStep } = useHelmCreateContext()
  const navigate = useNavigate()
  setCurrentStep(3)

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`

  const onSubmit = (withDeploy: boolean) => {}

  const generalData = generalForm.getValues()

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
                <li>
                  <span className="font-medium">Auto-deploy:</span> {generalData.auto_deploy.toString()}
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
                  <span className="font-medium">Auto-deploy:</span> {generalData.auto_deploy.toString()}
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
            <Button type="submit" size="lg" variant="surface" color="neutral" onClick={() => onSubmit(false)}>
              Create
            </Button>
            <Button type="submit" size="lg" onClick={() => onSubmit(true)}>
              Create and deploy
            </Button>
          </div>
        </div>
      </Section>
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
