import { type CloudProvider, CloudProviderEnum, type ClusterRegion } from 'qovery-typescript-axios'
import { type FormEventHandler, useMemo, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ClusterCredentialsSettingsFeature, ClusterGeneralSettings } from '@qovery/shared/console-shared'
import { type ClusterGeneralData, type ClusterResourcesData, type Value } from '@qovery/shared/interfaces'
import { CLUSTERS_URL } from '@qovery/shared/routes'
import {
  BlockContent,
  Button,
  Callout,
  ExternalLink,
  Icon,
  IconAwesomeEnum,
  IconFlag,
  InputSelect,
  LoaderSpinner,
  RadioGroup,
} from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { defaultResourcesData } from '../../../feature/page-clusters-create-feature/page-clusters-create-feature'

export interface StepGeneralProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  cloudProviders: CloudProvider[]
  currentCloudProvider?: CloudProviderEnum
  setResourcesData?: (data: ClusterResourcesData) => void
}

export function StepGeneral(props: StepGeneralProps) {
  const { onSubmit, cloudProviders = [], currentCloudProvider, setResourcesData } = props
  const { control, formState, watch } = useFormContext<ClusterGeneralData>()
  const { organizationId = '' } = useParams()
  const navigate = useNavigate()

  const [currentProvider, setCurrentProvider] = useState<CloudProvider | undefined>(
    cloudProviders.filter((cloudProvider: CloudProvider) => cloudProvider.short_name === currentCloudProvider)[0]
  )

  const buildCloudProviders: Value[] = useMemo(
    () =>
      cloudProviders.map((value) => ({
        label: upperCaseFirstLetter(value.name),
        value: value.short_name || '',
        icon: <Icon name={value.short_name || CloudProviderEnum.AWS} className="w-4" />,
      })),
    [cloudProviders]
  )

  const buildRegions: Value[] = useMemo(
    () =>
      currentProvider?.regions?.map((region: ClusterRegion) => ({
        label: `${region.city} (${region.name})`,
        value: region.name,
        icon: <IconFlag code={region.country_code} />,
      })) || [],
    [currentProvider?.regions]
  )

  return (
    <div>
      <div className="mb-10">
        <h3 className="text-neutral-400 text-lg mb-2">General information</h3>
        <p className="text-neutral-400 text-sm mb-2">Provide here some general information for your cluster.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-10">
          <h4 className="mb-4 text-neutral-400 text-sm">General</h4>
          <ClusterGeneralSettings />
        </div>
        <div className="text-sm mb-10">
          <Controller
            name="installation_type"
            control={control}
            rules={{
              required: 'Please select an installation type.',
            }}
            render={({ field, fieldState: { error } }) => (
              <BlockContent title="Installation type">
                <RadioGroup.Root className="flex flex-col gap-4" defaultValue={field.value} onChange={field.onChange}>
                  <label className="flex gap-3">
                    <div>
                      <RadioGroup.Item value="MANAGED" />
                    </div>
                    <div>
                      <span className="text-neutral-400 font-medium">Qovery Managed</span>
                      <p className="text-neutral-350">
                        Qovery will install and manage the Kubernetes cluster and the underlying infrastructure on your
                        cloud provider account.
                      </p>
                    </div>
                  </label>
                  <label className="flex gap-3">
                    <div>
                      <RadioGroup.Item value="SELF_MANAGED" />
                    </div>
                    <div>
                      <span className="text-neutral-400 font-medium">Self-Managed (BETA)</span>
                      <p className="text-neutral-350">
                        You will manage the infrastructure, including any update/ upgrade. Advanced Kubernetes knowledge
                        required.
                      </p>
                    </div>
                  </label>
                </RadioGroup.Root>
              </BlockContent>
            )}
          />
        </div>
        <div className="mb-10">
          <h4 className="mb-3 text-neutral-400 text-sm">Provider credentials</h4>
          {cloudProviders.length > 0 ? (
            <>
              {watch('cloud_provider') === CloudProviderEnum.GCP && (
                <Callout.Root color="yellow" className="mb-2">
                  <Callout.Icon>
                    <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} />
                  </Callout.Icon>
                  <Callout.Text className="text-xs">
                    GCP integration is beta, keep an eye on your cluster costs and report any bugs and/or weird
                    behavior.
                    <ExternalLink
                      className="flex mt-1"
                      href="https://cloud.google.com/billing/docs/how-to/budgets"
                      size="xs"
                    >
                      Setup budget alerts
                    </ExternalLink>
                    <ExternalLink
                      className="flex mt-1"
                      href="https://discuss.qovery.com/t/new-feature-google-cloud-platform-gcp-beta-support/2307"
                      size="xs"
                    >
                      More details
                    </ExternalLink>
                  </Callout.Text>
                </Callout.Root>
              )}
              <Controller
                name="cloud_provider"
                control={control}
                rules={{
                  required: 'Please select a cloud provider.',
                }}
                render={({ field, fieldState: { error } }) => (
                  <InputSelect
                    dataTestId="input-cloud-provider"
                    label="Cloud provider"
                    className="mb-3"
                    options={buildCloudProviders}
                    onChange={(value) => {
                      const currentProvider = cloudProviders?.filter(
                        (cloud) => cloud.short_name === value && cloud.regions
                      )[0]
                      setCurrentProvider(currentProvider as CloudProvider)
                      field.onChange(value)
                      setResourcesData && setResourcesData(defaultResourcesData)
                    }}
                    value={field.value}
                    error={error?.message}
                    portal
                  />
                )}
              />
              {currentProvider && (
                <>
                  <Controller
                    name="region"
                    control={control}
                    rules={{
                      required: 'Please select a region.',
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <InputSelect
                        dataTestId="input-region"
                        label="Region"
                        className="mb-3"
                        options={buildRegions}
                        onChange={field.onChange}
                        value={field.value}
                        error={error?.message}
                        isSearchable
                        portal
                      />
                    )}
                  />
                  <ClusterCredentialsSettingsFeature cloudProvider={currentProvider.short_name as CloudProviderEnum} />
                </>
              )}
            </>
          ) : (
            <div className="flex justify-center mt-2">
              <LoaderSpinner className="w-4" />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            size="lg"
            type="button"
            variant="surface"
            color="neutral"
            onClick={() => navigate(CLUSTERS_URL(organizationId))}
          >
            Cancel
          </Button>
          <Button size="lg" data-testid="button-submit" type="submit" disabled={!formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StepGeneral
