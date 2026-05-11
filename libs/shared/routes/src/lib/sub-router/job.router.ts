export const SERVICES_CRONJOB_CREATION_URL = '/create/cron-job'
export const SERVICES_LIFECYCLE_CREATION_URL = '/create/lifecyle-job'
export const SERVICES_LIFECYCLE_TEMPLATE_CREATION_URL = (template?: string, option?: string) => {
  const params = new URLSearchParams()
  if (template) params.set('template', template)
  if (option && option !== 'current') params.set('option', option)
  const qs = params.toString()
  return `/service/create/lifecycle-job${qs ? `?${qs}` : ''}`
}

// subrouter for job steps /create/general /create/settings etc...
export const SERVICES_JOB_CREATION_INTRODUCTION_URL = '/introduction'
export const SERVICES_JOB_CREATION_GENERAL_URL = '/general'
export const SERVICES_JOB_CREATION_CONFIGURE_URL = '/configure'
export const SERVICES_JOB_CREATION_DOCKERFILE_URL = '/dockerfile'
export const SERVICES_JOB_CREATION_RESOURCES_URL = '/resources'
export const SERVICES_JOB_CREATION_POST_URL = '/post'
export const SERVICES_JOB_CREATION_PORT_URL = '/port'
export const SERVICES_JOB_CREATION_VARIABLE_URL = '/variable'
