export const SERVICES_HELM_CREATION_URL = '/create/helm'
export const SERVICES_HELM_TEMPLATE_CREATION_URL = (slug = ':slug', option = ':option') =>
  `/create/helm-template/${slug}/${option}`

// subrouter for helm steps /create/general /create/settings etc...
export const SERVICES_HELM_CREATION_GENERAL_URL = '/general'
export const SERVICES_HELM_CREATION_VALUES_STEP_1_URL = '/values-override/repository-and-yaml'
export const SERVICES_HELM_CREATION_VALUES_STEP_2_URL = '/values-override/arguments'
export const SERVICES_HELM_CREATION_SUMMARY_URL = '/summary'
