import { type Invoice } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchInvoiceUrl, fetchInvoices, selectOrganizationById } from '@qovery/domains/organization'
import { type Value } from '@qovery/shared/interfaces'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import InvoicesList from '../../../ui/page-organization-billing-summary/invoices-list/invoices-list'

export const getListOfYears = (invoices: Invoice[]) => {
  const years = invoices.map((invoice) => new Date(invoice.created_at).getFullYear())
  return [...new Set(years)].sort((a, b) => b - a)
}

export function InvoicesListFeature() {
  const { organizationId } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const organization = useSelector((state: RootState) => selectOrganizationById(state, organizationId || ''))
  const [yearsFilterOptions, setYearsFilterOptions] = useState<Value[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [idOfInvoiceToDownload, setIdOfInvoiceToDownload] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (organizationId && !organization?.invoices?.loadingStatus) {
      dispatch(fetchInvoices({ organizationId }))
    }
  }, [organizationId, dispatch, organization?.invoices?.loadingStatus])

  const downloadOne = (invoiceId: string) => {
    if (organizationId && invoiceId) {
      setIdOfInvoiceToDownload(invoiceId)
      dispatch(fetchInvoiceUrl({ organizationId, invoiceId }))
        .unwrap()
        .then((data) => {
          if (data.url) {
            const link = document.createElement('a')
            link.href = data.url
            link.download = data.url.substring(data.url.lastIndexOf('/') + 1)
            link.click()
          }
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          setIdOfInvoiceToDownload(undefined)
        })
    }
  }

  useEffect(() => {
    if (organization?.invoices?.items && organization.invoices.items.length > 0) {
      setInvoices(organization.invoices.items)
      const years = getListOfYears(organization.invoices.items)
      setYearsFilterOptions([
        { label: 'All', value: '' },
        ...years.map((year) => ({ label: `${year}`, value: `${year}` })),
      ])
    }
  }, [organization])

  const filterByYear = (year?: string) => {
    if (organization?.invoices?.items && organization.invoices.items.length > 0) {
      if (!year) return setInvoices(organization.invoices.items)

      const filteredInvoices = organization.invoices.items.filter((invoice) => {
        const invoiceYear = new Date(invoice.created_at).getFullYear()
        return invoiceYear === parseInt(year, 10)
      })
      setInvoices(filteredInvoices)
    }
  }

  return (
    <InvoicesList
      invoices={invoices}
      invoicesLoading={!organization?.invoices?.loadingStatus || organization.invoices.loadingStatus === 'loading'}
      downloadOne={downloadOne}
      yearsForSorting={yearsFilterOptions}
      onFilterByYear={filterByYear}
      idOfInvoiceToDownload={idOfInvoiceToDownload}
    />
  )
}

export default InvoicesListFeature
