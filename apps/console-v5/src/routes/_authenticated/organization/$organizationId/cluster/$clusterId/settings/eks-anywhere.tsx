import { createFileRoute, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
  ClusterEksSettings,
  type ClusterEksSettingsFormData,
  getEksAnywhereGitFormValues,
  getInfrastructureChartsParametersWithEksAnywhereGit,
  stripEksAnywhereGitFormFields,
  useCluster,
  useEditCluster,
} from '@qovery/domains/clusters/feature'
import { GitRepositorySettings } from '@qovery/domains/organizations/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, LoaderSpinner, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/eks-anywhere'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()
  const [isGitEditing, setIsGitEditing] = useState(false)
  const currentGitRepository = cluster?.infrastructure_charts_parameters?.eks_anywhere_parameters?.git_repository
  const currentRepository = getEksAnywhereGitFormValues(cluster).repository
  const hasConfiguredInfrastructureChartsSource = Boolean(currentGitRepository?.url && currentRepository)
  const gitDisabled = hasConfiguredInfrastructureChartsSource && !isGitEditing

  const methods = useForm<ClusterEksSettingsFormData>({
    mode: 'onChange',
    defaultValues: {
      ...cluster,
      ...getEksAnywhereGitFormValues(cluster),
    },
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data && cluster) {
      try {
        await editCluster({
          organizationId,
          clusterId: cluster.id,
          clusterRequest: {
            ...cluster,
            ...stripEksAnywhereGitFormFields(data),
            infrastructure_charts_parameters: getInfrastructureChartsParametersWithEksAnywhereGit(data),
          },
        })
      } catch (error) {
        console.error(error)
      }
    }
  })

  const editGitSettings = () => {
    setIsGitEditing(true)
    methods.setValue('provider', currentGitRepository?.provider)
    methods.setValue('repository', undefined)
  }

  useEffect(() => {
    if (cluster && !isClusterLoading) {
      methods.reset({
        ...cluster,
        ...getEksAnywhereGitFormValues(cluster),
      })
      setIsGitEditing(false)
    }
  }, [cluster, isClusterLoading, methods])

  if (isClusterLoading) {
    return (
      <div className="flex w-full flex-col justify-between">
        <Section className="max-w-content-with-navigation-left p-8">
          <div className="flex items-start justify-center p-10">
            <LoaderSpinner className="w-5" />
          </div>
        </Section>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="flex w-full flex-col justify-between">
        <Section className="max-w-content-with-navigation-left p-8">
          <SettingsHeading title="EKS Anywhere configuration" />
          <form onSubmit={onSubmit}>
            <div className="space-y-10">
              <ClusterEksSettings
                gitSettings={
                  <GitRepositorySettings
                    gitDisabled={gitDisabled}
                    showAuthProviders={false}
                    organizationId={organizationId}
                    editGitSettings={editGitSettings}
                    currentProvider={currentGitRepository?.provider}
                    currentRepository={currentRepository}
                    urlRepository={currentGitRepository?.url}
                    rootPathLabel="YAML file path"
                    rootPathHint="Provide the path to the EKS Anywhere cluster YAML file in the repository."
                  />
                }
              />
              <div className="flex justify-end">
                <Button
                  data-testid="submit-button"
                  type="submit"
                  size="lg"
                  loading={isEditClusterLoading}
                  disabled={!methods.formState.isValid}
                >
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Section>
      </div>
    </FormProvider>
  )
}
