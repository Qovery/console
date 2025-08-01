export const SERVICES_TERRAFORM_CREATION_URL = '/create/terraform'
export const SERVICES_TERRAFORM_TEMPLATE_CREATION_URL = (slug = ':slug', option = ':option') =>
  `/create/terraform/${slug}/${option}`

// subrouter for Terraform steps /create/general /create/configuration etc...
export const SERVICES_TERRAFORM_CREATION_GENERAL_URL = '/general'
export const SERVICES_TERRAFORM_CREATION_BASIC_CONFIG_URL = '/basic-configuration'
export const SERVICES_TERRAFORM_CREATION_INPUT_VARIABLES_URL = '/input-variables'
export const SERVICES_TERRAFORM_CREATION_SUMMARY_URL = '/summary'
