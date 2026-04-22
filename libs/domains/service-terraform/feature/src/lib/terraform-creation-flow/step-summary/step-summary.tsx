import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { TerraformAutoDeployConfigTerraformActionEnum, type TerraformRequest } from 'qovery-typescript-axios'
import { useEffect, useMemo, useState } from 'react'
import { match } from 'ts-pattern'
import { useCreateService, useDeployService } from '@qovery/domains/services/feature'
import { Button, FunnelFlowBody, Heading, Icon, Section, SummaryValue } from '@qovery/shared/ui'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useTerraformCreateContext } from '../../hooks/use-terraform-create-context/use-terraform-create-context'
import { useTerraformVariablesContext } from '../../terraform-variables-context'
import { buildDockerfileFragment } from '../../utils/build-dockerfile-fragment'
import { TERRAFORM_ENGINES } from '../../utils/terraform-engines'

export const TerraformStepSummary = () => {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { setCurrentStep, generalForm } = useTerraformCreateContext()
  const generalData = generalForm.getValues()
  const { serializeForApi, tfVarFiles } = useTerraformVariablesContext()

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  const { mutateAsync: createTerraformService } = useCreateService({ organizationId })
  const { mutateAsync: deployService } = useDeployService({ organizationId, projectId, environmentId })
  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const [isLoadingCreateAndPlan, setIsLoadingCreateAndPlan] = useState(false)

  const tfVarsFilePaths = useMemo(() => {
    return [...tfVarFiles.filter((file) => file.enabled)].reverse().map((file) => file.source)
  }, [tfVarFiles])

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
      auto_deploy_config: {
        auto_deploy: generalData.auto_deploy ?? false,
        terraform_action: generalData.terraform_action ?? TerraformAutoDeployConfigTerraformActionEnum.DEFAULT,
      },
      engine: generalData.engine,
      backend: generalData.backend,
      terraform_files_source: {
        git_repository: {
          url: buildGitRepoUrl(generalData.provider ?? '', generalData.repository),
          branch: generalData.branch ?? '',
          root_path: generalData.root_path ?? '',
          git_token_id: generalData.git_token_id ?? '',
        },
      },
      terraform_variables_source: {
        tf_var_file_paths: tfVarsFilePaths,
        tf_vars: serializeForApi(),
      },
      provider_version: {
        read_from_terraform_block: generalData.provider_version.read_from_terraform_block,
        explicit_version: generalData.provider_version.explicit_version,
      },
      job_resources: {
        cpu_milli: generalData.job_resources.cpu_milli,
        ram_mib: generalData.job_resources.ram_mib,
        storage_gib: generalData.job_resources.storage_gib,
        gpu: generalData.job_resources.gpu,
      },
      use_cluster_credentials: generalData.use_cluster_credentials,
      dockerfile_fragment: buildDockerfileFragment(generalData),
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
        await deployService({ serviceId: response.id, serviceType: 'TERRAFORM', request: { action: 'PLAN' } })
        setIsLoadingCreateAndPlan(false)
      }

      posthog.capture('create-service', {
        selectedServiceType: 'terraform',
        selectedServiceSubType: 'current',
      })

      setIsLoadingCreate(false)
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
        params: { organizationId, projectId, environmentId },
      })
    } catch (error) {
      setIsLoadingCreateAndPlan(false)
      setIsLoadingCreate(false)
    }
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <Section>
        <Heading className="mb-2">Ready to create your Terraform service</Heading>

        <form className="space-y-10">
          <p className="text-sm text-neutral-subtle">
            The basic application setup is done, you can now deploy your application or move forward with some advanced
            setup.
          </p>

          <div className="flex flex-col gap-6">
            <Section className="rounded border border-neutral bg-surface-neutral-subtle p-4">
              <div className="flex justify-between">
                <Heading>General information</Heading>
                <Button
                  type="button"
                  variant="plain"
                  size="md"
                  onClick={() =>
                    navigate({
                      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/general',
                      params: { organizationId, projectId, environmentId },
                    })
                  }
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
              <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                <SummaryValue label="Name" value={generalData.name} />
                {generalData.description && (
                  <li>
                    <strong className="font-medium text-neutral">Description:</strong>
                    <br />
                    {generalData.description}
                  </li>
                )}
              </ul>
              <hr className="my-4 border-t border-dashed border-neutral" />
              {generalData.source_provider === 'GIT' && (
                <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                  <SummaryValue
                    label="Repository"
                    value={generalData.repository || generalData.git_repository?.url}
                  />
                  <SummaryValue label="Branch" value={generalData.branch} />
                  <SummaryValue label="Root path" value={generalData.root_path} />
                </ul>
              )}
            </Section>

            <Section className="rounded border border-neutral bg-surface-neutral-subtle p-4">
              <div className="flex justify-between">
                <Heading>Terraform configuration</Heading>
                <Button
                  type="button"
                  variant="plain"
                  size="md"
                  onClick={() =>
                    navigate({
                      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/terraform-configuration',
                      params: { organizationId, projectId, environmentId },
                    })
                  }
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
              <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                <SummaryValue
                  label="Terraform engine"
                  value={`${TERRAFORM_ENGINES.find((v) => v.value === generalData.engine)?.name} v${generalData.provider_version.explicit_version}`}
                />
                <SummaryValue
                  label="Backend"
                  value={'kubernetes' in generalData.backend ? 'Kubernetes' : 'User provided'}
                />
                <SummaryValue
                  label="Execution credentials"
                  value={generalData.use_cluster_credentials ? 'Cluster credentials' : 'Environment variables'}
                />
                <SummaryValue
                  label="Auto-deploy"
                  value={match(generalData.auto_deploy)
                    .with(true, () => 'On')
                    .otherwise(() => 'Off')}
                />
                <SummaryValue label="CPU" value={generalData.job_resources.cpu_milli} />
                <SummaryValue label="RAM" value={`${generalData.job_resources.ram_mib}mb`} />
                <SummaryValue label="Storage" value={`${generalData.job_resources.storage_gib}gb`} />
              </ul>
            </Section>

            <Section className="rounded border border-neutral bg-surface-neutral-subtle p-4">
              <div className="flex justify-between">
                <Heading>Input variables</Heading>
                <Button
                  type="button"
                  variant="plain"
                  size="md"
                  onClick={() =>
                    navigate({
                      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/input-variables',
                      params: { organizationId, projectId, environmentId },
                    })
                  }
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>

              <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                <li>
                  <span className="font-medium">Variables:</span>
                  {serializeForApi().length > 0 ? (
                    <ul>
                      {serializeForApi().map(({ key, value, secret }) => (
                        <li key={key}>
                          {key}: {secret ? '********' : value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="ml-1 text-neutral-subtle">No variables overridden</span>
                  )}
                </li>
                {tfVarsFilePaths.length > 0 && (
                  <li>
                    <span className="font-medium">File paths:</span> {[...tfVarsFilePaths].reverse().join(', ')}
                  </li>
                )}
              </ul>
            </Section>
          </div>

          <div className="mt-10 flex justify-between">
            <Button
              type="button"
              size="lg"
              variant="plain"
              onClick={() =>
                navigate({
                  to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/terraform/input-variables',
                  params: { organizationId, projectId, environmentId },
                })
              }
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
