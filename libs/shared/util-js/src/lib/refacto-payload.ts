import {
  CloudProviderEnum,
  type Cluster,
  type ClusterRequest,
  type Organization,
  type OrganizationCustomRole,
  type OrganizationCustomRoleUpdateRequest,
  type OrganizationEditRequest,
} from 'qovery-typescript-axios'

export function refactoPayload<T extends { id?: string; created_at?: string; updated_at?: string }>(
  response: T
): Omit<T, 'id' | 'created_at' | 'updated_at'> {
  delete response['id']
  delete response['created_at']
  delete response['updated_at']

  return response
}

export function refactoOrganizationPayload(organization: Partial<Organization>) {
  const organizationRequestPayload: OrganizationEditRequest = {
    name: organization.name || '',
    description: organization.description || '',
    logo_url: organization.logo_url || null,
    website_url: organization.website_url,
    admin_emails: organization.admin_emails,
  }

  return organizationRequestPayload
}

export function refactoOrganizationCustomRolePayload(customRole: Partial<OrganizationCustomRole>) {
  const customRoleRequestPayload: OrganizationCustomRoleUpdateRequest = {
    name: customRole.name || '',
    description: customRole.description,
    cluster_permissions:
      customRole.cluster_permissions?.map((cluster) => ({
        cluster_id: cluster.cluster_id,
        permission: cluster.permission,
      })) || [],
    project_permissions:
      customRole.project_permissions?.map((project) => ({
        project_id: project.project_id,
        is_admin: project.is_admin,
        permissions: project.permissions,
      })) || [],
  }

  return customRoleRequestPayload
}

export function refactoClusterPayload(cluster: Partial<Cluster>) {
  const clusterRequestPayload: ClusterRequest = {
    name: cluster.name || '',
    description: cluster.description,
    region: cluster.region || '',
    cloud_provider: cluster.cloud_provider || CloudProviderEnum.AWS,
    production: cluster.production,
    disk_size: cluster.disk_size,
    instance_type: cluster.instance_type,
    max_running_nodes: cluster.max_running_nodes,
    min_running_nodes: cluster.min_running_nodes,
    ssh_keys: cluster.ssh_keys,
  }

  return clusterRequestPayload
}
