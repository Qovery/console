/*
 * Jobs agents can run on their own, from the policy examples in the Qovery documentation
 * (https://www.qovery.com/docs/configuration/organization/policy-examples/overview). The texts, the
 * policies and the prompts are copied from those pages: keep them in sync when the docs change.
 */

export type AgentJobLevel = 'investigate' | 'hygiene' | 'cost' | 'reliability' | 'change'

/**
 * When the agent runs. Agent Tasks support two triggers natively: a schedule (cron and timezone) and
 * a webhook (anything that can POST to its URL). Every suggestion maps to one of them.
 */
export interface AgentJobTrigger {
  kind: 'schedule' | 'webhook'
  /** Plain words, shown on the card. */
  label: string
  /** The cron expression to start from, for a schedule. */
  cron?: string
  /** The timezone the cron is written in, when the prompt names one. Set it on the Agent Task too. */
  timezone?: string
  /** Who sends the webhook, or another way to run it. */
  note?: string
}

export interface AgentJob {
  slug: string
  level: AgentJobLevel
  title: string
  /** What the agent does, in one sentence. */
  does: string
  /** The card version, short enough for two lines, with the safety promise kept. */
  summary: string
  can: string[]
  cannot: string[]
  /** The task to give the agent. The token goes in the environment, never in the prompt. */
  prompt: string
  /** The example Rego policy, with REPLACE_WITH_... values to fill in. */
  policy: string
  trigger: AgentJobTrigger
}

/** Safest first: each level asks for more trust than the one before. */
export const AGENT_JOB_LEVELS: { level: AgentJobLevel; title: string; description: string }[] = [
  {
    level: 'investigate',
    title: 'Investigate',
    description: 'Read only, or changes limited to previews. Nothing in production moves.',
  },
  {
    level: 'hygiene',
    title: 'Hygiene',
    description: 'Stop and clean up what nobody uses. Production is never touched.',
  },
  { level: 'cost', title: 'Cost', description: 'Resize what runs, within bounds you set.' },
  {
    level: 'reliability',
    title: 'Reliability',
    description: 'Act on production to keep it up: roll back, scale ahead of a peak.',
  },
  { level: 'change', title: 'Change', description: 'Ship a fix, after testing it on a copy of production.' },
]

export const policyExampleUrl = (slug: string) =>
  `https://www.qovery.com/docs/configuration/organization/policy-examples/${slug}`

export const AGENT_JOBS: AgentJob[] = [
  {
    slug: 'investigate-production-incident',
    level: 'investigate',
    title: 'Investigate an incident',
    summary: 'Reads status, deployments and logs to find the cause. Changes nothing.',
    does: 'Reads production status, deployment history and logs to find the cause of an incident, and cannot change anything.',
    can: [
      'Find the organization, project and environment by name, as the Qovery CLI does',
      'Read the production environment: services, status, deployment history and logs',
    ],
    cannot: [
      'Read environment variable values, even in production',
      'Deploy, redeploy, restart or stop anything',
      'Change any configuration, or delete anything',
      'Read any other environment',
    ],
    prompt:
      'Our production checkout service started failing about 20 minutes ago.\nUse Qovery to investigate. The project is "shop" and the environment is "production".\n\n1. Find which services are not healthy and since when.\n2. Read the deployment history and the logs of the failing services.\n3. Compare the last failing deployment with the last healthy one.\n4. Give me a short report: what broke, the most likely cause, and the fix you suggest.\n\nDo not try to change or redeploy anything. Your token only allows reads.',
    policy:
      'default allow := false\n\norganization_id := "REPLACE_WITH_ORGANIZATION_ID"\nproject_id := "REPLACE_WITH_PROJECT_ID"\nproduction_environment_id := "REPLACE_WITH_PRODUCTION_ENVIRONMENT_ID"\n\nallow if cli_lookup\nallow if read_production\n\n# Let the Qovery CLI find the organization, project and environment by name.\ncli_lookup if {\n\tinput.request.method == "GET"\n\tinput.request.path in {\n\t\t["api", "organization"],\n\t\t["api", "organization", organization_id],\n\t\t["api", "organization", organization_id, "project"],\n\t\t["api", "project", project_id],\n\t\t["api", "project", project_id, "environment"],\n\t}\n}\n\n# Read production: services, status, deployment history and logs.\n# Environment variables are left out, because their values can be sensitive.\nread_production if {\n\tinput.request.method in {"GET", "HEAD"}\n\tinput.qovery_metadata.environment_id == production_environment_id\n\tnot "environmentVariable" in input.request.path\n}',
    trigger: {
      kind: 'webhook',
      label: 'When an incident fires',
      note: 'From the incident tool’s webhook, for example incident.io or Honeybadger.',
    },
  },
  {
    slug: 'fix-in-preview-environment',
    level: 'investigate',
    title: 'Verify a fix in a preview',
    summary: 'Tests a fix in previews. Can start or stop any environment except production and staging.',
    does: 'Reads production to find a bug, then deploys and checks its fix in preview environments, and cannot touch production or staging.',
    can: [
      'Find the organization, project and environment by name',
      'Read every environment of the project, production included, except environment variables',
      'Deploy, redeploy, restart or stop any environment of the project except production and staging, previews included, or one of its services',
    ],
    cannot: [
      'Deploy, restart or stop production or staging',
      'Change configuration or environment variables, even in a preview',
      'Delete anything, or clone an environment',
      'Act on another project',
    ],
    prompt:
      'Users report that the discount code field rejects valid codes.\nThe Qovery project is "shop".\n\n1. Read the production logs and deployment history to find the error.\n2. Fix the bug on a new branch and open a pull request.\n3. Wait for the preview environment of the pull request, deploy it if needed,\n   and check that a valid discount code is accepted.\n4. Stop the preview environment when you are done, and post the result on the pull request.\n\nYou cannot deploy production. A human merges the pull request.',
    policy:
      'default allow := false\n\norganization_id := "REPLACE_WITH_ORGANIZATION_ID"\nproject_id := "REPLACE_WITH_PROJECT_ID"\nproduction_environment_id := "REPLACE_WITH_PRODUCTION_ENVIRONMENT_ID"\n\n# Long-lived environments in the project that the agent must never change.\nprotected_environment_ids := {\n\tproduction_environment_id,\n\t"REPLACE_WITH_STAGING_ENVIRONMENT_ID",\n}\n\nallow if cli_lookup\nallow if read_project\nallow if manage_preview\n\n# Let the Qovery CLI find the organization, project and environment by name.\ncli_lookup if {\n\tinput.request.method == "GET"\n\tinput.request.path in {\n\t\t["api", "organization"],\n\t\t["api", "organization", organization_id],\n\t\t["api", "organization", organization_id, "project"],\n\t\t["api", "project", project_id],\n\t\t["api", "project", project_id, "environment"],\n\t}\n}\n\n# Read every environment of the project, production included, except environment variables.\nread_project if {\n\tinput.request.method in {"GET", "HEAD"}\n\tinput.qovery_metadata.project_id == project_id\n\tnot "environmentVariable" in input.request.path\n}\n\n# Deploy, redeploy, restart or stop any environment of the project that is not protected\n# (previews, but also dev or QA), or one of its services.\nmanage_preview if {\n\tinput.request.method == "POST"\n\tinput.qovery_metadata.project_id == project_id\n\tnot input.qovery_metadata.environment_id in protected_environment_ids\n\tinput.request.path[count(input.request.path) - 1] in {"deploy", "redeploy", "restart", "restart-service", "stop"}\n}',
    trigger: {
      kind: 'webhook',
      label: 'When a pull request is opened',
      note: 'From your Git provider’s pull request webhook.',
    },
  },
  {
    slug: 'stop-idle-environments',
    level: 'hygiene',
    title: 'Stop idle environments',
    summary: 'Stops idle dev environments at night and starts them in the morning. Nothing else.',
    does: 'Stops development environments when nobody uses them and starts them again in the morning, and cannot touch anything else.',
    can: [
      'Find the organization, project and environment by name',
      'Read the status and deployment history of the listed environments',
      'Stop a listed environment, or start it again with a deploy',
    ],
    cannot: [
      'Stop or deploy production, staging or any environment that is not listed',
      'Delete an environment or a service',
      'Change any configuration',
    ],
    prompt:
      'Check the "dev" and "qa" environments of the Qovery project "shop".\n\nIf an environment has had no deployment in the last 24 hours, or if it is\nafter 8 PM or a weekend in Paris time, stop it.\nOn weekdays at 8 AM Paris time, start the stopped ones again.\n\nList what you stopped or started, and why.',
    policy:
      'default allow := false\n\norganization_id := "REPLACE_WITH_ORGANIZATION_ID"\nproject_id := "REPLACE_WITH_PROJECT_ID"\n\n# The non-production environments the agent may stop and start.\nidle_candidate_environment_ids := {\n\t"REPLACE_WITH_DEV_ENVIRONMENT_ID",\n\t"REPLACE_WITH_QA_ENVIRONMENT_ID",\n}\n\nallow if cli_lookup\nallow if read_candidates\nallow if stop_or_start\n\n# Let the Qovery CLI find the organization, project and environment by name.\ncli_lookup if {\n\tinput.request.method == "GET"\n\tinput.request.path in {\n\t\t["api", "organization"],\n\t\t["api", "organization", organization_id],\n\t\t["api", "organization", organization_id, "project"],\n\t\t["api", "project", project_id],\n\t\t["api", "project", project_id, "environment"],\n\t}\n}\n\n# Read the status and deployment history of those environments.\nread_candidates if {\n\tinput.request.method in {"GET", "HEAD"}\n\tinput.qovery_metadata.environment_id in idle_candidate_environment_ids\n\tnot "environmentVariable" in input.request.path\n}\n\n# Stop an environment, or start it again with a deploy. Nothing else.\nstop_or_start if {\n\tinput.request.method == "POST"\n\tinput.request.path[1] == "environment"\n\tinput.request.path[2] in idle_candidate_environment_ids\n\tinput.request.path[3] in {"stop", "deploy"}\n\tcount(input.request.path) == 4\n}',
    // Every day: the prompt stops environments on weekends too, and starts them on weekdays only.
    trigger: { kind: 'schedule', label: 'Every day at 8 PM and 8 AM', cron: '0 8,20 * * *', timezone: 'Europe/Paris' },
  },
  {
    slug: 'clean-up-preview-environments',
    level: 'hygiene',
    title: 'Clean up previews',
    summary: 'Deletes merged or idle previews. Never production or staging.',
    does: 'Deletes preview environments after the pull request is merged or idle, and can never delete production or staging.',
    can: [
      'Find the organization, project and environment by name',
      'Read the environments of the project, except environment variables',
      'Delete a whole environment of the project, unless it is protected',
    ],
    cannot: [
      'Delete production, staging or any protected environment',
      'Delete a single service, a database or the project',
      'Delete anything in another project',
      'Deploy, stop or change anything',
    ],
    prompt:
      'Clean up preview environments in the Qovery project "shop".\n\nFor each environment that is not production or staging:\n- find the pull request it was created for,\n- delete the environment if the pull request is merged or closed,\n  or if the environment had no deployment in the last 7 days.\n\nDo not delete anything else. Give me the list of deleted environments\nwith the reason for each.',
    policy:
      'default allow := false\n\norganization_id := "REPLACE_WITH_ORGANIZATION_ID"\nproject_id := "REPLACE_WITH_PROJECT_ID"\n\n# Long-lived environments in the project that the agent must never delete.\nprotected_environment_ids := {\n\t"REPLACE_WITH_PRODUCTION_ENVIRONMENT_ID",\n\t"REPLACE_WITH_STAGING_ENVIRONMENT_ID",\n}\n\nallow if cli_lookup\nallow if read_project\nallow if delete_preview\n\n# Let the Qovery CLI find the organization, project and environment by name.\ncli_lookup if {\n\tinput.request.method == "GET"\n\tinput.request.path in {\n\t\t["api", "organization"],\n\t\t["api", "organization", organization_id],\n\t\t["api", "organization", organization_id, "project"],\n\t\t["api", "project", project_id],\n\t\t["api", "project", project_id, "environment"],\n\t}\n}\n\n# Read the environments of the project, to see which previews are idle.\nread_project if {\n\tinput.request.method in {"GET", "HEAD"}\n\tinput.qovery_metadata.project_id == project_id\n\tnot "environmentVariable" in input.request.path\n}\n\n# Delete a whole environment of the project, unless it is protected.\ndelete_preview if {\n\tinput.request.method == "DELETE"\n\tinput.request.path[1] == "environment"\n\tcount(input.request.path) == 3\n\tinput.qovery_metadata.project_id == project_id\n\tnot input.qovery_metadata.environment_id in protected_environment_ids\n}',
    trigger: {
      kind: 'schedule',
      label: 'Every hour',
      cron: '0 * * * *',
      note: 'Or from your Git provider’s webhook when a pull request is merged.',
    },
  },
  {
    slug: 'right-size-applications',
    level: 'cost',
    title: 'Right-size applications',
    summary: 'Sets CPU and memory from real usage, within your bounds. Nothing else.',
    does: 'Sets CPU and memory from real usage within bounds you choose, and cannot change instances, branch or anything else.',
    can: [
      'Find the organization, project and environment by name',
      'Read the staging environment, except environment variables',
      'Change CPU and memory of the listed applications, within the bounds',
      'Redeploy the listed applications',
    ],
    cannot: [
      'Set CPU or memory outside the bounds',
      'Change the minimum or maximum number of instances',
      'Change the Git branch',
      'Change or redeploy any application that is not listed',
      'Read or change production, delete anything',
    ],
    prompt:
      '/qovery-optimize Right-size the "api" and "worker" applications in the\n"staging" environment of the Qovery project "shop".\n\nUse the real CPU and memory usage of the last 30 days. Keep 30% headroom\nover the peak. Do not change the number of instances.\nApply the new values, redeploy each application, and check it is healthy.\nReport the old and new values, and the expected saving.',
    policy:
      'default allow := false\n\norganization_id := "REPLACE_WITH_ORGANIZATION_ID"\nproject_id := "REPLACE_WITH_PROJECT_ID"\nstaging_environment_id := "REPLACE_WITH_STAGING_ENVIRONMENT_ID"\n\n# The applications the agent may resize. Instances and branch stay as they are today.\napplications := {\n\t"REPLACE_WITH_API_APPLICATION_ID": {"min_instances": 1, "max_instances": 3, "branch": "main"},\n\t"REPLACE_WITH_WORKER_APPLICATION_ID": {"min_instances": 1, "max_instances": 2, "branch": "main"},\n}\n\n# Bounds for CPU (millicores) and memory (MB).\ncpu_bounds := {"min": 100, "max": 2000}\nmemory_bounds := {"min": 128, "max": 4096}\n\nallow if cli_lookup\nallow if read_staging\nallow if resize\nallow if redeploy\n\n# Let the Qovery CLI find the organization, project and environment by name.\ncli_lookup if {\n\tinput.request.method == "GET"\n\tinput.request.path in {\n\t\t["api", "organization"],\n\t\t["api", "organization", organization_id],\n\t\t["api", "organization", organization_id, "project"],\n\t\t["api", "project", project_id],\n\t\t["api", "project", project_id, "environment"],\n\t}\n}\n\n# Read staging: services, status, deployment history and logs.\nread_staging if {\n\tinput.request.method in {"GET", "HEAD"}\n\tinput.qovery_metadata.environment_id == staging_environment_id\n\tnot "environmentVariable" in input.request.path\n}\n\n# Change CPU and memory within the bounds. Instances and branch must not change.\nresize if {\n\tinput.request.method == "PUT"\n\tinput.request.path[1] == "application"\n\tcount(input.request.path) == 3\n\tapp := applications[input.request.path[2]]\n\tbody := input.request.body\n\tbody.cpu >= cpu_bounds.min\n\tbody.cpu <= cpu_bounds.max\n\tbody.memory >= memory_bounds.min\n\tbody.memory <= memory_bounds.max\n\tbody.min_running_instances == app.min_instances\n\tbody.max_running_instances == app.max_instances\n\tbody.git_repository.branch == app.branch\n}\n\n# Redeploy a resized application so the new values apply.\nredeploy if {\n\tinput.request.method == "POST"\n\tinput.request.path[1] == "application"\n\tapplications[input.request.path[2]]\n\tinput.request.path[3] == "redeploy"\n\tcount(input.request.path) == 4\n}',
    trigger: { kind: 'schedule', label: 'Every Monday morning', cron: '0 6 * * 1' },
  },
  {
    slug: 'roll-back-bad-release',
    level: 'reliability',
    title: 'Roll back a bad release',
    summary: 'Rolls production back to the last healthy version. No config changes, no deletes.',
    does: 'Reads errors after a deploy and rolls production services back to the last healthy version, and cannot change configuration or delete anything.',
    can: [
      'Find the organization, project and environment by name',
      'Read the production environment, except environment variables',
      'Deploy a given commit of the listed applications',
      'Deploy a given image tag of the listed containers',
    ],
    cannot: [
      'Deploy without naming the version',
      'Deploy, stop or restart anything else',
      'Change configuration or environment variables',
      'Delete anything',
    ],
    prompt:
      'We deployed a new version of the "api" application in the "production"\nenvironment of the Qovery project "shop" 10 minutes ago.\n\nCheck the logs and the deployment status. If the error rate is clearly\nhigher than before the deployment, roll back:\nfind the last commit that was deployed and healthy in the deployment history,\ndeploy that commit, and check that the service is healthy again.\n\nReport what you saw, what you rolled back to, and the commit that caused it.',
    policy:
      'default allow := false\n\norganization_id := "REPLACE_WITH_ORGANIZATION_ID"\nproject_id := "REPLACE_WITH_PROJECT_ID"\nproduction_environment_id := "REPLACE_WITH_PRODUCTION_ENVIRONMENT_ID"\n\n# The production services the agent may roll back.\napplication_ids := {"REPLACE_WITH_API_APPLICATION_ID", "REPLACE_WITH_WEB_APPLICATION_ID"}\ncontainer_ids := {"REPLACE_WITH_WORKER_CONTAINER_ID"}\n\nallow if cli_lookup\nallow if read_production\nallow if deploy_application_version\nallow if deploy_container_version\n\n# Let the Qovery CLI find the organization, project and environment by name.\ncli_lookup if {\n\tinput.request.method == "GET"\n\tinput.request.path in {\n\t\t["api", "organization"],\n\t\t["api", "organization", organization_id],\n\t\t["api", "organization", organization_id, "project"],\n\t\t["api", "project", project_id],\n\t\t["api", "project", project_id, "environment"],\n\t}\n}\n\n# Read production: services, status, deployment history and logs.\nread_production if {\n\tinput.request.method in {"GET", "HEAD"}\n\tinput.qovery_metadata.environment_id == production_environment_id\n\tnot "environmentVariable" in input.request.path\n}\n\n# Deploy a given commit of an application. The commit must be named in the request.\ndeploy_application_version if {\n\tinput.request.method == "POST"\n\tinput.request.path[1] == "application"\n\tinput.request.path[2] in application_ids\n\tinput.request.path[3] == "deploy"\n\tcount(input.request.path) == 4\n\tcount(input.request.body.git_commit_id) > 0\n}\n\n# Deploy a given image tag of a container. The tag must be named in the request.\ndeploy_container_version if {\n\tinput.request.method == "POST"\n\tinput.request.path[1] == "container"\n\tinput.request.path[2] in container_ids\n\tinput.request.path[3] == "deploy"\n\tcount(input.request.path) == 4\n\tcount(input.request.body.image_tag) > 0\n}',
    trigger: {
      kind: 'webhook',
      label: 'When errors rise after a deploy',
      note: 'From your monitoring tool’s alert webhook.',
    },
  },
  {
    slug: 'scale-before-traffic-peak',
    level: 'reliability',
    title: 'Scale before a traffic peak',
    summary: 'Adds instances before a known peak and removes them after, within your limits.',
    does: 'Adds instances before a known traffic peak and removes them after, within a floor and a ceiling, and cannot change anything else.',
    can: [
      'Find the organization, project and environment by name',
      'Read the production environment, except environment variables',
      'Set the minimum and maximum instances of the listed applications, between the floor and the ceiling',
      'Redeploy the listed applications',
    ],
    cannot: [
      'Go above the ceiling, set an unlimited maximum, or go below the floor',
      'Change CPU, memory or the Git branch',
      'Deploy a new version',
      'Change environment variables, delete anything, or touch other applications',
    ],
    prompt:
      'We send a marketing email to 400,000 users on Tuesday at 10 AM Paris time.\n\nOn Tuesday at 9:30 AM, in the Qovery project "shop", environment "production":\n- set the "api" application to a minimum of 6 and a maximum of 12 instances,\n- set the "web" application to a minimum of 4 and a maximum of 8 instances,\n- redeploy both and check they are healthy.\n\nOn Tuesday at 2 PM, set both back to a minimum of 2 and a maximum of 4,\nand redeploy. Report each change.',
    policy:
      'default allow := false\n\norganization_id := "REPLACE_WITH_ORGANIZATION_ID"\nproject_id := "REPLACE_WITH_PROJECT_ID"\nproduction_environment_id := "REPLACE_WITH_PRODUCTION_ENVIRONMENT_ID"\n\n# The applications the agent may scale, with their current CPU, memory and branch, and the\n# highest number of instances the agent may set.\napplications := {\n\t"REPLACE_WITH_API_APPLICATION_ID": {"cpu": 1000, "memory": 2048, "branch": "main", "floor": 2, "ceiling": 12},\n\t"REPLACE_WITH_WEB_APPLICATION_ID": {"cpu": 500, "memory": 1024, "branch": "main", "floor": 2, "ceiling": 8},\n}\n\nallow if cli_lookup\nallow if read_production\nallow if scale\nallow if redeploy\n\n# Let the Qovery CLI find the organization, project and environment by name.\ncli_lookup if {\n\tinput.request.method == "GET"\n\tinput.request.path in {\n\t\t["api", "organization"],\n\t\t["api", "organization", organization_id],\n\t\t["api", "organization", organization_id, "project"],\n\t\t["api", "project", project_id],\n\t\t["api", "project", project_id, "environment"],\n\t}\n}\n\n# Read production: services, status, deployment history and logs.\nread_production if {\n\tinput.request.method in {"GET", "HEAD"}\n\tinput.qovery_metadata.environment_id == production_environment_id\n\tnot "environmentVariable" in input.request.path\n}\n\n# Change the number of instances between the floor and the ceiling.\n# CPU, memory and branch must stay as they are.\nscale if {\n\tinput.request.method == "PUT"\n\tinput.request.path[1] == "application"\n\tcount(input.request.path) == 3\n\tapp := applications[input.request.path[2]]\n\tbody := input.request.body\n\tbody.min_running_instances >= app.floor\n\tbody.max_running_instances >= body.min_running_instances\n\tbody.max_running_instances <= app.ceiling\n\tbody.cpu == app.cpu\n\tbody.memory == app.memory\n\tbody.git_repository.branch == app.branch\n}\n\n# Redeploy a scaled application so the new values apply.\nredeploy if {\n\tinput.request.method == "POST"\n\tinput.request.path[1] == "application"\n\tapplications[input.request.path[2]]\n\tinput.request.path[3] == "redeploy"\n\tcount(input.request.path) == 4\n}',
    trigger: {
      kind: 'schedule',
      label: 'Before a known peak, for example Tuesdays at 9:30 AM',
      cron: '30 9 * * 2',
      timezone: 'Europe/Paris',
      note: 'And a second schedule to scale back after the peak, for example Tuesdays at 2 PM (0 14 * * 2).',
    },
  },
  {
    slug: 'patch-security-issue',
    level: 'change',
    title: 'Patch a security issue',
    summary: 'Tests a fix on a copy of production, then deploys it. No config or secret changes.',
    does: 'Tests a security fix on a copy of production, then deploys the patched commit, and cannot change production configuration or secrets.',
    can: [
      'Find the organization, projects, environments and clusters by name',
      'Read the production environment, except environment variables',
      'Clone production into the sandbox project, on the non-production cluster',
      'Deploy, change, test and delete anything inside the sandbox project, except environment variables',
      'Deploy a named commit of the listed production applications',
    ],
    cannot: [
      'Change production configuration or environment variables',
      'Redeploy, stop or delete anything in production',
      'Deploy an application that is not listed',
      'Clone or move anything from the sandbox into production',
    ],
    prompt:
      'The base image of the "api" application has a critical vulnerability\n(CVE-2026-1234 in openssl). Fix it and ship it.\n\n1. Update the Dockerfile to a patched base image on a new branch, and push it.\n2. Clone the "production" environment of the Qovery project "shop" into the\n   project "sandbox", on the cluster "non-prod". Point the copy\'s "api"\n   application to your branch, deploy it, and run `npm test` and `npm run test:e2e`.\n3. If the tests pass, delete the copy, merge the branch, and deploy the merged\n   commit to the "api" application in production.\n4. Check that production is healthy and report the commit you deployed.\n\nDo not change any production setting or environment variable.',
    policy:
      'default allow := false\n\norganization_id := "REPLACE_WITH_ORGANIZATION_ID"\nproject_id := "REPLACE_WITH_PROJECT_ID"\nproduction_environment_id := "REPLACE_WITH_PRODUCTION_ENVIRONMENT_ID"\n\n# A project and a cluster dedicated to test copies.\nsandbox_project_id := "REPLACE_WITH_SANDBOX_PROJECT_ID"\nsandbox_cluster_id := "REPLACE_WITH_NON_PRODUCTION_CLUSTER_ID"\n\n# The production applications the agent may patch.\napplication_ids := {"REPLACE_WITH_API_APPLICATION_ID", "REPLACE_WITH_WEB_APPLICATION_ID"}\n\nallow if cli_lookup\nallow if read_production\nallow if clone_production\nallow if manage_sandbox\nallow if deploy_patched_version\n\n# Let the Qovery CLI find the organization, projects, environments and clusters by name.\ncli_lookup if {\n\tinput.request.method == "GET"\n\tinput.request.path in {\n\t\t["api", "organization"],\n\t\t["api", "organization", organization_id],\n\t\t["api", "organization", organization_id, "project"],\n\t\t["api", "organization", organization_id, "cluster"],\n\t\t["api", "project", project_id],\n\t\t["api", "project", project_id, "environment"],\n\t\t["api", "project", sandbox_project_id],\n\t\t["api", "project", sandbox_project_id, "environment"],\n\t}\n}\n\n# Read production configuration and status, except environment variables.\nread_production if {\n\tinput.request.method in {"GET", "HEAD"}\n\tinput.qovery_metadata.environment_id == production_environment_id\n\tnot "environmentVariable" in input.request.path\n}\n\n# Clone production, only into the sandbox project, on the non-production cluster.\nclone_production if {\n\tinput.request.method == "POST"\n\tinput.request.path == ["api", "environment", production_environment_id, "clone"]\n\tinput.request.body.project_id == sandbox_project_id\n\tinput.request.body.cluster_id == sandbox_cluster_id\n\tinput.request.body.mode != "PRODUCTION"\n}\n\n# Do anything inside the sandbox project: deploy the patched copy, test it, delete it.\n# Cloning or moving out of the sandbox is excluded, so nothing can land in production.\nmanage_sandbox if {\n\tinput.qovery_metadata.project_id == sandbox_project_id\n\tinput.qovery_metadata.environment_id != null\n\tnot "clone" in input.request.path\n\tnot "moveToProject" in input.request.path\n\t# The copy holds production values: its environment variables stay out of reach too.\n\tnot "environmentVariable" in input.request.path\n}\n\n# Deploy the patched commit of a production application. Nothing else in production.\ndeploy_patched_version if {\n\tinput.request.method == "POST"\n\tinput.request.path[1] == "application"\n\tinput.request.path[2] in application_ids\n\tinput.request.path[3] == "deploy"\n\tcount(input.request.path) == 4\n\tcount(input.request.body.git_commit_id) > 0\n}',
    trigger: {
      kind: 'schedule',
      label: 'Every Monday, as a weekly scan',
      cron: '0 7 * * 1',
      note: 'A new CVE is not a trigger on its own: a weekly run checks for it.',
    },
  },
  {
    slug: 'test-on-production-clone',
    level: 'change',
    title: 'Test on a copy of production',
    summary: 'Runs tests on a copy of production, then deletes the copy. Never changes production.',
    does: 'Clones production into a sandbox project, runs tests on the copy and deletes it, and cannot change production.',
    can: [
      'Find the organization, projects, environments and clusters by name',
      'Read the production environment, except environment variables',
      'Clone production into the sandbox project, on the non-production cluster, as a non-production environment',
      'Deploy, change, test and delete anything inside the sandbox project, except environment variables',
    ],
    cannot: [
      'Deploy, change or delete anything in production',
      'Clone production into another project, onto another cluster, or as a production environment',
      'Clone or move anything from the sandbox into production',
      'Read or change environment variables, in production or in the copy',
      'Delete the sandbox project itself',
    ],
    prompt:
      'Run the end-to-end tests on a copy of production.\n\n1. Clone the "production" environment of the Qovery project "shop" into the\n   project "sandbox", on the cluster "non-prod", as a DEVELOPMENT environment.\n   Name it "e2e-<today\'s date>".\n2. Deploy the copy and wait until every service is running.\n3. Run `npm run test:e2e` with BASE_URL set to the copy\'s URL.\n4. Report the results, then delete the copy.\n\nDo not change anything in production.',
    policy:
      'default allow := false\n\norganization_id := "REPLACE_WITH_ORGANIZATION_ID"\nproject_id := "REPLACE_WITH_PROJECT_ID"\nproduction_environment_id := "REPLACE_WITH_PRODUCTION_ENVIRONMENT_ID"\n\n# A project and a cluster dedicated to test copies.\nsandbox_project_id := "REPLACE_WITH_SANDBOX_PROJECT_ID"\nsandbox_cluster_id := "REPLACE_WITH_NON_PRODUCTION_CLUSTER_ID"\n\nallow if cli_lookup\nallow if read_production\nallow if clone_production\nallow if manage_sandbox\n\n# Let the Qovery CLI find the organization, projects, environments and clusters by name.\ncli_lookup if {\n\tinput.request.method == "GET"\n\tinput.request.path in {\n\t\t["api", "organization"],\n\t\t["api", "organization", organization_id],\n\t\t["api", "organization", organization_id, "project"],\n\t\t["api", "organization", organization_id, "cluster"],\n\t\t["api", "project", project_id],\n\t\t["api", "project", project_id, "environment"],\n\t\t["api", "project", sandbox_project_id],\n\t\t["api", "project", sandbox_project_id, "environment"],\n\t}\n}\n\n# Read production configuration and status, except environment variables.\nread_production if {\n\tinput.request.method in {"GET", "HEAD"}\n\tinput.qovery_metadata.environment_id == production_environment_id\n\tnot "environmentVariable" in input.request.path\n}\n\n# Clone production, only into the sandbox project, on the non-production cluster,\n# and never as a production environment.\nclone_production if {\n\tinput.request.method == "POST"\n\tinput.request.path == ["api", "environment", production_environment_id, "clone"]\n\tinput.request.body.project_id == sandbox_project_id\n\tinput.request.body.cluster_id == sandbox_cluster_id\n\tinput.request.body.mode != "PRODUCTION"\n}\n\n# Do anything inside the sandbox project: deploy the copy, run tests, change it, delete it.\n# Cloning or moving out of the sandbox is excluded, so nothing can land in production.\nmanage_sandbox if {\n\tinput.qovery_metadata.project_id == sandbox_project_id\n\tinput.qovery_metadata.environment_id != null\n\tnot "clone" in input.request.path\n\tnot "moveToProject" in input.request.path\n\t# The copy holds production values: its environment variables stay out of reach too.\n\tnot "environmentVariable" in input.request.path\n}',
    trigger: {
      kind: 'schedule',
      label: 'Every night',
      cron: '0 2 * * *',
      note: 'Or before each release, from your CI’s webhook.',
    },
  },
]
