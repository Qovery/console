import { useSyncExternalStore } from 'react'

const mapping = {
  '/organization/:organizationId/settings/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization#general-information',
      label: 'Configure my organization',
    },
  ],
  '/organization/:organizationId/settings/members': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization/members-rbac',
      label: 'Manage the members of your organization (add / remove)',
    },
  ],
  '/organization/:organizationId/settings/roles': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization/members-rbac',
      label:
        'Control the access to your cluster and environment resources by defining and assigning roles to your users',
    },
  ],
  '/organization/:organizationId/settings/billing-summary': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization#billing',
      label: 'Retrieve your invoices and manage your plan',
    },
    { link: 'https://www.qovery.com/pricing/', label: 'Check pricing and compare plans' },
  ],
  '/organization/:organizationId/settings/billing-detail': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization#billing',
      label: 'Manage the credit card used for the payments',
    },
    { link: 'https://www.qovery.com/pricing/', label: 'Check pricing and compare plans' },
  ],
  '/organization/:organizationId/settings/container-registries': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization/container-registry',
      label: 'Define the list of container registries that can be used within your organization',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/integrations/ci-cd',
      label: 'Use CI to manage the way that you want to deploy your applications',
    },
  ],
  '/organization/:organizationId/settings/helm-repositories': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization/helm-repository',
      label: 'Define the list of helm repositories that can be used within your organization',
    },
  ],
  '/organization/:organizationId/settings/git-repository-access': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization/git-repository-access/',
      label: 'Manage the access to the repositories linked to your Git account within your Qovery organization',
    },
  ],
  '/organization/:organizationId/settings/webhooks': [
    {
      link: 'https://www.qovery.com/docs/configuration/integrations/webhooks',
      label:
        'Create webhooks to get notified on external applications when event happens on an environment within your organization',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/integrations/slack',
      label: 'Automatically notify your team on a Slack workspace whenever a change has occurred on your apps',
    },
  ],
  '/organization/:organizationId/settings/api': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization/api-token/',
      label: 'Allow third-party applications or script to access your organization via the Qovery API',
    },
    { link: 'https://api-doc.qovery.com/', label: 'Qovery API Documentation' },
    {
      link: 'https://www.qovery.com/docs/configuration/integrations/ci-cd/github-actions',
      label: 'How to integrate Qovery with GitHub Actions',
    },
  ],
  '/organization/:organizationId/settings/labels-annotations': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/settings/danger-zone': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization/#delete-an-organization',
      label: 'How to delete my organization?',
    },
  ],
  '/organization/:organizationId/settings/:projectId/project/danger-zone': [
    {
      link: 'https://www.qovery.com/docs/configuration/project/#delete-a-project',
      label: 'How to delete my project?',
    },
  ],
  '/organization/:organizationId/settings/:projectId/project/general': [
    { link: 'https://www.qovery.com/docs/configuration/project', label: 'What is a project?' },
  ],
  '/user/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/user-account/#general-account-settings',
      label: 'How to edit my general account settings?',
    },
  ],
  '/organization/:organizationId/audit-logs/general': [
    {
      link: 'https://www.qovery.com/docs/getting-started/security-and-compliance/audit-logs#audit-logs',
      label: 'How to access my Audit logs?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environments/general': [
    { link: 'https://www.qovery.com/docs/configuration/environment', label: 'What is an environment?' },
  ],
  '/organization/:organizationId/project/:projectId/environments/deployment-rules': [
    {
      link: 'https://www.qovery.com/docs/configuration/deployment-rule',
      label: 'What is a deployment rule?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environments/deployment-rules/create': [
    {
      link: 'https://www.qovery.com/docs/configuration/deployment-rule',
      label: 'What is a deployment rule?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/general': [
    { link: 'https://www.qovery.com/docs/configuration/environment', label: 'What is an environment?' },
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/statuses',
      label: 'Monitor the running and deployment status of your environments and services',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/pipeline',
      label: 'How do I manage the deployment order of my services?',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/actions',
      label: 'Manage the deployment lifecycle of your services and environments',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/logs',
      label: 'Check my deployments and application logs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/deployments': [
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/overview',
      label: 'All the information about the deployment management with Qovery',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/actions',
      label: 'Manage the deployment lifecycle of your services and environments',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/history',
      label: 'Access the deployments history of your environment or service',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/environment#general-settings',
      label: 'Configure my environment',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/rules': [
    {
      link: 'https://www.qovery.com/docs/configuration/deployment-rule',
      label: 'Reduct your costs by setting deployment rules',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/pipeline': [
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/pipeline',
      label: 'How do I manage the deployment order of my services?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/preview-environments':
    [
      {
        link: 'https://www.qovery.com/docs/getting-started/guides/use-cases/preview-environments',
        label: 'Create a dedicated environment for each of your pull requests',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/danger-zone':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/environment#delete-an-environment',
        label: 'How to delete my environment?',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/general': [
    { link: 'https://www.qovery.com/docs/configuration/application', label: 'What is an application?' },
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/logs/',
      label: 'Check my deployments and application logs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/deployments':
    [{ link: 'https://www.qovery.com/docs/configuration/application', label: 'What is an application?' }],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/variables': [
    {
      link: 'https://www.qovery.com/docs/configuration/environment-variables#environment-variables',
      label: 'How to manage my environment variables?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/general':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/application/#general',
        label: 'Configure my application',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/database/',
        label: 'Configure my database',
      },
      { link: 'https://www.qovery.com/docs/configuration/helm/#general', label: 'Configure my helm' },
      {
        link: 'https://www.qovery.com/docs/configuration/cronjob/#general',
        label: 'Configure my cronjob',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/lifecycle-job/#general',
        label: 'Configure my lifecycle job',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/resources':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/application/#resources',
        label: 'Configure the number of CPUs and the amount of RAM that your app needs',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/database/#resources',
        label: 'Configure the resources that your database needs',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/lifecycle-job/#resources',
        label: 'Configure the number of CPUs and the amount of RAM that your lifecycle job needs',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/cronjob/#resources',
        label: 'Configure the number of CPUs and the amount of RAM that your cronjob needs',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/configure':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/cronjob/#job-configuration',
        label: 'Configure my cronjob',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/lifecycle-job/#job-configuration',
        label: 'Configure my lifecycle job',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/values-override-file':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/helm/#override-as-file',
        label: 'Override the values of your chart with a file or a raw yaml',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/values-override-arguments':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/helm/#override-as-arguments',
        label: 'Override the values of your chart with arguments',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/storage':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/application/#storage',
        label: 'Add persistent local storage for your application',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/networking':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/helm#network-configuration',
        label: 'Expose ports from your helm publicly',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/domain':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/application#custom-domains',
        label: 'Customize the domain used to reach your application',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/helm/#domains',
        label: 'Customize the domain used to reach your application define in your helm',
      },
      {
        link: 'https://www.qovery.com/docs/getting-started/guides/advanced-tutorials/cloudflare-custom-domain#setting-up-cloudflare-and-custom-domain-on-qovery',
        label: 'Setting up Cloudflare and Custom Domain on Qovery',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/port':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/application/#ports',
        label: 'Expose your application ports publicly',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/health-checks':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/service-health-checks/',
        label: 'How to configure your Liveness and Readiness probes?',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/deployment-restrictions':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/deployment/auto-deploy#filtering-commits',
        label: 'Avoid unnecessary deployments by including or excluding certain files or folders from the feature',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/advanced-settings':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/service-advanced-settings',
        label: 'Fine-tune your service using advanced settings',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/danger-zone':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/application#delete-application',
        label: 'How to delete my application?',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/database/#delete-your-database-instance',
        label: 'How to delete my database?',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/helm#delete-service',
        label: 'How to delete my helm?',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/terraform-arguments':
    [
      {
        link: 'https://developer.hashicorp.com/terraform/cli/commands',
        label: 'Terraform CLI documentation',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/application#creating-an-application',
      label: 'Create a new application',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/object-storage/',
      label: 'Add persistent local storage for your application',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/auto-deploy#auto-deploy',
      label: 'Automatically update the applications to the latest version of your git branch',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/resources': [
    {
      link: 'https://www.qovery.com/docs/configuration/application#creating-an-application',
      label: 'Create a new application',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/application/#resources',
      label: 'Configure the number of CPUs and the amount of RAM that your app needs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/ports': [
    {
      link: 'https://www.qovery.com/docs/configuration/application#creating-an-application',
      label: 'Create a new application',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/application/#ports',
      label: 'Expose your application ports publicly',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/health-checks': [
    {
      link: 'https://www.qovery.com/docs/configuration/application#creating-an-application',
      label: 'Create a new application',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/service-health-checks/',
      label: 'How to configure your Liveness and Readiness probes?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/post': [
    {
      link: 'https://www.qovery.com/docs/configuration/application#creating-an-application',
      label: 'Create a new application',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/database/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/database/#create-a-database',
      label: 'Create a new database',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/database/resources': [
    {
      link: 'https://www.qovery.com/docs/configuration/database/#create-a-database',
      label: 'Create a new database',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/database/#resources',
      label: 'Configure the resources that your database needs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/database/post': [
    {
      link: 'https://www.qovery.com/docs/configuration/database/#create-a-database',
      label: 'Create a new database',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/lifecycle-job#creating-a-lifecycle-job',
      label: 'Create a new lifecycle job',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/configure': [
    {
      link: 'https://www.qovery.com/docs/configuration/lifecycle-job/#job-configuration',
      label: 'Configure my lifecycle job',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/resources': [
    {
      link: 'https://www.qovery.com/docs/configuration/lifecycle-job/#resources',
      label: 'Configure the number of CPUs and the amount of RAM that your lifecycle job needs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/variable': [
    {
      link: 'https://www.qovery.com/docs/configuration/environment-variables#environment-variables',
      label: 'How to manage my environment variables?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/post': [
    {
      link: 'https://www.qovery.com/docs/configuration/lifecycle-job#creating-a-lifecycle-job',
      label: 'Create a new lifecycle job',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/cronjob#creating-a-cron-job',
      label: 'Create a new cronjob',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/configure': [
    {
      link: 'https://www.qovery.com/docs/configuration/cronjob/#job-configuration',
      label: 'Configure my cronjob',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/resources': [
    {
      link: 'https://www.qovery.com/docs/configuration/cronjob/#resources',
      label: 'Configure the number of CPUs and the amount of RAM that your cronjob needs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/variable': [
    {
      link: 'https://www.qovery.com/docs/configuration/environment-variables#environment-variables',
      label: 'How to manage my environment variables?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/post': [
    {
      link: 'https://www.qovery.com/docs/configuration/cronjob#creating-a-cron-job',
      label: 'Create a new cronjob',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/helm#creating-a-helm-service',
      label: 'Create a new helm service',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/integrations/observability/kubecost#kubecost',
      label: 'Monitor and reduce Kubernetes spend with Kubecost',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/integrations/observability/datadog',
      label: 'Kubernetes observability and monitoring with Datadog',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/auto-deploy#auto-deploy',
      label: 'Automatically update the applications to the latest version of your git branch',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/values-override/repository-and-yaml':
    [
      {
        link: 'https://www.qovery.com/docs/configuration/helm#values-override',
        label: 'Override the values of your chart with a file or a raw yaml',
      },
      {
        link: 'https://www.qovery.com/docs/configuration/deployment/auto-deploy#auto-deploy',
        label: 'Automatically update the applications to the latest version of your git branch',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/values-override/arguments': [
    {
      link: 'https://www.qovery.com/docs/configuration/helm#values-override',
      label: 'Override the values of your chart with arguments',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/summary': [
    {
      link: 'https://www.qovery.com/docs/configuration/helm#creating-a-helm-service',
      label: 'Create a new helm service',
    },
  ],
  '/organization/:organizationId/clusters/general': [
    { link: 'https://www.qovery.com/docs/getting-started/basic-concepts', label: 'Qovery basic concepts' },
    { link: 'https://www.qovery.com/docs/getting-started/quickstart', label: 'How to install Qovery?' },
    {
      link: 'https://www.qovery.com/docs/getting-started/guides/getting-started/deploy-your-first-application',
      label: 'Deploy my first application',
    },
    { link: 'https://www.qovery.com/docs/configuration/clusters/', label: 'What is a cluster?' },
    {
      link: 'https://www.qovery.com/docs/configuration/clusters/#updating-a-cluster',
      label: 'How to update my cluster?',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/clusters/#stopping-a-cluster',
      label: 'How to stop my cluster?',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/clusters/#restarting-a-cluster',
      label: 'How to restart my cluster?',
    },
  ],
  '/organization/:organizationId/clusters/create/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/clusters/#creating-a-cluster',
      label: 'How to create a cluster?',
    },
    {
      link: 'https://www.qovery.com/docs/getting-started/installation/kubernetes',
      label: 'How to use my own Kubernetes cluster?',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/clusters#comparison',
      label: 'What is the differences between clusters managed by Qovery or self-managed?',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/clusters/#what-is-a-cluster',
      label: 'What is a cluster?',
    },
  ],
  '/organization/:organizationId/clusters/create/resources': [
    {
      link: 'https://www.qovery.com/docs/configuration/clusters/#creating-a-cluster',
      label: 'How to create a cluster?',
    },
  ],
  '/organization/:organizationId/clusters/create/features': [
    {
      link: 'https://www.qovery.com/docs/configuration/clusters',
      label: 'How to custom my cluster network (static ip, custom VPC, …)?',
    },
  ],
  '/organization/:organizationId/clusters/create/summary': [
    { link: 'https://www.qovery.com/docs/configuration/clusters/', label: 'What is a cluster?' },
  ],
  '/organization/:organizationId/clusters/create/kubeconfig': [
    {
      link: 'https://www.qovery.com/docs/getting-started/installation/kubernetes',
      label: 'How to use my own Kubernetes cluster?',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/clusters#comparison',
      label: 'What is the differences between clusters managed by Qovery or self-managed?',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/general': [
    {
      link: 'https://www.qovery.com/docs/configuration/organization/cloud-credentials#cloud-credentials',
      label: 'Manage the cloud provider credentials associated to your cluster',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/resources': [],
  '/organization/:organizationId/cluster/:clusterId/settings/image-registry': [
    {
      link: 'https://www.qovery.com/docs/configuration/deployment/image-mirroring/',
      label: 'How does the mirroring work?',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/features': [
    {
      link: 'https://www.qovery.com/docs/configuration/clusters',
      label: 'How to custom my cluster network (static ip, custom VPC, …)?',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/network': [],
  '/organization/:organizationId/cluster/:clusterId/settings/kubeconfig': [],
  '/organization/:organizationId/cluster/:clusterId/settings/credentials': [
    {
      link: 'https://www.qovery.com/docs/configuration/clusters#what-is-a-cluster',
      label: 'What is a cluster?',
    },
    {
      link: 'https://www.qovery.com/docs/getting-started/installation/aws#create-your-cluster/',
      label: 'How to create my credentials in AWS?',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/advanced-settings': [
    {
      link: 'https://www.qovery.com/docs/configuration/cluster-advanced-settings/',
      label: 'Fine-tune your cluster using advanced settings',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/danger-zone': [
    {
      link: 'https://www.qovery.com/docs/configuration/cluster-advanced-settings/',
      label: 'Fine-tune your service using advanced settings',
    },
    {
      link: 'https://www.qovery.com/docs/configuration/clusters/#stopping-a-cluster',
      label: 'How to stop my cluster?',
    },
  ],
  '/onboarding/project': [
    { link: 'https://www.qovery.com/docs/getting-started/introduction', label: 'What is Qovery?' },
    { link: 'https://www.qovery.com/docs/getting-started/quickstart', label: 'Get started' },
    { link: 'https://www.qovery.com/docs/getting-started/how-it-works', label: 'How Qovery works?' },
    { link: 'https://www.qovery.com/docs/getting-started/basic-concepts', label: 'Qovery basic concepts' },
  ],
  '/onboarding/pricing': [{ link: 'https://www.qovery.com/pricing/', label: 'Check pricing and compare plans' }],
  '/onboarding/personalize': [
    { link: 'https://www.qovery.com/docs/getting-started/introduction', label: 'What is Qovery?' },
    { link: 'https://www.qovery.com/docs/getting-started/quickstart', label: 'Get started' },
    { link: 'https://www.qovery.com/docs/getting-started/how-it-works', label: 'How Qovery works?' },
    { link: 'https://www.qovery.com/docs/getting-started/basic-concepts', label: 'Qovery basic concepts' },
    { link: 'https://www.qovery.com/pricing/', label: 'Check pricing and compare plans' },
  ],
}

type MappingPath = keyof typeof mapping

const legacyPatterns = Object.keys(mapping) as MappingPath[]

const tanstackRouteAliases: Array<{ pattern: string; target: MappingPath }> = [
  // Onboarding
  { pattern: '/onboarding/personalize', target: '/onboarding/personalize' },
  { pattern: '/onboarding/project', target: '/onboarding/project' },
  { pattern: '/onboarding/plans', target: '/onboarding/pricing' },

  // Organization settings
  { pattern: '/organization/:organizationId/audit-logs', target: '/organization/:organizationId/audit-logs/general' },
  {
    pattern: '/organization/:organizationId/settings/general',
    target: '/organization/:organizationId/settings/general',
  },
  {
    pattern: '/organization/:organizationId/settings/members',
    target: '/organization/:organizationId/settings/members',
  },
  { pattern: '/organization/:organizationId/settings/roles', target: '/organization/:organizationId/settings/roles' },
  {
    pattern: '/organization/:organizationId/settings/roles/edit/:roleId',
    target: '/organization/:organizationId/settings/roles',
  },
  {
    pattern: '/organization/:organizationId/settings/billing-summary',
    target: '/organization/:organizationId/settings/billing-summary',
  },
  {
    pattern: '/organization/:organizationId/settings/billing-details',
    target: '/organization/:organizationId/settings/billing-detail',
  },
  {
    pattern: '/organization/:organizationId/settings/container-registries',
    target: '/organization/:organizationId/settings/container-registries',
  },
  {
    pattern: '/organization/:organizationId/settings/helm-repositories',
    target: '/organization/:organizationId/settings/helm-repositories',
  },
  {
    pattern: '/organization/:organizationId/settings/git-repository-access',
    target: '/organization/:organizationId/settings/git-repository-access',
  },
  {
    pattern: '/organization/:organizationId/settings/webhook',
    target: '/organization/:organizationId/settings/webhooks',
  },
  { pattern: '/organization/:organizationId/settings/api-token', target: '/organization/:organizationId/settings/api' },
  {
    pattern: '/organization/:organizationId/settings/labels-annotations',
    target: '/organization/:organizationId/settings/labels-annotations',
  },
  {
    pattern: '/organization/:organizationId/settings/danger-zone',
    target: '/organization/:organizationId/settings/danger-zone',
  },

  // Project
  {
    pattern: '/organization/:organizationId/project/:projectId/overview',
    target: '/organization/:organizationId/project/:projectId/environments/general',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/deployment-rules',
    target: '/organization/:organizationId/project/:projectId/environments/deployment-rules',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/deployment-rules/create',
    target: '/organization/:organizationId/project/:projectId/environments/deployment-rules/create',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/deployment-rules/edit/:deploymentRuleId',
    target: '/organization/:organizationId/project/:projectId/environments/deployment-rules',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/settings/general',
    target: '/organization/:organizationId/settings/:projectId/project/general',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/settings/danger-zone',
    target: '/organization/:organizationId/settings/:projectId/project/danger-zone',
  },

  // Environment
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/overview',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/general',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/overview/pipeline',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/general',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/deployments',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/deployments',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/deployment/:deploymentId',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/deployments',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/settings/general',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/general',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/settings/deployment-rules',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/rules',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/settings/preview-environments',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/preview-environments',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/settings/danger-zone',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/danger-zone',
  },

  // Service
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/overview',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/general',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/deployments',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/deployments',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/deployments/logs/:executionId',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/general',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/service-logs',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/general',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/variables',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/variables',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/general',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/general',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/resources',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/resources',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/configure',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/configure',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/values-override-file',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/values-override-file',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/values-override-arguments',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/values-override-arguments',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/networking',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/networking',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/storage',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/storage',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/domain',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/domain',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/health-checks',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/health-checks',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/port',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/port',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/deployment-restrictions',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/deployment-restrictions',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/advanced-settings',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/advanced-settings',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/danger-zone',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/danger-zone',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/terraform-arguments',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/terraform-arguments',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/terraform-configuration',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/terraform-arguments',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/:serviceId/settings/terraform-variables',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/terraform-arguments',
  },

  // Service creation
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/application/general',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/general',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/application/resources',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/resources',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/application/ports',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/ports',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/application/health-checks',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/health-checks',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/application/summary',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/post',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/container/general',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/general',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/container/resources',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/resources',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/container/ports',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/ports',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/container/health-checks',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/health-checks',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/container/summary',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/post',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/database/general',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/database/general',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/database/resources',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/database/resources',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/database/summary',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/database/post',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/lifecycle-job/general',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/general',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/lifecycle-job/configure',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/configure',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/lifecycle-job/resources',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/resources',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/lifecycle-job/variables',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/variable',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/lifecycle-job/summary',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/post',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/cron-job/general',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/general',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/cron-job/configure',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/configure',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/cron-job/resources',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/resources',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/cron-job/variables',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/variable',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/cron-job/summary',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/post',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/helm/general',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/general',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/helm/values-override-file',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/values-override/repository-and-yaml',
  },
  {
    pattern:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/helm/values-override-arguments',
    target:
      '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/values-override/arguments',
  },
  {
    pattern: '/organization/:organizationId/project/:projectId/environment/:environmentId/service/create/helm/summary',
    target: '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/summary',
  },

  // Clusters
  { pattern: '/organization/:organizationId/clusters', target: '/organization/:organizationId/clusters/general' },
  {
    pattern: '/organization/:organizationId/cluster/:clusterId/overview',
    target: '/organization/:organizationId/clusters/general',
  },
  {
    pattern: '/organization/:organizationId/cluster/:clusterId/cluster-logs',
    target: '/organization/:organizationId/clusters/general',
  },
  {
    pattern: '/organization/:organizationId/cluster/create/:slug/general',
    target: '/organization/:organizationId/clusters/create/general',
  },
  {
    pattern: '/organization/:organizationId/cluster/create/:slug/resources',
    target: '/organization/:organizationId/clusters/create/resources',
  },
  {
    pattern: '/organization/:organizationId/cluster/create/:slug/features',
    target: '/organization/:organizationId/clusters/create/features',
  },
  {
    pattern: '/organization/:organizationId/cluster/create/:slug/summary',
    target: '/organization/:organizationId/clusters/create/summary',
  },
  {
    pattern: '/organization/:organizationId/cluster/create/:slug/kubeconfig',
    target: '/organization/:organizationId/clusters/create/kubeconfig',
  },
  {
    pattern: '/organization/:organizationId/cluster/:clusterId/settings/general',
    target: '/organization/:organizationId/cluster/:clusterId/settings/general',
  },
  {
    pattern: '/organization/:organizationId/cluster/:clusterId/settings/resources',
    target: '/organization/:organizationId/cluster/:clusterId/settings/resources',
  },
  {
    pattern: '/organization/:organizationId/cluster/:clusterId/settings/image-registry',
    target: '/organization/:organizationId/cluster/:clusterId/settings/image-registry',
  },
  {
    pattern: '/organization/:organizationId/cluster/:clusterId/settings/network',
    target: '/organization/:organizationId/cluster/:clusterId/settings/network',
  },
  {
    pattern: '/organization/:organizationId/cluster/:clusterId/settings/credentials',
    target: '/organization/:organizationId/cluster/:clusterId/settings/credentials',
  },
  {
    pattern: '/organization/:organizationId/cluster/:clusterId/settings/advanced-settings',
    target: '/organization/:organizationId/cluster/:clusterId/settings/advanced-settings',
  },
  {
    pattern: '/organization/:organizationId/cluster/:clusterId/settings/danger-zone',
    target: '/organization/:organizationId/cluster/:clusterId/settings/danger-zone',
  },
]

const NAVIGATION_EVENT = 'qovery:navigation'
let isHistoryPatched = false

function normalizePathname(pathname: string): string {
  const decodedPathname = decodeURIComponent(pathname || '/')
    .replace(/\/{2,}/g, '/')
    .trim()
  if (!decodedPathname || decodedPathname === '/') {
    return '/'
  }
  return decodedPathname.replace(/\/+$/, '')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchesPattern(pattern: string, pathname: string): boolean {
  const normalizedPattern = normalizePathname(pattern)
  const normalizedPathname = normalizePathname(pathname)

  const regex = new RegExp(
    `^${normalizedPattern
      .split('/')
      .map((segment) => {
        if (!segment) {
          return ''
        }
        if (segment.startsWith(':')) {
          return '[^/]+'
        }
        return escapeRegExp(segment)
      })
      .join('/')}/?$`
  )

  return regex.test(normalizedPathname)
}

function findMappingPath(pathname: string): MappingPath | undefined {
  const normalizedPathname = normalizePathname(pathname)

  const directMatch = legacyPatterns.find((pattern) => matchesPattern(pattern, normalizedPathname))
  if (directMatch) {
    return directMatch
  }

  return tanstackRouteAliases.find((route) => matchesPattern(route.pattern, normalizedPathname))?.target
}

function patchHistoryEvents() {
  if (isHistoryPatched || typeof window === 'undefined') {
    return
  }

  const wrapHistoryMethod = (method: 'pushState' | 'replaceState') => {
    const originalMethod = window.history[method].bind(window.history)

    window.history[method] = ((...args: Parameters<History['pushState']>) => {
      const result = originalMethod(...args)
      window.dispatchEvent(new Event(NAVIGATION_EVENT))
      return result
    }) as History[typeof method]
  }

  wrapHistoryMethod('pushState')
  wrapHistoryMethod('replaceState')
  isHistoryPatched = true
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  patchHistoryEvents()

  window.addEventListener('popstate', onStoreChange)
  window.addEventListener(NAVIGATION_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('popstate', onStoreChange)
    window.removeEventListener(NAVIGATION_EVENT, onStoreChange)
  }
}

function getPathnameSnapshot() {
  if (typeof window === 'undefined') {
    return '/'
  }

  return normalizePathname(window.location.pathname)
}

export function useContextualDocLinks() {
  const pathname = useSyncExternalStore(subscribe, getPathnameSnapshot, () => '/')
  const mappingPath = findMappingPath(pathname)

  return mappingPath ? mapping[mappingPath] : []
}

export default useContextualDocLinks
