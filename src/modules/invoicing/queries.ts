import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
import { apiFetch } from '$lib/api/client';
import {
  colFiscalRecordResponseSchema,
  invoicingConfigApiSchema,
  invoicingFormSchema,
  organizationOptions,
  regimeOptions,
  responsabilityOptions,
  colombiaDepartments,
  type ColDocument,
  type InvoicingFormValues,
  type InvoicingConfigApiValues,
} from './schemas';

export function useDocuments(businessDocNumber: string, from: string, to: string, status?: string[]) {
  return createQuery(() => ({
    queryKey: ['documents', businessDocNumber, from, to, status],
    queryFn: async () => {
      const fromISO = new Date(from).toISOString();
      const toISO = new Date(to).toISOString();
      
      let url = `/api/invoicing/colombia/fiscal-record?businessId=${businessDocNumber}&from=${fromISO}&to=${toISO}`;
      if (status && status.length > 0) {
        url += `&status=${status.join(',')}`;
      }
      
      const res = await apiFetch(url);

      const records = colFiscalRecordResponseSchema.array().parse(res);

      return records.map((record) => {
        let docType: ColDocument['documentType'] = 'INVOICE';
        if (record.docType === 'CreditNote') docType = 'CREDIT_NOTE';
        else if (record.docType === 'Pos') docType = 'EQUIVALENT_DOCUMENT';

        let docStatus: ColDocument['documentStatus'] = record.status;

        let totalAmount = 0;
        if (record.taxxaResponse?.response?.jret?.idocumenttotal) {
          totalAmount = record.taxxaResponse.response.jret.idocumenttotal;
        } else if (record.invoiceData?.items) {
          totalAmount = record.invoiceData.items.reduce(
            (sum: number, item: any) => sum + (item.userTotal || 0),
            0,
          );
        }

        return {
          documentType: docType,
          documentStatus: docStatus,
          documentDate: record.invoiceData?.issueDate || record.createdAt,
          documentNumber: record.docNumber || 'Unknown',
          totalAmount,
          providerData: {
            provider: 'taxxa',
            request: record.taxxaRequest,
            response: record.taxxaResponse,
          },
        } as ColDocument;
      });
    },
    enabled: !!businessDocNumber && !!from && !!to,
  }));
}

export function useInvoicingConfig(businessDocNumber: string) {
  return createQuery(() => ({
    queryKey: ['invoicingConfig', businessDocNumber],
    queryFn: async () => {
      try {
        const res = await apiFetch<any>(`/api/invoicing/colombia/config/${businessDocNumber}`);
        // Map API field names → internal form field names
        const mapped = {
          prod: res.prod,
          providerUrl: res.providerUrl ?? res.queryUrl ?? '',
          taxxaEmail: res.user ?? '',
          taxxaPassword: res.password ?? '',
          organization: res.organization ?? { code: '', name: '' },
          regime: res.regime ?? { code: '', name: '' },
          responsability: res.responsability ?? { code: '', name: '' },
          department: res.department ?? { code: '', name: '' },
          province: res.province ?? { code: '', name: '' },
        };
        return invoicingConfigApiSchema.parse(mapped);
      } catch (e: any) {
        if (
          e.status === 404 ||
          e.message?.includes('404') ||
          e.message?.toLowerCase().includes('not found')
        ) {
          return invoicingConfigApiSchema.parse({});
        }
        throw e;
      }
    },
    enabled: !!businessDocNumber,
  }));
}

export function useSaveInvoicingConfig() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({
      businessDocNumber,
      data,
    }: {
      businessDocNumber: string;
      data: InvoicingFormValues;
    }) => {
      // Map form field names → API field names
      const existingConfig = queryClient.getQueryData<InvoicingConfigApiValues>([
        'invoicingConfig',
        businessDocNumber,
      ]);

      // Helper to generate { code, name } objects
      const getCodeName = (
        field: 'organization' | 'regime' | 'responsability' | 'department' | 'province',
        code: string,
        optionsList?: { code: string; name: string }[],
      ) => {
        const existing = existingConfig?.[field];
        if (existing && existing.code === code && existing.name) {
          return existing;
        }
        if (optionsList) {
          const opt = optionsList.find((o) => o.code === code);
          if (opt) return opt;
        }
        if (field === 'department') {
          return { code, name: colombiaDepartments[code] || code };
        }
        return { code, name: code };
      };

      const payload = {
        prod: data.prod,
        providerUrl: data.providerUrl,
        user: data.taxxaEmail,
        password: data.taxxaPassword,
        organization: getCodeName('organization', data.organization, organizationOptions),
        regime: getCodeName('regime', data.regime, regimeOptions),
        responsability: getCodeName('responsability', data.responsability, responsabilityOptions),
        department: getCodeName('department', data.department),
        province: getCodeName('province', data.province),
      };

      return apiFetch(`/api/invoicing/colombia/config/${businessDocNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoicingConfig', variables.businessDocNumber] });
    },
  }));
}

export function useUpdateInvoiceService() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({
      companyId,
      enabled,
      email,
    }: {
      companyId: string;
      enabled: boolean;
      email: string;
    }) => {
      return apiFetch(`/v1/backoffice/company/${companyId}/invoice/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, email }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  }));
}

export function useInvoicingConfigRaw(businessDocNumber: string) {
  return createQuery(() => ({
    queryKey: ['documentConfig', businessDocNumber],
    queryFn: async () => {
      try {
        const res = await apiFetch<any>(`/api/invoicing/colombia/config/${businessDocNumber}`);
        return res?.configByDocument || {};
      } catch (e: any) {
        if (
          e.status === 404 ||
          e.message?.includes('404') ||
          e.message?.toLowerCase().includes('not found')
        ) {
          return {};
        }
        throw e;
      }
    },
    enabled: !!businessDocNumber,
  }));
}

export function useSaveInvoicingConfigForDocuments() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({
      businessDocNumber,
      configByDocument,
    }: {
      businessDocNumber: string;
      configByDocument: any;
    }) => {
      return apiFetch(`/api/invoicing/colombia/config/${businessDocNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configByDocument }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentConfig', variables.businessDocNumber] });
    },
  }));
}
