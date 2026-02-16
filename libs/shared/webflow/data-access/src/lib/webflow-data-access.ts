import { createQueryKeys } from '@lukemorales/query-key-factory'
import { WEBFLOW_TOKEN } from '@qovery/shared/util-node-env'

const COLLECTION_ID_CHANGELOGS = '68d1659afd533e08dfd9e8fa'

export const webflow = createQueryKeys('webflow', {
  changelogs: {
    queryKey: [COLLECTION_ID_CHANGELOGS],
    async queryFn() {
      const response = await fetch(`/api/webflow/v2/collections/${COLLECTION_ID_CHANGELOGS}/items?limit=1`, {
        headers: {
          Authorization: `Bearer ${WEBFLOW_TOKEN}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Webflow API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    },
  },
})
