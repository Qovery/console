import posthog from 'posthog-js'
import { type TerraformRequest } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useCreateService, useDeployService } from '@qovery/domains/services/feature'
import {
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_GENERAL_URL,
  SERVICES_TERRAFORM_CREATION_BASIC_CONFIG_URL,
  SERVICES_TERRAFORM_CREATION_INPUT_VARIABLES_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { Button, FunnelFlowBody, Heading, Icon, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useTerraformCreateContext } from '../page-terraform-create-feature'

export function StepSummaryFeature() {
  useDocumentTitle('Summary - Create Terraform')

  const { organizationId = '', projectId = '', environmentId = '', slug, option } = useParams()
  const navigate = useNavigate()

  const { generalForm, inputVariablesForm, setCurrentStep, creationFlowUrl } = useTerraformCreateContext()
  const generalData = generalForm.getValues()
  const inputVariablesData = inputVariablesForm.getValues()

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const { mutateAsync: createTerraformService } = useCreateService({ organizationId })
  const { mutateAsync: deployService } = useDeployService({ organizationId, projectId, environmentId })
  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const [isLoadingCreateAndPlan, setIsLoadingCreateAndPlan] = useState(false)

  const onSubmit = async (withPlan: boolean) => {
    if (withPlan) {
      setIsLoadingCreateAndPlan(true)
    } else {
      setIsLoadingCreate(true)
    }

    const payload: TerraformRequest = {
      name: generalData.name,
      description: generalData.description ?? '',
      icon_uri: generalData.icon_uri,
      timeout_sec: Number(generalData.timeout_sec),
      auto_deploy: generalData.auto_deploy ?? false,
      auto_approve: false,
      provider: 'TERRAFORM',
      terraform_files_source: {
        git_repository: {
          url: buildGitRepoUrl(generalData.provider ?? '', generalData.repository),
          branch: generalData.branch ?? '',
          root_path: generalData.root_path ?? '',
          git_token_id: generalData.git_token_id ?? '',
        },
      },
      terraform_variables_source: {
        tf_var_file_paths: inputVariablesData.tf_var_file_paths,
        tf_vars: inputVariablesData.tf_vars,
      },
      provider_version: {
        read_from_terraform_block: generalData.provider_version.read_from_terraform_block,
        explicit_version: generalData.provider_version.explicit_version,
      },
      job_resources: {
        cpu_milli: generalData.job_resources.cpu_milli,
        ram_mib: generalData.job_resources.ram_mib,
        storage_gib: generalData.job_resources.storage_gib,
      },
      use_cluster_credentials: generalData.use_cluster_credentials,
    }

    try {
      const response = await createTerraformService({
        environmentId,
        payload: {
          serviceType: 'TERRAFORM',
          ...payload,
        },
      })

      if (withPlan) {
        await deployService({ serviceId: response.id, serviceType: 'TERRAFORM', request: { dry_run: true } })
        setIsLoadingCreateAndPlan(false)
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
      setIsLoadingCreateAndPlan(false)
      setIsLoadingCreate(false)
    }
  }

  return (
    <FunnelFlowBody>
      <Section>
        <Heading className="mb-2">Ready to create your Terraform service</Heading>

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
            </Section>

            <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
              <div className="flex justify-between">
                <Heading>Terraform configuration</Heading>
                <Button
                  type="button"
                  variant="plain"
                  size="md"
                  onClick={() => navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_BASIC_CONFIG_URL)}
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
              <ul className="list-none space-y-2 text-sm text-neutral-400">
                <li>
                  <span className="font-medium">Terraform version:</span>{' '}
                  {generalData.provider_version.explicit_version}
                </li>
                <li>
                  <span className="font-medium">Execution credentials:</span>{' '}
                  {generalData.use_cluster_credentials ? 'Cluster credentials' : 'Environment variables'}
                </li>
                <li>
                  <span className="font-medium">State:</span> Kubernetes (Default)
                </li>
                <li>
                  <span className="font-medium">Auto-deploy:</span>{' '}
                  {match(generalData.auto_deploy)
                    .with(true, () => 'On')
                    .otherwise(() => 'Off')}
                </li>
                <li>
                  <span className="font-medium">CPU:</span> {generalData.job_resources.cpu_milli}
                </li>
                <li>
                  <span className="font-medium">RAM:</span> {generalData.job_resources.ram_mib}mb
                </li>
                <li>
                  <span className="font-medium">Storage:</span> {generalData.job_resources.storage_gib}gb
                </li>
              </ul>
            </Section>

            <Section className="rounded border border-neutral-250 bg-neutral-100 p-4">
              <div className="flex justify-between">
                <Heading>Input variables</Heading>
                <Button
                  type="button"
                  variant="plain"
                  size="md"
                  onClick={() => navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_INPUT_VARIABLES_URL)}
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>

              <ul className="list-none space-y-2 text-sm text-neutral-400">
                <li>
                  <span className="font-medium">Variables:</span>
                  <ul>
                    {inputVariablesData.tf_vars.map((variable) => (
                      <li key={variable.key}>
                        {variable.key}: {variable.value}
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <span className="font-medium">File paths:</span> {inputVariablesData.tf_var_file_paths.join(', ')}
                </li>
              </ul>
            </Section>
          </div>

          <div className="mt-10 flex justify-between">
            <Button
              type="button"
              size="lg"
              variant="plain"
              onClick={() => navigate(creationFlowUrl + SERVICES_TERRAFORM_CREATION_INPUT_VARIABLES_URL)}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                size="lg"
                variant="surface"
                color="neutral"
                onClick={() => onSubmit(false)}
                loading={isLoadingCreate}
              >
                Create
              </Button>
              <Button type="button" size="lg" onClick={() => onSubmit(true)} loading={isLoadingCreateAndPlan}>
                Create and run plan
              </Button>
            </div>
          </div>
        </form>
      </Section>
    </FunnelFlowBody>
  )
}

export default StepSummaryFeature
