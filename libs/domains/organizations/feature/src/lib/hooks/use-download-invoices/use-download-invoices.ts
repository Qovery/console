import { useMutation } from '@tanstack/react-query'
import { type Invoice } from 'qovery-typescript-axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { mutations } from '@qovery/domains/organizations/data-access'
import { toast } from '@qovery/shared/ui'

// Pause between files. Browsers drop or block downloads fired in a tight loop.
export const DOWNLOAD_INVOICES_DELAY_MS = 800

export interface DownloadInvoicesProgress {
  total: number
  completed: number
  failed: number
}

export function triggerFileDownload(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = url.substring(url.lastIndexOf('/') + 1)
  link.click()
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const pluralize = (count: number) => `${count} invoice${count === 1 ? '' : 's'}`

/**
 * Downloads invoices one by one through the per-invoice endpoint, so each file is authorized by the API.
 * Each file gets its own <a download> click. Chrome asks once to allow multiple downloads from the site;
 * if the user refuses, the remaining files are silently dropped by the browser.
 */
export function useDownloadInvoices({
  organizationId,
  delayMs = DOWNLOAD_INVOICES_DELAY_MS,
}: {
  organizationId: string
  delayMs?: number
}) {
  const { mutateAsync: getInvoiceUrl } = useMutation(mutations.invoiceUrl)
  const [progress, setProgress] = useState<DownloadInvoicesProgress | undefined>(undefined)
  const cancelledRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cancelledRef.current = true
    }
  }, [])

  const cancel = useCallback(() => {
    cancelledRef.current = true
  }, [])

  const downloadAll = useCallback(
    async (invoices: Invoice[]) => {
      if (!organizationId || invoices.length === 0) return

      cancelledRef.current = false
      const total = invoices.length
      let completed = 0
      let failed = 0
      setProgress({ total, completed, failed })

      for (const [index, invoice] of invoices.entries()) {
        if (cancelledRef.current) break

        try {
          const invoiceUrl = await getInvoiceUrl({ organizationId, invoiceId: invoice.id })
          if (!invoiceUrl?.url) throw new Error('Missing invoice URL')
          if (cancelledRef.current) break
          triggerFileDownload(invoiceUrl.url)
          completed++
        } catch (error) {
          console.error(error)
          failed++
        }

        if (mountedRef.current) setProgress({ total, completed, failed })
        if (index < total - 1 && !cancelledRef.current) await wait(delayMs)
      }

      const wasCancelled = cancelledRef.current
      if (mountedRef.current) setProgress(undefined)

      if (wasCancelled) {
        if (mountedRef.current)
          toast('warning', 'Download cancelled', `${completed} of ${pluralize(total)} downloaded.`)
      } else if (failed > 0) {
        toast(
          'error',
          `${completed} of ${pluralize(total)} downloaded`,
          `${pluralize(failed)} could not be downloaded. Try them one by one from the list.`
        )
      } else {
        toast('success', `${pluralize(completed)} downloaded`)
      }
    },
    [organizationId, getInvoiceUrl, delayMs]
  )

  return { downloadAll, cancel, progress, isDownloading: progress !== undefined }
}

export default useDownloadInvoices
