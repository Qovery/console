import {
  type ClusterFeatureAwsExistingVpc,
  type ClusterFeatureGcpExistingVpc,
  type ClusterFeatureNatGatewayParameters,
  type ClusterFeatureNatGatewayTypeGcp,
  type ClusterFeatureNatGatewayTypeScalewayTypeEnum,
  type ClusterFeatureResponse,
  type ClusterRoutingTableResultsInner,
} from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { Controller, type FieldValues, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { IconEnum } from '@qovery/shared/enums'
import { type ClusterFeatureExtendedValue, type ClusterFeaturesData } from '@qovery/shared/interfaces'
import {
  BlockContent,
  Button,
  ExternalLink,
  Icon,
  InputText,
  InputTextArea,
  InputToggle,
  LoaderSpinner,
  ModalCrud,
  Tooltip,
  useModal,
  useModalConfirmation,
} from '@qovery/shared/ui'
import { ClusterCardFeature } from '../cluster-card-feature/cluster-card-feature'
import { GcpStaticIp } from '../gcp-static-ip/gcp-static-ip'
import { useClusterRoutingTable } from '../hooks/use-cluster-routing-table/use-cluster-routing-table'
import { useCluster } from '../hooks/use-cluster/use-cluster'
import { useEditCluster } from '../hooks/use-edit-cluster/use-edit-cluster'
import { useEditRoutingTable } from '../hooks/use-edit-routing-table/use-edit-routing-table'
import ScalewayStaticIp from '../scaleway-static-ip/scaleway-static-ip'
import { getGcpNatGatewaySettings } from '../utils/get-gcp-nat-gateway-settings'

export interface ClusterNetworkSettingsProps {
  organizationId: string
  clusterId: string
}

// Fallback used when the cluster has STATIC_IP but no NAT_GATEWAY feature yet,
// so GcpStaticIp can render sub-options in a default state.
const GCP_NAT_GATEWAY_FEATURE_FALLBACK: ClusterFeatureResponse = {
  id: 'NAT_GATEWAY',
  value_object: {
    type: 'NAT_GATEWAY',
    value: {
      nat_gateway_type: {
        provider: 'gcp',
        static_ips_enabled: false,
        static_ips_count: 2,
      } as ClusterFeatureNatGatewayTypeGcp,
    },
  },
}

const buildGcpNatGatewayValue = (settings: {
  static_ips_enabled: boolean
  static_ips_count: number
}): ClusterFeatureNatGatewayParameters => ({
  nat_gateway_type: {
    provider: 'gcp',
    ...settings,
  } as ClusterFeatureNatGatewayTypeGcp,
})

const deleteRoutes = (routes: ClusterRoutingTableResultsInner[], destination?: string) => {
  return [...routes]?.filter((port) => port.destination !== destination)
}

function Subnets({ title, value }: { title: string; value?: string[] | null }) {
  return (
    <li className="flex flex-col gap-1 text-xs">
      <span className="font-medium">{title}</span>
      {value && value.length > 0 ? (
        value.map((subnetId: string, index: number) => <span key={index}>{subnetId}</span>)
      ) : (
        <span>Not defined</span>
      )}
    </li>
  )
}

function AWSExistingVPC({ feature }: { feature: ClusterFeatureAwsExistingVpc }) {
  return (
    <div className="mb-5 flex flex-col justify-between rounded border border-neutral bg-surface-neutral-subtle p-4">
      <h4 className="mb-1 text-sm font-medium text-neutral">Deploy on an existing VPC</h4>
      <p className="mb-4 text-sm text-neutral-subtle">In your VPC settings, you have to enable DNS hostnames.</p>
      <InputText name="vpc_id" label="VPC ID" value={feature.aws_vpc_eks_id} className="mb-4" disabled />
      <InputToggle
        title="Private nodes"
        description="Create EKS nodes inside private subnets?"
        className="mb-4"
        value={feature.eks_create_nodes_in_private_subnet}
        align="top"
        small
        disabled
      />
      <ul className="grid gap-4">
        <li className="text-neutral">
          <span className="mb-1 flex items-center text-xs font-medium">
            <Icon name={IconEnum.EKS} width="16" className="mr-2" />
            EKS public subnet IDs
          </span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.eks_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.eks_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.eks_subnets_zone_c_ids} />
          </ul>
        </li>

        <li className="text-neutral">
          <span className="mb-1 flex items-center text-xs font-medium">
            <Icon name={IconEnum.EKS} width="16" className="mr-2" />
            EKS private subnet IDs
          </span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.eks_karpenter_fargate_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.eks_karpenter_fargate_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.eks_karpenter_fargate_subnets_zone_c_ids} />
          </ul>
        </li>

        <li className="text-neutral">
          <span className="mb-1 flex items-center text-xs font-medium">
            <Icon name={IconEnum.MONGODB} width="16" className="mr-2" />
            MongoDB subnet IDs
          </span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.documentdb_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.documentdb_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.documentdb_subnets_zone_c_ids} />
          </ul>
        </li>

        <li className="text-neutral">
          <span className="mb-1 flex items-center text-xs font-medium">
            <Icon name={IconEnum.REDIS} width="16" className="mr-2" />
            Redis subnet IDs
          </span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.elasticache_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.elasticache_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.elasticache_subnets_zone_c_ids} />
          </ul>
        </li>

        <li className="text-neutral">
          <span className="mb-1 flex items-center text-xs font-medium">MySQL/PostgreSQL subnet IDs</span>
          <ul className="grid grid-cols-3 gap-4">
            <Subnets title="Zone A:" value={feature.rds_subnets_zone_a_ids} />
            <Subnets title="Zone B:" value={feature.rds_subnets_zone_b_ids} />
            <Subnets title="Zone C:" value={feature.rds_subnets_zone_c_ids} />
          </ul>
        </li>
      </ul>
    </div>
  )
}

function GcpExistingVPC({ feature }: { feature: ClusterFeatureGcpExistingVpc }) {
  const gcpFeature = feature as ClusterFeatureGcpExistingVpc & { private_nodes?: boolean | null }

  return (
    <div className="flex flex-col justify-between gap-4 rounded border border-neutral bg-surface-neutral-subtle p-4">
      <div>
        <h4 className="mb-1 text-sm font-medium text-neutral">Deploy on an existing VPC</h4>
        <ExternalLink
          size="xs"
          href="https://www.qovery.com/docs/configuration/integrations/kubernetes/gke/managed#use-existing-vpc"
        >
          How to configure your VPC
        </ExternalLink>
      </div>
      <InputText name="vpc_id" label="VPC Name" value={feature.vpc_name} disabled />
      <InputToggle
        title="Private nodes"
        description="Make nodes private (no public IP), traffic will go through gateway."
        value={gcpFeature.private_nodes ?? false}
        align="top"
        small
        disabled
      />
      {feature.vpc_project_id && (
        <InputText name="vpc_project_id" label="External project id" value={feature.vpc_project_id} disabled />
      )}
      {feature.subnetwork_name && (
        <InputText name="subnetwork_name" label="Subnetwork range name" value={feature.subnetwork_name} disabled />
      )}
      {feature.ip_range_pods_name && (
        <InputText
          name="ip_range_pods_name"
          label="Pod IPv4 address range name"
          value={feature.ip_range_pods_name}
          disabled
        />
      )}
      {feature.additional_ip_range_pods_names && feature.additional_ip_range_pods_names?.length > 0 && (
        <InputText
          name="additional_ip_range_pods_names"
          label="Additional cluster Pod IPv4 ranges names"
          value={feature.additional_ip_range_pods_names.join()}
          disabled
        />
      )}
      {feature.ip_range_services_name && (
        <InputText
          name="ip_range_services_name"
          label="IPv4 service range name"
          value={feature.ip_range_services_name}
          disabled
        />
      )}
    </div>
  )
}

function CrudModal(props: {
  route?: ClusterRoutingTableResultsInner
  onSubmit: () => void
  onClose: () => void
  loading?: boolean
  isEdit?: boolean
}) {
  const { control } = useFormContext()

  return (
    <ModalCrud
      title={props.isEdit ? 'Edit route' : 'Create route'}
      onSubmit={props.onSubmit}
      onClose={props.onClose}
      loading={props.loading}
      isEdit={props.isEdit}
    >
      <Controller
        name="target"
        control={control}
        rules={{
          required: 'Please enter an target.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-target"
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Target"
            error={error?.message}
          />
        )}
      />
      <Controller
        name="destination"
        control={control}
        rules={{
          required: 'Please enter an destination.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputText
            dataTestId="input-destination"
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Destination"
            error={error?.message}
            disabled={props.isEdit}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        rules={{
          required: 'Please enter a description.',
        }}
        render={({ field, fieldState: { error } }) => (
          <InputTextArea
            className="mb-3"
            name={field.name}
            onChange={field.onChange}
            value={field.value}
            label="Description"
            error={error?.message}
          />
        )}
      />
    </ModalCrud>
  )
}

const handleSubmitRoutingTable = (
  data: FieldValues,
  routes: ClusterRoutingTableResultsInner[] = [],
  currentRoute?: ClusterRoutingTableResultsInner
) => {
  let currentRoutes = [...routes]

  if (currentRoute) {
    currentRoutes = currentRoutes.filter((route) => route.destination !== data['destination'])
  }

  return [
    ...currentRoutes,
    {
      destination: data['destination'],
      target: data['target'],
      description: data['description'],
    },
  ]
}

function CrudModalFeature(props: {
  route?: ClusterRoutingTableResultsInner
  routes?: ClusterRoutingTableResultsInner[]
  organizationId: string
  clusterId: string
  onClose: () => void
}) {
  const { enableAlertClickOutside } = useModal()

  const { mutateAsync: editRoutingTable, isLoading: isEditRoutingTableLoading } = useEditRoutingTable()
  const methods = useForm({
    defaultValues: {
      destination: props.route ? props.route.destination : undefined,
      target: props.route ? props.route.target : undefined,
      description: props.route ? props.route.description : undefined,
    },
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    const cloneRoutingTable = handleSubmitRoutingTable(data, props.routes, props.route)

    try {
      await editRoutingTable({
        clusterId: props.clusterId,
        organizationId: props.organizationId,
        routingTableRequest: { routes: cloneRoutingTable },
      })
      props.onClose()
    } catch (e) {
      console.error(e)
    }
  })

  useEffect(() => {
    enableAlertClickOutside(methods.formState.isDirty)
  }, [methods.formState, enableAlertClickOutside])

  return (
    <FormProvider {...methods}>
      <CrudModal
        route={props.route}
        onSubmit={onSubmit}
        onClose={props.onClose}
        loading={isEditRoutingTableLoading}
        isEdit={!!props.route}
      />
    </FormProvider>
  )
}

export function ClusterNetworkSettings({ organizationId, clusterId }: ClusterNetworkSettingsProps) {
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const { data: clusterRoutingTable, isLoading: isClusterRoutingTableLoading } = useClusterRoutingTable({
    organizationId,
    clusterId,
  })
  const { mutateAsync: editCluster, isLoading: isEditClusterLoading } = useEditCluster()
  const { mutateAsync: editRoutingTable } = useEditRoutingTable()

  const isLoading = isClusterLoading || isClusterRoutingTableLoading

  const { openModal, closeModal } = useModal()
  const { openModalConfirmation } = useModalConfirmation()

  const isScalewayCluster = cluster?.cloud_provider === 'SCW'
  const isGcpCluster = cluster?.cloud_provider === 'GCP'

  const methods = useForm<ClusterFeaturesData>({
    mode: 'onChange',
  })

  useEffect(() => {
    if (cluster?.features && (isScalewayCluster || isGcpCluster)) {
      const featuresData: Record<string, { value: boolean; extendedValue?: ClusterFeatureExtendedValue }> = {}
      cluster.features.forEach((feature) => {
        if (feature.id) {
          if (feature.id === 'NAT_GATEWAY' && isScalewayCluster) {
            const valueObj = feature.value_object
            let scwType: string | undefined
            if (valueObj?.type === 'NAT_GATEWAY') {
              // New discriminated shape
              const natGatewayType = valueObj.value?.nat_gateway_type
              scwType = natGatewayType && natGatewayType.provider === 'scaleway' ? natGatewayType.type : undefined
            } else if (valueObj?.value) {
              // Legacy shapes: plain string or object without type discriminator
              const raw = valueObj.value as unknown
              if (typeof raw === 'string') {
                scwType = raw
              } else if (raw && typeof raw === 'object' && 'nat_gateway_type' in raw) {
                const legacy = raw as { nat_gateway_type?: { type?: string } }
                scwType = legacy.nat_gateway_type?.type
              }
            }
            featuresData[feature.id] = {
              value: Boolean(scwType),
              extendedValue: scwType,
            }
          } else if (feature.id === 'NAT_GATEWAY' && isGcpCluster) {
            const gcpNatGatewaySettings = getGcpNatGatewaySettings(feature)
            featuresData[feature.id] = {
              value: Boolean(gcpNatGatewaySettings),
              extendedValue: gcpNatGatewaySettings,
            }
          } else {
            featuresData[feature.id] = {
              value: Boolean(feature.value_object?.value),
              extendedValue: typeof feature.value_object?.value === 'string' ? feature.value_object.value : undefined,
            }
          }
        }
      })
      methods.reset({ features: featuresData })
    }
  }, [cluster, isScalewayCluster, isGcpCluster, methods])

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!cluster) return

    const staticIpFeature = data.features?.STATIC_IP
    const staticIpEnabled = staticIpFeature?.value === true

    const features = cluster.features
      ?.filter((feature) => {
        if (feature.id === 'NAT_GATEWAY' && (isScalewayCluster || isGcpCluster) && !staticIpEnabled) {
          return false
        }
        return true
      })
      .map((feature) => {
        const formFeature = data.features?.[feature.id || '']

        if (feature.id === 'STATIC_IP' && formFeature) {
          return {
            ...feature,
            value: formFeature.value,
            value_object: {
              value: formFeature.value,
            },
          }
        }

        if (feature.id === 'NAT_GATEWAY' && formFeature && isScalewayCluster) {
          if (formFeature.extendedValue && typeof formFeature.extendedValue === 'string') {
            const natGatewayValue: ClusterFeatureNatGatewayParameters = {
              nat_gateway_type: {
                provider: 'scaleway',
                type: formFeature.extendedValue as ClusterFeatureNatGatewayTypeScalewayTypeEnum,
              },
            }
            return { ...feature, value: natGatewayValue }
          }
          return {
            ...feature,
            value: null,
          }
        }

        if (feature.id === 'NAT_GATEWAY' && isGcpCluster) {
          if (formFeature?.value && formFeature.extendedValue && typeof formFeature.extendedValue === 'object') {
            return { ...feature, value: buildGcpNatGatewayValue(formFeature.extendedValue) }
          }
          return { ...feature, value: null }
        }

        return feature
      })

    // GCP: NAT_GATEWAY may be absent from existing cluster features (clusters created before
    // this feature was introduced). If the user has configured it in the form, append it to
    // the payload so the changes are not silently dropped.
    const gcpNatGatewayMissing =
      isGcpCluster && staticIpEnabled && !cluster.features?.some((f) => f.id === 'NAT_GATEWAY')
    if (gcpNatGatewayMissing && features) {
      const natFormFeature = data.features?.NAT_GATEWAY
      if (natFormFeature?.extendedValue && typeof natFormFeature.extendedValue === 'object') {
        features.push({
          id: 'NAT_GATEWAY',
          value: buildGcpNatGatewayValue(natFormFeature.extendedValue),
        })
      }
    }

    try {
      await editCluster({
        organizationId,
        clusterId,
        clusterRequest: {
          ...cluster,
          features,
        },
      })
    } catch (error) {
      console.error(error)
    }
  })

  const featureExistingVpc = cluster?.features?.find(({ id }) => id === 'EXISTING_VPC')
  const gcpStaticIpFeature = cluster?.features?.find(({ id }) => id === 'STATIC_IP')
  const gcpNatGatewayFeature = cluster?.features?.find(({ id }) => id === 'NAT_GATEWAY')
  const featureExistingVpcValue = featureExistingVpc?.value_object
  const canEditRoutes =
    cluster?.cloud_provider === 'AWS' && cluster?.kubernetes === 'MANAGED' && !featureExistingVpcValue
  const canEditFeatures = isScalewayCluster || isGcpCluster
  const configuredFeatures = cluster?.features?.filter(({ id }) => id !== 'EXISTING_VPC' && id !== 'KARPENTER') ?? []
  const hasGcpStaticIpFeature = isGcpCluster && Boolean(gcpStaticIpFeature)
  const gcpDisplayFeatures = configuredFeatures.filter(({ id }) => {
    if (id === 'STATIC_IP') return false
    if (id === 'NAT_GATEWAY' && hasGcpStaticIpFeature) return false
    if (id === 'GKE_KMS_KEY') return false
    return true
  })
  const displayConfiguredFeatures = isGcpCluster ? gcpDisplayFeatures : configuredFeatures

  const featureExistingVpcContent = match(featureExistingVpcValue)
    .with({ type: 'AWS_USER_PROVIDED_NETWORK' }, (f) => (
      <AWSExistingVPC feature={f.value as ClusterFeatureAwsExistingVpc} />
    ))
    .with({ type: 'GCP_USER_PROVIDED_NETWORK' }, (f) => (
      <GcpExistingVPC feature={f.value as ClusterFeatureGcpExistingVpc} />
    ))
    .otherwise(() => null)

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <div className="mt-2 flex flex-col gap-5">
          {isLoading ? (
            <div className="flex justify-center">
              <LoaderSpinner className="w-4" />
            </div>
          ) : (
            <>
              {canEditRoutes && (
                <BlockContent classNameContent="p-0" title="Routes">
                  {clusterRoutingTable?.map((currentRoute, i) => (
                    <div
                      key={i}
                      className="flex w-full items-center justify-between gap-3 border-b border-neutral p-5"
                      data-testid="form-row"
                    >
                      <div className="flex flex-col	">
                        <p data-testid="form-row-target" className="mb-1 text-xs text-neutral-subtle">
                          Target: <span className="font-medium text-neutral">{currentRoute.target}</span>
                        </p>
                        <p data-testid="form-row-destination" className="text-xs text-neutral-subtle">
                          Destination: <span className="font-medium text-neutral">{currentRoute.destination}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentRoute.description && (
                          <Tooltip side="top" content={currentRoute.description}>
                            <div className="mr-1 flex items-center">
                              <Icon iconName="circle-info" className="text-sm text-neutral" iconStyle="regular" />
                            </div>
                          </Tooltip>
                        )}
                        <Button
                          data-testid="edit-button"
                          variant="surface"
                          type="button"
                          color="neutral"
                          size="md"
                          className="h-9 w-9 justify-center"
                          onClick={() => {
                            openModal({
                              content: (
                                <CrudModalFeature
                                  onClose={closeModal}
                                  clusterId={clusterId}
                                  organizationId={organizationId}
                                  route={currentRoute}
                                  routes={clusterRoutingTable}
                                />
                              ),
                            })
                          }}
                        >
                          <Icon iconName="gear" iconStyle="regular" />
                        </Button>
                        <Button
                          data-testid="delete-button"
                          variant="surface"
                          type="button"
                          color="neutral"
                          size="md"
                          className="h-9 w-9 justify-center"
                          onClick={() => {
                            openModalConfirmation({
                              title: 'Delete Network',
                              confirmationMethod: 'action',
                              name: currentRoute.target,
                              action: async () => {
                                try {
                                  if (clusterRoutingTable && clusterRoutingTable.length > 0) {
                                    const cloneRoutes = deleteRoutes(clusterRoutingTable, currentRoute.destination)
                                    await editRoutingTable({
                                      clusterId,
                                      organizationId,
                                      routingTableRequest: { routes: cloneRoutes },
                                    })
                                  }
                                } catch (error) {
                                  console.error(error)
                                }
                              },
                            })
                          }}
                        >
                          <Icon iconName="trash" iconStyle="regular" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex w-full items-center justify-end gap-3 px-5 py-2">
                    <Button
                      data-testid="add-button"
                      size="sm"
                      variant="solid"
                      color="brand"
                      onClick={() => {
                        openModal({
                          content: (
                            <CrudModalFeature
                              onClose={closeModal}
                              clusterId={clusterId}
                              organizationId={organizationId}
                              routes={clusterRoutingTable}
                            />
                          ),
                        })
                      }}
                      type="button"
                    >
                      Add route
                      <Icon iconName="circle-plus" iconStyle="regular" />
                    </Button>
                  </div>
                </BlockContent>
              )}

              {featureExistingVpcValue ? (
                featureExistingVpcContent
              ) : isScalewayCluster ? (
                <>
                  <ScalewayStaticIp
                    staticIpFeature={cluster?.features?.find(({ id }) => id === 'STATIC_IP')}
                    natGatewayFeature={cluster?.features?.find(({ id }) => id === 'NAT_GATEWAY')}
                    production={cluster?.production || false}
                    disabled={!canEditFeatures}
                  />
                  {canEditFeatures && (
                    <div className="flex justify-end">
                      <Button data-testid="submit-button" type="submit" size="lg" loading={isEditClusterLoading}>
                        Save
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {hasGcpStaticIpFeature && (
                    <GcpStaticIp
                      staticIpFeature={gcpStaticIpFeature}
                      natGatewayFeature={gcpNatGatewayFeature ?? GCP_NAT_GATEWAY_FEATURE_FALLBACK}
                      production={cluster?.production || false}
                      disabled={!canEditFeatures}
                      staticIpToggleDisabled={isGcpCluster}
                      showDowntimeWarning={canEditFeatures}
                    />
                  )}
                  {displayConfiguredFeatures.length > 0 && (
                    <BlockContent title="Configured network features" classNameContent="p-0">
                      {displayConfiguredFeatures.map((feature) => (
                        <ClusterCardFeature
                          key={feature.id}
                          feature={feature}
                          cloudProvider={cluster?.cloud_provider}
                          disabled
                        />
                      ))}
                    </BlockContent>
                  )}
                  {canEditFeatures && hasGcpStaticIpFeature && (
                    <div className="flex justify-end">
                      <Button data-testid="submit-button" type="submit" size="lg" loading={isEditClusterLoading}>
                        Save
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
