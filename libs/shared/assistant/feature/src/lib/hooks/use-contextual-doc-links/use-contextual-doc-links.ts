import { useMatch } from 'react-router-dom'
import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL,
  APPLICATION_SETTINGS_CONFIGURE_URL,
  APPLICATION_SETTINGS_DANGER_ZONE_URL,
  APPLICATION_SETTINGS_DEPLOYMENT_RESTRICTIONS,
  APPLICATION_SETTINGS_DOMAIN_URL,
  APPLICATION_SETTINGS_GENERAL_URL,
  APPLICATION_SETTINGS_HEALTHCHECKS_URL,
  APPLICATION_SETTINGS_NETWORKING_URL,
  APPLICATION_SETTINGS_PORT_URL,
  APPLICATION_SETTINGS_RESOURCES_URL,
  APPLICATION_SETTINGS_STORAGE_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_ARGUMENTS_URL,
  APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL,
  APPLICATION_URL,
  APPLICATION_VARIABLES_URL,
  AUDIT_LOGS_GENERAL_URL,
  AUDIT_LOGS_URL,
  CLUSTERS_CREATION_FEATURES_URL,
  CLUSTERS_CREATION_GENERAL_URL,
  CLUSTERS_CREATION_KUBECONFIG_URL,
  CLUSTERS_CREATION_REMOTE_URL,
  CLUSTERS_CREATION_RESOURCES_URL,
  CLUSTERS_CREATION_SUMMARY_URL,
  CLUSTERS_CREATION_URL,
  CLUSTERS_GENERAL_URL,
  CLUSTERS_URL,
  CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL,
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_DANGER_ZONE_URL,
  CLUSTER_SETTINGS_FEATURES_URL,
  CLUSTER_SETTINGS_GENERAL_URL,
  CLUSTER_SETTINGS_IMAGE_REGISTRY_URL,
  CLUSTER_SETTINGS_NETWORK_URL,
  CLUSTER_SETTINGS_RESOURCES_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_EDIT_URL,
  ENVIRONMENTS_DEPLOYMENT_RULES_URL,
  ENVIRONMENTS_GENERAL_URL,
  ENVIRONMENTS_URL,
  ONBOARDING_MORE_URL,
  ONBOARDING_PERSONALIZE_URL,
  ONBOARDING_PRICING_URL,
  ONBOARDING_PROJECT_URL,
  ONBOARDING_THANKS_URL,
  ONBOARDING_URL,
  SERVICES_APPLICATION_CREATION_URL,
  SERVICES_CREATION_GENERAL_URL,
  SERVICES_CREATION_HEALTHCHECKS_URL,
  SERVICES_CREATION_PORTS_URL,
  SERVICES_CREATION_POST_URL,
  SERVICES_CREATION_RESOURCES_URL,
  SERVICES_CRONJOB_CREATION_URL,
  SERVICES_DATABASE_CREATION_GENERAL_URL,
  SERVICES_DATABASE_CREATION_POST_URL,
  SERVICES_DATABASE_CREATION_RESOURCES_URL,
  SERVICES_DATABASE_CREATION_URL,
  SERVICES_DEPLOYMENTS_URL,
  SERVICES_GENERAL_URL,
  SERVICES_HELM_CREATION_GENERAL_URL,
  SERVICES_HELM_CREATION_SUMMARY_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_HELM_CREATION_VALUES_STEP_1_URL,
  SERVICES_HELM_CREATION_VALUES_STEP_2_URL,
  SERVICES_JOB_CREATION_CONFIGURE_URL,
  SERVICES_JOB_CREATION_GENERAL_URL,
  SERVICES_JOB_CREATION_POST_URL,
  SERVICES_JOB_CREATION_RESOURCES_URL,
  SERVICES_JOB_CREATION_VARIABLE_URL,
  SERVICES_LIFECYCLE_CREATION_URL,
  SERVICES_SETTINGS_DANGER_ZONE_URL,
  SERVICES_SETTINGS_GENERAL_URL,
  SERVICES_SETTINGS_PIPELINE_URL,
  SERVICES_SETTINGS_PREVIEW_ENV_URL,
  SERVICES_SETTINGS_RULES_URL,
  SERVICES_SETTINGS_URL,
  SERVICES_URL,
  SETTINGS_API_URL,
  SETTINGS_BILLING_SUMMARY_URL,
  SETTINGS_BILLING_URL,
  SETTINGS_CONTAINER_REGISTRIES_URL,
  SETTINGS_DANGER_ZONE_URL,
  SETTINGS_GENERAL_URL,
  SETTINGS_GIT_REPOSITORY_ACCESS_URL,
  SETTINGS_HELM_REPOSITORIES_URL,
  SETTINGS_LABELS_ANNOTATIONS_URL,
  SETTINGS_MEMBERS_URL,
  SETTINGS_PROJECT_DANGER_ZONE_URL,
  SETTINGS_PROJECT_GENERAL_URL,
  SETTINGS_PROJECT_URL,
  SETTINGS_ROLES_EDIT_URL,
  SETTINGS_ROLES_URL,
  SETTINGS_URL,
  SETTINGS_WEBHOOKS,
} from '@qovery/shared/routes'

const mapping = {
  '/organization/:organizationId/settings/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#general-information',
      label: 'Configure my organization',
    },
  ],
  '/organization/:organizationId/settings/members': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/members-rbac/',
      label: 'Manage the members of your organization (add / remove)',
    },
  ],
  '/organization/:organizationId/settings/roles': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/members-rbac/',
      label:
        'Control the access to your cluster and environment resources by defining and assigning roles to your users',
    },
  ],
  '/organization/:organizationId/settings/billing-summary': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#billing',
      label: 'Retrieve your invoices and manage your plan',
    },
    { link: 'https://www.qovery.com/pricing/', label: 'Check pricing and compare plans' },
  ],
  '/organization/:organizationId/settings/billing-detail': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#billing',
      label: 'Manage the credit card used for the payments',
    },
    { link: 'https://www.qovery.com/pricing/', label: 'Check pricing and compare plans' },
  ],
  '/organization/:organizationId/settings/container-registries': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/container-registry/',
      label: 'Define the list of container registries that can be used within your organization',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/integration/continuous-integration/',
      label: 'Use CI to manage the way that you want to deploy your applications',
    },
  ],
  '/organization/:organizationId/settings/helm-repositories': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/helm-repository/',
      label: 'Define the list of helm repositories that can be used within your organization',
    },
  ],
  '/organization/:organizationId/settings/git-repository-access': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/git-repository-access/',
      label: 'Manage the access to the repositories linked to your Git account within your Qovery organization',
    },
  ],
  '/organization/:organizationId/settings/webhooks': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/integration/webhook',
      label:
        'Create webhooks to get notified on external applications when event happens on an environment within your organization',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/integration/slack/',
      label: 'Automatically notify your team on a Slack workspace whenever a change has occurred on your apps',
    },
  ],
  '/organization/:organizationId/settings/api': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/api-token/',
      label: 'Allow third-party applications or script to access your organization via the Qovery API',
    },
    { link: 'https://api-doc.qovery.com/', label: 'Qovery API Documentation' },
    {
      link: 'https://hub.qovery.com/guides/tutorial/how-to-integrate-qovery-with-github-actions/',
      label: 'How to integrate Qovery with GitHub Actions',
    },
  ],
  '/organization/:organizationId/settings/labels-annotations': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/settings/danger-zone': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/#delete-an-organization',
      label: 'How to delete my organization?',
    },
  ],
  '/organization/:organizationId/settings/:projectId/project/danger-zone': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/project/#delete-a-project',
      label: 'How to delete my project?',
    },
  ],
  '/organization/:organizationId/settings/:projectId/project/general': [
    { link: 'https://hub.qovery.com/docs/using-qovery/configuration/project', label: 'What is a project?' },
  ],
  '/user/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/user-account/#general-account-settings',
      label: 'How to edit my general account settings?',
    },
  ],
  '/organization/:organizationId/audit-logs/general': [
    { link: 'https://hub.qovery.com/docs/using-qovery/audit-logs', label: 'How to access my Audit logs?' },
  ],
  '/organization/:organizationId/project/:projectId/environments/general': [
    { link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment', label: 'What is an environment?' },
  ],
  '/organization/:organizationId/project/:projectId/environments/deployment-rules': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/deployment-rule',
      label: 'What is a deployment rule?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environments/deployment-rules/create': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/deployment-rule',
      label: 'What is a deployment rule?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/general': [
    { link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment', label: 'What is an environment?' },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/running-and-deployment-statuses/',
      label: 'Monitor the running and deployment status of your environments and services',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/deployment-pipeline/',
      label: 'How do I manage the deployment order of my services?',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/deployment-actions/',
      label: 'Manage the deployment lifecycle of your services and environments',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/logs/',
      label: 'Check my deployments and application logs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/deployments': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/',
      label: 'All the information about the deployment management with Qovery',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/deployment-actions/',
      label: 'Manage the deployment lifecycle of your services and environments',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/deployment-history/',
      label: 'Access the deployments history of your environment or service',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#general-settings',
      label: 'Configure my environment',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/rules': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#deployment-rule',
      label: 'Reduct your costs by setting deployment rules',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/pipeline': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#deployment-pipeline',
      label: 'How do I manage the deployment order of my services?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/preview-environments':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#preview-environment',
        label: 'Create a dedicated environment for each of your pull requests',
      },
      {
        link: 'https://hub.qovery.com/guides/tutorial/blazingly-fast-preview-environments-for-nextjs-nodejs-and-mongodb-on-aws/',
        label: 'Blazingly fast Preview Environments for NextJS, NodeJS, and MongoDB on AWS',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/settings/services/danger-zone':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment/#delete-an-environment',
        label: 'How to delete my environment?',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/general': [
    { link: 'https://hub.qovery.com/docs/using-qovery/configuration/application', label: 'What is an application?' },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/logs/',
      label: 'Check my deployments and application logs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/deployments':
    [{ link: 'https://hub.qovery.com/docs/using-qovery/configuration/application', label: 'What is an application?' }],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/variables': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment-variable',
      label: 'How to manage my environment variables?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/general':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#general',
        label: 'Configure my application',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#general',
        label: 'Configure my database',
      },
      { link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#general', label: 'Configure my helm' },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#general',
        label: 'Configure my cronjob',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/#general',
        label: 'Configure my lifecycle job',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/resources':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#resources',
        label: 'Configure the number of CPUs and the amount of RAM that your app needs',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#resources',
        label: 'Configure the resources that your database needs',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/#resources',
        label: 'Configure the number of CPUs and the amount of RAM that your lifecycle job needs',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#resources',
        label: 'Configure the number of CPUs and the amount of RAM that your cronjob needs',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/configure':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#job-configuration',
        label: 'Configure my cronjob',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/#job-configuration',
        label: 'Configure my lifecycle job',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/values-override-file':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#override-as-file',
        label: 'Override the values of your chart with a file or a raw yaml',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/values-override-arguments':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#override-as-arguments',
        label: 'Override the values of your chart with arguments',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/storage':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#storage',
        label: 'Add persistent local storage for your application',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/networking':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#ports',
        label: 'Expose ports from your helm publicly',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/domain':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#domains',
        label: 'Customize the domain used to reach your application',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#domains',
        label: 'Customize the domain used to reach your application define in your helm',
      },
      {
        link: 'https://hub.qovery.com/guides/tutorial/setting-up-cloudflare-and-custom-domain-on-qovery/',
        label: 'Setting up Cloudflare and Custom Domain on Qovery',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/port':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#ports',
        label: 'Expose your application ports publicly',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/health-checks':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/service-health-checks/',
        label: 'How to configure your Liveness and Readiness probes?',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/deployment-restrictions':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/deployment/deploying-with-auto-deploy/#filtering-commits-triggering-the-auto-deploy',
        label: 'Avoid unnecessary deployments by including or excluding certain files or folders from the feature',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/advanced-settings':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/advanced-settings/',
        label: 'Fine-tune your service using advanced settings',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/application/:applicationId/settings/danger-zone':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#delete-an-application',
        label: 'How to delete my application?',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#delete-your-database-instance',
        label: 'How to delete my database?',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#delete-a-helm',
        label: 'How to delete my helm?',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#create-an-application',
      label: 'Create a new application',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/object-storage/',
      label: 'Add persistent local storage for your application',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/deploying-with-auto-deploy/',
      label: 'Automatically update the applications to the latest version of your git branch',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/resources': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#create-an-application',
      label: 'Create a new application',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#resources',
      label: 'Configure the number of CPUs and the amount of RAM that your app needs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/ports': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#create-an-application',
      label: 'Create a new application',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#ports',
      label: 'Expose your application ports publicly',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/health-checks': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#create-an-application',
      label: 'Create a new application',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/service-health-checks/',
      label: 'How to configure your Liveness and Readiness probes?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/post': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#create-an-application',
      label: 'Create a new application',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/database/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#create-a-database',
      label: 'Create a new database',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/postgresql/',
      label: 'Create a postgreSQL database',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/mysql/',
      label: 'Create a mySQL database',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/mongodb/',
      label: 'Create a mongoDB database',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/redis/',
      label: 'Create a redis database',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/database/resources': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#create-a-database',
      label: 'Create a new database',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#resources',
      label: 'Configure the resources that your database needs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/services/create/database/post': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/database/#create-a-database',
      label: 'Create a new database',
    },
    {
      link: 'https://hub.qovery.com/guides/tutorial/how-to-connect-to-a-managed-mongodb-instance-on-aws/',
      label: 'How to connect to a managed MongoDB instance on AWS?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/#create-a-job',
      label: 'Create a new lifecycle job',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/configure': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/#job-configuration',
      label: 'Configure my lifecycle job',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/resources': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/#resources',
      label: 'Configure the number of CPUs and the amount of RAM that your lifecycle job needs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/variable': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/environment-variable/',
      label: 'How to manage my environment variables?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/lifecyle-job/post': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/lifecycle-job/#create-a-job',
      label: 'Create a new lifecycle job',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#create-a-cronjob',
      label: 'Create a new cronjob',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/organization/labels-annotations/',
      label: 'How to create and apply my annotations and labels?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/configure': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#job-configuration',
      label: 'Configure my cronjob',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/resources': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#resources',
      label: 'Configure the number of CPUs and the amount of RAM that your cronjob needs',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/variable': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#environment-variable',
      label: 'How to manage my environment variables?',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/cron-job/post': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/cronjob/#create-a-cronjob',
      label: 'Create a new cronjob',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#create-a-helm',
      label: 'Create a new helm service',
    },
    {
      link: 'https://hub.qovery.com/guides/tutorial/monitor-and-reduce-kubernetes-spend-with-kubecost/',
      label: 'Monitor and reduce Kubernetes spend with Kubecost',
    },
    {
      link: 'https://hub.qovery.com/guides/tutorial/kubernetes-observability-and-monitoring-with-datadog/',
      label: 'Kubernetes observability and monitoring with Datadog',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/deploying-with-auto-deploy/',
      label: 'Automatically update the applications to the latest version of your git branch',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/values-override/repository-and-yaml':
    [
      {
        link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#values',
        label: 'Override the values of your chart with a file or a raw yaml',
      },
      {
        link: 'https://hub.qovery.com/docs/using-qovery/deployment/deploying-with-auto-deploy/',
        label: 'Automatically update the applications to the latest version of your git branch',
      },
    ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/values-override/arguments': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#values',
      label: 'Override the values of your chart with arguments',
    },
  ],
  '/organization/:organizationId/project/:projectId/environment/:environmentId/create/helm/summary': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/#create-a-helm',
      label: 'Create a new helm service',
    },
  ],
  '/organization/:organizationId/clusters/general': [
    { link: 'https://hub.qovery.com/docs/getting-started/basic-concepts/', label: 'Qovery basic concepts' },
    { link: 'https://hub.qovery.com/docs/getting-started/install-qovery/', label: 'How to install Qovery?' },
    { link: 'https://hub.qovery.com/docs/getting-started/deploy-my-app/', label: 'Deploy my first application' },
    { link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/', label: 'What is a cluster?' },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#updating-a-cluster',
      label: 'How to update my cluster?',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#stopping-a-cluster',
      label: 'How to stop my cluster?',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#restarting-a-cluster',
      label: 'How to restart my cluster?',
    },
  ],
  '/organization/:organizationId/clusters/create/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#creating-a-cluster',
      label: 'How to create a cluster?',
    },
    {
      link: 'https://hub.qovery.com/docs/getting-started/install-qovery/kubernetes/quickstart/',
      label: 'How to use my own Kubernetes cluster?',
    },
    {
      link: 'https://hub.qovery.com/docs/getting-started/install-qovery/#managed-cluster-by-qovery-vs-self-managed---what-to-choose',
      label: 'What is the differences between clusters managed by Qovery or self-managed?',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#what-is-a-cluster',
      label: 'What is a cluster?',
    },
  ],
  '/organization/:organizationId/clusters/create/resources': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#creating-a-cluster',
      label: 'How to create a cluster?',
    },
  ],
  '/organization/:organizationId/clusters/create/features': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features',
      label: 'How to custom my cluster network (static ip, custom VPC, …)?',
    },
  ],
  '/organization/:organizationId/clusters/create/summary': [
    { link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/', label: 'What is a cluster?' },
  ],
  '/organization/:organizationId/clusters/create/kubeconfig': [
    {
      link: 'https://hub.qovery.com/docs/getting-started/install-qovery/kubernetes/quickstart/',
      label: 'How to use my own Kubernetes cluster?',
    },
    {
      link: 'https://hub.qovery.com/docs/getting-started/install-qovery/#managed-cluster-by-qovery-vs-self-managed---what-to-choose',
      label: 'What is the differences between clusters managed by Qovery or self-managed?',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/general': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#credentials',
      label: 'Manage the cloud provider credentials associated to your cluster',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/resources': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#resources',
      label: 'How to configure the resources allocated to your cluster?',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/image-registry': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/deployment/image-mirroring/',
      label: 'How does the mirroring work?',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/features': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#features',
      label: 'How to custom my cluster network (static ip, custom VPC, …)?',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/network': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#network',
      label: 'Perform VPC peering by updating your Qovery VPC route table',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/kubeconfig': [],
  '/organization/:organizationId/cluster/:clusterId/settings/credentials': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/',
      label: 'What is a cluster?',
    },
    {
      link: 'https://hub.qovery.com/docs/getting-started/install-qovery/aws/cluster-managed-by-qovery/create-credentials/',
      label: 'How to create my credentials in AWS?',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/advanced-settings': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/cluster-advanced-settings/',
      label: 'Fine-tune your cluster using advanced settings',
    },
  ],
  '/organization/:organizationId/cluster/:clusterId/settings/danger-zone': [
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/cluster-advanced-settings/',
      label: 'Fine-tune your service using advanced settings',
    },
    {
      link: 'https://hub.qovery.com/docs/using-qovery/configuration/clusters/#stopping-a-cluster',
      label: 'How to stop my cluster?',
    },
  ],
  '/onboarding/project': [
    { link: 'https://hub.qovery.com/docs/getting-started/what-is-qovery/', label: 'What is Qovery?' },
    { link: 'https://hub.qovery.com/docs/getting-started/how-qovery-works/', label: 'How Qovery works?' },
    { link: 'https://hub.qovery.com/docs/getting-started/basic-concepts/', label: 'Qovery basic concepts' },
  ],
  '/onboarding/pricing': [{ link: 'https://www.qovery.com/pricing/', label: 'Check pricing and compare plans' }],
  '/onboarding/personalize': [
    { link: 'https://hub.qovery.com/docs/getting-started/what-is-qovery/', label: 'What is Qovery?' },
    { link: 'https://hub.qovery.com/docs/getting-started/how-qovery-works/', label: 'How Qovery works?' },
    { link: 'https://hub.qovery.com/docs/getting-started/basic-concepts/', label: 'Qovery basic concepts' },
    { link: 'https://www.qovery.com/pricing/', label: 'Check pricing and compare plans' },
  ],
}

/**
 * TODO: This hook is a bit tedious due to limitation to our current react-router implementation.
 * This should be refactor to use [useMatches](https://reactrouter.com/en/main/hooks/use-matches).
 * Unfortunately this also requires to rewrite the whole router using [createBrowserRouter](https://reactrouter.com/en/main/routers/create-browser-router)
 * https://stackoverflow.com/a/71246254
 **/
export function useContextualDocLinks() {
  // ONBOARDING
  const onBoardingPersonalizeURL = useMatch(ONBOARDING_URL + ONBOARDING_PERSONALIZE_URL)
  const onBoardingPricingURL = useMatch(ONBOARDING_URL + ONBOARDING_PRICING_URL)
  const onBoardingProjectURL = useMatch(ONBOARDING_URL + ONBOARDING_PROJECT_URL)
  const onBoardingMoreURL = useMatch(ONBOARDING_URL + ONBOARDING_MORE_URL)
  const onBoardingThanksURL = useMatch(ONBOARDING_URL + ONBOARDING_THANKS_URL)

  // AUDIT LOGS
  const auditLogsGeneralURL = useMatch(AUDIT_LOGS_URL() + AUDIT_LOGS_GENERAL_URL)

  // PROJECT SETTINGS
  const projectSettingsGeneralURL = useMatch(SETTINGS_URL() + SETTINGS_PROJECT_URL() + SETTINGS_PROJECT_GENERAL_URL)
  const projectSettingsDangerZoneURL = useMatch(
    SETTINGS_URL() + SETTINGS_PROJECT_URL() + SETTINGS_PROJECT_DANGER_ZONE_URL
  )

  // ORGANIZATION SETTINGS
  const organizationSettingsGeneralURL = useMatch(SETTINGS_URL() + SETTINGS_GENERAL_URL)
  const organizationSettingsMembersURL = useMatch(SETTINGS_URL() + SETTINGS_MEMBERS_URL)
  const organizationSettingsRolesURL = useMatch(SETTINGS_URL() + SETTINGS_ROLES_URL)
  const organizationSettingsRoleEditURL = useMatch(SETTINGS_URL() + SETTINGS_ROLES_EDIT_URL)
  const organizationSettingsBillingSummaryURL = useMatch(SETTINGS_URL() + SETTINGS_BILLING_SUMMARY_URL)
  const organizationSettingsBillingDetailsURL = useMatch(SETTINGS_URL() + SETTINGS_BILLING_URL)
  const organizationSettingsLabelsAnnotationsURL = useMatch(SETTINGS_URL() + SETTINGS_LABELS_ANNOTATIONS_URL)
  const organizationSettingsContainerRegistriesURL = useMatch(SETTINGS_URL() + SETTINGS_CONTAINER_REGISTRIES_URL)
  const organizationSettingsHelmRepositoriesURL = useMatch(SETTINGS_URL() + SETTINGS_HELM_REPOSITORIES_URL)
  const organizationSettingsGitRepositoryAccessURL = useMatch(SETTINGS_URL() + SETTINGS_GIT_REPOSITORY_ACCESS_URL)
  const organizationSettingsWebhooksURL = useMatch(SETTINGS_URL() + SETTINGS_WEBHOOKS)
  const organizationSettingsApiTokensURL = useMatch(SETTINGS_URL() + SETTINGS_API_URL)
  const organizationSettingsDangerZoneURL = useMatch(SETTINGS_URL() + SETTINGS_DANGER_ZONE_URL)

  // PROJECT GENERAL
  const projectGeneralURL = useMatch(ENVIRONMENTS_URL() + ENVIRONMENTS_GENERAL_URL)

  // PROJECT DEPLOYMENT RULES
  const projectDeploymentRulesURL = useMatch(ENVIRONMENTS_URL() + ENVIRONMENTS_DEPLOYMENT_RULES_URL)
  const projectDeploymentRulesCreateURL = useMatch(ENVIRONMENTS_URL() + ENVIRONMENTS_DEPLOYMENT_RULES_CREATE_URL)
  const projectDeploymentRulesEditURL = useMatch(ENVIRONMENTS_URL() + ENVIRONMENTS_DEPLOYMENT_RULES_EDIT_URL)

  // ENVIRONMENT GENERAL
  const environmentGeneralURL = useMatch(SERVICES_URL() + SERVICES_GENERAL_URL)

  // ENVIRONMENT DEPLOYMENTS
  const environmentDeploymentsURL = useMatch(SERVICES_URL() + SERVICES_DEPLOYMENTS_URL)

  // ENVIRONMENT SETTINGS
  const environmentSettingsGeneralURL = useMatch(SERVICES_URL() + SERVICES_SETTINGS_URL + SERVICES_SETTINGS_GENERAL_URL)
  const environmentSettingsRulesURL = useMatch(SERVICES_URL() + SERVICES_SETTINGS_URL + SERVICES_SETTINGS_RULES_URL)
  const environmentSettingsPipelineURL = useMatch(
    SERVICES_URL() + SERVICES_SETTINGS_URL + SERVICES_SETTINGS_PIPELINE_URL
  )
  const environmentSettingsPreviewEnvURL = useMatch(
    SERVICES_URL() + SERVICES_SETTINGS_URL + SERVICES_SETTINGS_PREVIEW_ENV_URL
  )
  const environmentSettingsDangerZoneURL = useMatch(
    SERVICES_URL() + SERVICES_SETTINGS_URL + SERVICES_SETTINGS_DANGER_ZONE_URL
  )

  // APPLICATION + HELM GENERAL
  const applicationGeneralURL = useMatch(APPLICATION_URL() + APPLICATION_GENERAL_URL)

  // APPLICATION + HELM VARIABLES
  const applicationVariablesURL = useMatch(APPLICATION_URL() + APPLICATION_VARIABLES_URL)

  // APPLICATION + HELM DEPLOYMENTS
  const applicationDeploymentsURL = useMatch(APPLICATION_URL() + APPLICATION_DEPLOYMENTS_URL)

  // APPLICATION + HELM SETTINGS
  const applicationSettingsGeneralURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_GENERAL_URL
  )
  const applicationSettingsResourcesURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_RESOURCES_URL
  )
  const applicationSettingsConfigureURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_CONFIGURE_URL
  )
  const applicationSettingsValuesOverrideFileURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_VALUES_OVERRIDE_FILE_URL
  )
  const applicationSettingsValuesOverrideArgumentsURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_VALUES_OVERRIDE_ARGUMENTS_URL
  )
  const applicationSettingsNetworkingURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_NETWORKING_URL
  )
  const applicationSettingsStorageURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_STORAGE_URL
  )
  const applicationSettingsDomainURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_DOMAIN_URL
  )
  const applicationSettingsHealthchecksURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_HEALTHCHECKS_URL
  )
  const applicationSettingsPortURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_PORT_URL
  )
  const applicationSettingsDeploymentRestrictionsURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_DEPLOYMENT_RESTRICTIONS
  )
  const applicationSettingsAdvancedSettingsURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_ADVANCED_SETTINGS_URL
  )
  const applicationSettingsDangerZoneURL = useMatch(
    APPLICATION_URL() + APPLICATION_SETTINGS_URL + APPLICATION_SETTINGS_DANGER_ZONE_URL
  )

  // APPLICATION/CONTAINER CREATION
  const applicationCreationGeneralURL = useMatch(
    SERVICES_URL() + SERVICES_APPLICATION_CREATION_URL + SERVICES_CREATION_GENERAL_URL
  )
  const applicationCreationResourcesURL = useMatch(
    SERVICES_URL() + SERVICES_APPLICATION_CREATION_URL + SERVICES_CREATION_RESOURCES_URL
  )
  const applicationCreationPortsURL = useMatch(
    SERVICES_URL() + SERVICES_APPLICATION_CREATION_URL + SERVICES_CREATION_PORTS_URL
  )
  const applicationCreationHealthchecksURL = useMatch(
    SERVICES_URL() + SERVICES_APPLICATION_CREATION_URL + SERVICES_CREATION_HEALTHCHECKS_URL
  )
  const applicationCreationPostURL = useMatch(
    SERVICES_URL() + SERVICES_APPLICATION_CREATION_URL + SERVICES_CREATION_POST_URL
  )

  // DATABASE CREATION
  const databaseCreationGeneralURL = useMatch(
    SERVICES_URL() + SERVICES_DATABASE_CREATION_URL + SERVICES_DATABASE_CREATION_GENERAL_URL
  )
  const databaseCreationResourcesURL = useMatch(
    SERVICES_URL() + SERVICES_DATABASE_CREATION_URL + SERVICES_DATABASE_CREATION_RESOURCES_URL
  )
  const databaseCreationPostURL = useMatch(
    SERVICES_URL() + SERVICES_DATABASE_CREATION_URL + SERVICES_DATABASE_CREATION_POST_URL
  )

  // LIFECYCLE JOB CREATION
  const lifecycleJobCreationGeneralURL = useMatch(
    SERVICES_URL() + SERVICES_LIFECYCLE_CREATION_URL + SERVICES_JOB_CREATION_GENERAL_URL
  )
  const lifecycleJobCreationConfigureURL = useMatch(
    SERVICES_URL() + SERVICES_LIFECYCLE_CREATION_URL + SERVICES_JOB_CREATION_CONFIGURE_URL
  )
  const lifecycleJobCreationResourcesURL = useMatch(
    SERVICES_URL() + SERVICES_LIFECYCLE_CREATION_URL + SERVICES_JOB_CREATION_RESOURCES_URL
  )
  const lifecycleJobCreationVariableURL = useMatch(
    SERVICES_URL() + SERVICES_LIFECYCLE_CREATION_URL + SERVICES_JOB_CREATION_VARIABLE_URL
  )
  const lifecycleJobCreationPostURL = useMatch(
    SERVICES_URL() + SERVICES_LIFECYCLE_CREATION_URL + SERVICES_JOB_CREATION_POST_URL
  )

  // CRON JOB CREATION
  const cronJobCreationGeneralURL = useMatch(
    SERVICES_URL() + SERVICES_CRONJOB_CREATION_URL + SERVICES_JOB_CREATION_GENERAL_URL
  )
  const cronJobCreationConfigureURL = useMatch(
    SERVICES_URL() + SERVICES_CRONJOB_CREATION_URL + SERVICES_JOB_CREATION_CONFIGURE_URL
  )
  const cronJobCreationResourcesURL = useMatch(
    SERVICES_URL() + SERVICES_CRONJOB_CREATION_URL + SERVICES_JOB_CREATION_RESOURCES_URL
  )
  const cronJobCreationVariableURL = useMatch(
    SERVICES_URL() + SERVICES_CRONJOB_CREATION_URL + SERVICES_JOB_CREATION_VARIABLE_URL
  )
  const cronJobCreationPostURL = useMatch(
    SERVICES_URL() + SERVICES_CRONJOB_CREATION_URL + SERVICES_JOB_CREATION_POST_URL
  )

  // HELM CREATION
  const helmCreationGeneralURL = useMatch(
    SERVICES_URL() + SERVICES_HELM_CREATION_URL + SERVICES_HELM_CREATION_GENERAL_URL
  )
  const helmCreationValuesStep1URL = useMatch(
    SERVICES_URL() + SERVICES_HELM_CREATION_URL + SERVICES_HELM_CREATION_VALUES_STEP_1_URL
  )
  const helmCreationValuesStep2URL = useMatch(
    SERVICES_URL() + SERVICES_HELM_CREATION_URL + SERVICES_HELM_CREATION_VALUES_STEP_2_URL
  )
  const helmCreationSummaryURL = useMatch(
    SERVICES_URL() + SERVICES_HELM_CREATION_URL + SERVICES_HELM_CREATION_SUMMARY_URL
  )

  // CLUSTERS
  const clustersGeneralURL = useMatch(CLUSTERS_URL() + CLUSTERS_GENERAL_URL)

  // CLUSTER CREATION
  const clusterCreationFeaturesURL = useMatch(CLUSTERS_URL() + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_FEATURES_URL)
  const clusterCreationGeneralURL = useMatch(CLUSTERS_URL() + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_GENERAL_URL)
  const clusterCreationKubeconfigURL = useMatch(
    CLUSTERS_URL() + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_KUBECONFIG_URL
  )
  const clusterCreationRemoteURL = useMatch(CLUSTERS_URL() + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_REMOTE_URL)
  const clusterCreationResourcesURL = useMatch(CLUSTERS_URL() + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_RESOURCES_URL)
  const clusterCreationSummaryURL = useMatch(CLUSTERS_URL() + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_SUMMARY_URL)

  // CLUSTER SETTINGS
  const clusterSettingsGeneralURL = useMatch(CLUSTER_URL() + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_GENERAL_URL)
  const clusterSettingsCredentialsURL = useMatch(
    CLUSTER_URL() + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_CREDENTIALS_URL
  )
  const clusterSettingsResourcesURL = useMatch(CLUSTER_URL() + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_RESOURCES_URL)
  const clusterSettingsImageRegistryURL = useMatch(
    CLUSTER_URL() + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_IMAGE_REGISTRY_URL
  )
  const clusterSettingsFeaturesURL = useMatch(CLUSTER_URL() + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_FEATURES_URL)
  const clusterSettingsNetworkURL = useMatch(CLUSTER_URL() + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_NETWORK_URL)
  const clusterSettingsAdvancedSettingsURL = useMatch(
    CLUSTER_URL() + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_ADVANCED_SETTINGS_URL
  )
  const clusterSettingsDangerZoneURL = useMatch(CLUSTER_URL() + CLUSTER_SETTINGS_URL + CLUSTER_SETTINGS_DANGER_ZONE_URL)

  const matchingPattern =
    onBoardingPersonalizeURL ??
    onBoardingPricingURL ??
    onBoardingProjectURL ??
    onBoardingMoreURL ??
    onBoardingThanksURL ??
    auditLogsGeneralURL ??
    projectSettingsGeneralURL ??
    projectSettingsDangerZoneURL ??
    organizationSettingsGeneralURL ??
    organizationSettingsMembersURL ??
    organizationSettingsRolesURL ??
    organizationSettingsRoleEditURL ??
    organizationSettingsBillingSummaryURL ??
    organizationSettingsBillingDetailsURL ??
    organizationSettingsLabelsAnnotationsURL ??
    organizationSettingsContainerRegistriesURL ??
    organizationSettingsHelmRepositoriesURL ??
    organizationSettingsGitRepositoryAccessURL ??
    organizationSettingsWebhooksURL ??
    organizationSettingsApiTokensURL ??
    organizationSettingsDangerZoneURL ??
    projectGeneralURL ??
    projectDeploymentRulesURL ??
    projectDeploymentRulesCreateURL ??
    projectDeploymentRulesEditURL ??
    environmentGeneralURL ??
    environmentDeploymentsURL ??
    environmentSettingsGeneralURL ??
    environmentSettingsRulesURL ??
    environmentSettingsPipelineURL ??
    environmentSettingsPreviewEnvURL ??
    environmentSettingsDangerZoneURL ??
    applicationGeneralURL ??
    applicationVariablesURL ??
    applicationDeploymentsURL ??
    applicationSettingsGeneralURL ??
    applicationSettingsResourcesURL ??
    applicationSettingsConfigureURL ??
    applicationSettingsValuesOverrideFileURL ??
    applicationSettingsValuesOverrideArgumentsURL ??
    applicationSettingsNetworkingURL ??
    applicationSettingsStorageURL ??
    applicationSettingsDomainURL ??
    applicationSettingsHealthchecksURL ??
    applicationSettingsPortURL ??
    applicationSettingsDeploymentRestrictionsURL ??
    applicationSettingsAdvancedSettingsURL ??
    applicationSettingsDangerZoneURL ??
    applicationCreationGeneralURL ??
    applicationCreationResourcesURL ??
    applicationCreationPortsURL ??
    applicationCreationHealthchecksURL ??
    applicationCreationPostURL ??
    databaseCreationGeneralURL ??
    databaseCreationResourcesURL ??
    databaseCreationPostURL ??
    lifecycleJobCreationGeneralURL ??
    lifecycleJobCreationConfigureURL ??
    lifecycleJobCreationResourcesURL ??
    lifecycleJobCreationVariableURL ??
    lifecycleJobCreationPostURL ??
    cronJobCreationGeneralURL ??
    cronJobCreationConfigureURL ??
    cronJobCreationResourcesURL ??
    cronJobCreationVariableURL ??
    cronJobCreationPostURL ??
    helmCreationGeneralURL ??
    helmCreationValuesStep1URL ??
    helmCreationValuesStep2URL ??
    helmCreationSummaryURL ??
    clustersGeneralURL ??
    clusterCreationFeaturesURL ??
    clusterCreationGeneralURL ??
    clusterCreationKubeconfigURL ??
    clusterCreationRemoteURL ??
    clusterCreationResourcesURL ??
    clusterCreationSummaryURL ??
    clusterSettingsGeneralURL ??
    clusterSettingsCredentialsURL ??
    clusterSettingsResourcesURL ??
    clusterSettingsImageRegistryURL ??
    clusterSettingsFeaturesURL ??
    clusterSettingsNetworkURL ??
    clusterSettingsAdvancedSettingsURL ??
    clusterSettingsDangerZoneURL
  const patternPath = matchingPattern?.pattern.path
  if (patternPath && patternPath in mapping) {
    return mapping[patternPath as keyof typeof mapping]
  }

  return []
}

export default useContextualDocLinks
