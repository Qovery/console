import { type Invoice } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useInvoiceUrl, useInvoices } from '@qovery/domains/organizations/feature'
import { type Value } from '@qovery/shared/interfaces'
import InvoicesList from '../../../ui/page-organization-billing-summary/invoices-list/invoices-list'

export const getListOfYears = (invoices: Invoice[]) => {
  const years = invoices.map((invoice) => new Date(invoice.created_at).getFullYear())
  return [...new Set(years)].sort((a, b) => b - a)
}

export function InvoicesListFeature() {
  const { organizationId = '' } = useParams()
  const [yearsFilterOptions, setYearsFilterOptions] = useState<Value[]>([])
  const [idOfInvoiceToDownload, setIdOfInvoiceToDownload] = useState<string | undefined>(undefined)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const { data: dataInvoices = [], isLoading: isLoadingDataInvoices } = useInvoices({ organizationId })
  const { mutateAsync: mutateAsyncInvoice } = useInvoiceUrl()

  const downloadOne = async (invoiceId: string) => {
    if (organizationId && invoiceId) {
      setIdOfInvoiceToDownload(invoiceId)

      try {
        const invoiceUrl = await mutateAsyncInvoice({ organizationId, invoiceId })
        if (invoiceUrl?.url) {
          const link = document.createElement('a')
          link.href = invoiceUrl.url
          link.download = invoiceUrl.url.substring(invoiceUrl.url.lastIndexOf('/') + 1)
          link.click()
          setIdOfInvoiceToDownload(undefined)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    if (dataInvoices.length > 0) {
      setInvoices(dataInvoices)
      const years = getListOfYears(dataInvoices)
      setYearsFilterOptions([
        { label: 'All', value: '' },
        ...years.map((year) => ({ label: `${year}`, value: `${year}` })),
      ])
    }
  }, [dataInvoices])

  const filterByYear = (year?: string) => {
    if (invoices.length > 0) {
      if (!year) return setInvoices(dataInvoices)

      const filteredInvoices = dataInvoices.filter((invoice) => {
        const invoiceYear = new Date(invoice.created_at).getFullYear()
        return invoiceYear === parseInt(year, 10)
      })
      setInvoices(filteredInvoices)
    }
  }

  return (
    <InvoicesList
      invoices={invoices}
      invoicesLoading={isLoadingDataInvoices}
      downloadOne={downloadOne}
      yearsForSorting={yearsFilterOptions}
      onFilterByYear={filterByYear}
      idOfInvoiceToDownload={idOfInvoiceToDownload}
    />
  )
}

export default InvoicesListFeature
