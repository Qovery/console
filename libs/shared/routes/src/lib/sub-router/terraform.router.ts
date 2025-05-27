export const SERVICES_TERRAFORM_CREATION_URL = '/create/terraform'
export const SERVICES_TERRAFORM_TEMPLATE_CREATION_URL = (slug = ':slug', option = ':option') =>
  `/create/terraform/${slug}/${option}`

// subrouter for helm steps /create/general /create/settings etc...
export const SERVICES_TERRAFORM_CREATION_GENERAL_URL = '/general'
export const SERVICES_TERRAFORM_CREATION_VALUES_STEP_1_URL = '/values-override/repository-and-yaml'
export const SERVICES_TERRAFORM_CREATION_VALUES_STEP_2_URL = '/values-override/arguments'
export const SERVICES_TERRAFORM_CREATION_SUMMARY_URL = '/summary'
