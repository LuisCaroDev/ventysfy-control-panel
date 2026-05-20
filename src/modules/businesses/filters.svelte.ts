import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { untrack } from 'svelte';

export interface BusinessesFiltersState {
  search: string;
  status: string[];
  country: string[];
  docType: string[];
  invoiceEnabled: 'all' | 'active' | 'inactive';
}

export function createBusinessFilters() {
  const STORAGE_KEY = 'businesses-filters';

  function readInitial(): BusinessesFiltersState {
    if (typeof window === 'undefined') {
      return { search: '', status: [], country: [], docType: [], invoiceEnabled: 'all' };
    }
    const params = get(page).url.searchParams;
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    return {
      search: params.get('q') ?? stored.search ?? '',
      status: params.get('status')?.split(',').filter(Boolean) ?? stored.status ?? [],
      country: params.get('country')?.split(',').filter(Boolean) ?? stored.country ?? [],
      docType: params.get('docType')?.split(',').filter(Boolean) ?? stored.docType ?? [],
      invoiceEnabled: (params.get('invoiceEnabled') as any) ?? stored.invoiceEnabled ?? 'all',
    };
  }

  let state = $state<BusinessesFiltersState>(readInitial());

  // Sincroniza estado -> URL + localStorage
  $effect(() => {
    const currentState = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));

    untrack(() => {
      const currentUrl = get(page).url;
      const params = new URLSearchParams(currentUrl.searchParams);

      if (currentState.search) params.set('q', currentState.search);
      else params.delete('q');

      if (currentState.status.length) params.set('status', currentState.status.join(','));
      else params.delete('status');

      if (currentState.country.length) params.set('country', currentState.country.join(','));
      else params.delete('country');

      if (currentState.docType.length) params.set('docType', currentState.docType.join(','));
      else params.delete('docType');

      if (currentState.invoiceEnabled !== 'all') {
        params.set('invoiceEnabled', currentState.invoiceEnabled);
      } else {
        params.delete('invoiceEnabled');
      }

      const query = params.toString();
      const newUrl = `${currentUrl.pathname}${query ? '?' + query : ''}`;

      if (currentUrl.search !== (query ? '?' + query : '')) {
        goto(newUrl, { replaceState: true, keepFocus: true });
      }
    });
  });

  return {
    get state() {
      return state;
    },
    get activeFiltersCount() {
      let count = 0;
      if (state.status.length) count++;
      if (state.country.length) count++;
      if (state.docType.length) count++;
      if (state.invoiceEnabled !== 'all') count++;
      return count;
    },
    setSearch: (s: string) => {
      state.search = s;
    },
    setStatus: (s: string[]) => {
      state.status = s;
    },
    setCountry: (c: string[]) => {
      state.country = c;
    },
    setDocType: (d: string[]) => {
      state.docType = d;
    },
    setInvoiceEnabled: (ie: 'all' | 'active' | 'inactive') => {
      state.invoiceEnabled = ie;
    },
    reset: () => {
      state = { search: '', status: [], country: [], docType: [], invoiceEnabled: 'all' };
    },
  };
}
