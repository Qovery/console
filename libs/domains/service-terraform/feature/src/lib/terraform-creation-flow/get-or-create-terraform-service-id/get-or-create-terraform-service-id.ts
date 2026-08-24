export async function getOrCreateTerraformServiceId(
  createdServiceId: string | undefined,
  createService: () => Promise<{ id: string }>
) {
  if (createdServiceId) return createdServiceId

  return (await createService()).id
}
