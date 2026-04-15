'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { InvoiceData } from '@/lib/types';
import { MONTH_NAMES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  invoice: InvoiceData;
}

export function InvoicePreview({ invoice }: Props) {
  const { provider, perChild, month, year, familySurname, parentName, familyAddress, generatedAt } =
    invoice;

  function formatSortCode(sc: string) {
    const digits = sc.replace(/\D/g, '');
    if (digits.length === 6) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
    return sc;
  }

  function formatPaymentRef() {
    const mon = MONTH_NAMES[month - 1].slice(0, 3).toUpperCase();
    return (provider.paymentReferenceFormat || '{SURNAME}-{MON}{YEAR}')
      .replace('{SURNAME}', familySurname.toUpperCase())
      .replace('{MON}', mon)
      .replace('{YEAR}', String(year));
  }

  return (
    <>
      {/* Print trigger — hidden in print output */}
      <div className="no-print flex justify-end mb-4">
        <Button onClick={() => window.print()} variant="outline" size="sm">
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>

      {/* ── Invoice document ── */}
      <div
        id="invoice-print-root"
        className="rounded-xl border bg-white text-gray-900 p-6 space-y-5 print:rounded-none print:border-0 print:p-0"
      >
        {/* Provider header */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">
              {provider.businessName || provider.name || 'Childminder'}
            </h2>
            {provider.name && provider.businessName && (
              <p className="text-sm text-gray-600">{provider.name}</p>
            )}
            {provider.address && (
              <p className="text-sm text-gray-600 whitespace-pre-line">{provider.address}</p>
            )}
            {provider.email && <p className="text-sm text-gray-600">{provider.email}</p>}
            {provider.phone && <p className="text-sm text-gray-600">{provider.phone}</p>}
            {provider.ofstedNumber && (
              <p className="text-xs text-gray-500 mt-1">Ofsted: {provider.ofstedNumber}</p>
            )}
          </div>

          <div className="sm:text-right">
            <p className="font-bold text-xl">INVOICE</p>
            <p className="text-sm text-gray-600">
              {MONTH_NAMES[month - 1]} {year}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Generated: {formatDate(generatedAt.split('T')[0])}
            </p>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* To */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Invoice To
          </p>
          <p className="font-semibold">{parentName}</p>
          <p className="text-sm text-gray-700">{familySurname} family</p>
          {familyAddress && (
            <p className="text-sm text-gray-600 whitespace-pre-line">{familyAddress}</p>
          )}
        </div>

        <Separator className="bg-gray-200" />

        {/* Per-child lines */}
        <div className="space-y-5">
          {perChild.map(line => (
              <div key={line.childId} className="space-y-2">
                <p className="font-semibold text-gray-900 border-b border-gray-100 pb-1">
                  {line.childName}
                </p>

                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>Contract days this month: {line.contractDays}</p>
                  {line.absentDays > 0 && (
                    <p>Absent days: {line.absentDays} (charged as normal)</p>
                  )}
                  {line.closureDaysFunded > 0 && (
                    <p>Closure days (funded): {line.closureDaysFunded}</p>
                  )}
                  {line.closureDaysPrivate > 0 && (
                    <p>Closure days (private): {line.closureDaysPrivate}</p>
                  )}
                </div>

                <table className="w-full text-sm">
                  <tbody>
                    {line.fundedHours > 0 && (
                      <tr className="text-green-800">
                        <td className="py-0.5">
                          Funded hours
                          <span className="ml-1 text-xs text-green-700">(covered by KCC)</span>
                        </td>
                        <td className="text-right whitespace-nowrap">
                          {line.fundedHours}h × {formatCurrency(provider.hourlyRate)}
                        </td>
                        <td className="text-right pl-4 font-medium whitespace-nowrap">
                          {formatCurrency(line.fundedValue)}
                        </td>
                      </tr>
                    )}
                    {line.privateHours > 0 && (
                      <tr>
                        <td className="py-0.5">Private hours</td>
                        <td className="text-right whitespace-nowrap">
                          {line.privateHours}h × {formatCurrency(provider.hourlyRate)}
                        </td>
                        <td className="text-right pl-4 font-medium whitespace-nowrap">
                          {formatCurrency(line.privateTotal)}
                        </td>
                      </tr>
                    )}
                    {line.fundedHours === 0 && line.privateHours === 0 && (
                      <tr>
                        <td colSpan={3} className="text-gray-400 py-0.5 italic">
                          No billable hours (closure days cover full month)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
          ))}
        </div>

        <Separator className="bg-gray-200" />

        {/* Totals */}
        <div className="space-y-2">
          {invoice.totalFundedValue > 0 && (
            <div className="flex justify-between text-sm text-green-800">
              <span>Total KCC funded value</span>
              <span className="font-medium">{formatCurrency(invoice.totalFundedValue)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold">
            <span>Total due from parent</span>
            <span>{formatCurrency(invoice.grandTotal)}</span>
          </div>
        </div>

        {/* Payment details */}
        {(provider.bankAccountName ||
          provider.sortCode ||
          provider.accountNumber) && (
          <>
            <Separator className="bg-gray-200" />
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Payment Details
              </p>
              {provider.bankAccountName && (
                <p className="text-sm">
                  <span className="text-gray-500">Account name:</span>{' '}
                  {provider.bankAccountName}
                </p>
              )}
              {provider.sortCode && (
                <p className="text-sm">
                  <span className="text-gray-500">Sort code:</span>{' '}
                  {formatSortCode(provider.sortCode)}
                </p>
              )}
              {provider.accountNumber && (
                <p className="text-sm">
                  <span className="text-gray-500">Account number:</span>{' '}
                  {provider.accountNumber}
                </p>
              )}
              {provider.paymentReferenceFormat && (
                <p className="text-sm">
                  <span className="text-gray-500">Reference:</span>{' '}
                  <strong>{formatPaymentRef()}</strong>
                </p>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 pt-2">
          Thank you for your continued trust.
        </p>
      </div>
    </>
  );
}
