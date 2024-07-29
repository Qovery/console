// HACK: Backend doesn't provides an enum for possible templates,
// so we must hardcode their ids ¯\_(ツ)_/¯
export const TemplateIds = {
  CLOUDFORMATION: '94e9e430-8109-4879-8088-6c589e38c5f5' as const,
  TERRAFORM: '5f9c2fcd-86d4-42c9-9a5a-2f4126f39b06' as const,
}
