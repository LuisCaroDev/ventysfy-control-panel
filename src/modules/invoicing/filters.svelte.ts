import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { untrack } from 'svelte';
import { format, subDays } from 'date-fns';

export interface InvoicesFiltersState {
  search: string;
  status: string[];
  fromDate: string;
  toDate: string;
}

export function createInvoicesFilters() {
  const STORAGE_KEY = 'invoices-filters';

  function getFallbackFrom() {
    return format(subDays(new Date(), 30), 'yyyy-MM-dd');
  }

  function getFallbackTo() {
    return format(new Date(), 'yyyy-MM-dd');
  }

  function readInitial(): InvoicesFiltersState {
    if (typeof window === 'undefined') {
      return {
        search: '',
        status: [],
        fromDate: getFallbackFrom(),
        toDate: getFallbackTo(),
      };
    }
    const params = get(page).url.searchParams;
    
    // We try to read from stored local storage, but prioritizing URL params if they exist
    let stored: Partial<InvoicesFiltersState> = {};
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      // Ignored
    }

    return {
      search: params.get('q') ?? stored.search ?? '',
      status: params.get('status')?.split(',').filter(Boolean) ?? stored.status ?? [],
      fromDate: params.get('from') ?? stored.fromDate ?? getFallbackFrom(),
      toDate: params.get('to') ?? stored.toDate ?? getFallbackTo(),
    };
  }

  let state = $state<InvoicesFiltersState>(readInitial());

  // Sincroniza estado -> URL + localStorage
  $effect(() => {
    const currentState = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch {
      // Ignored
    }

    untrack(() => {
      const currentUrl = get(page).url;
      const params = new URLSearchParams(currentUrl.searchParams);

      if (currentState.search) params.set('q', currentState.search);
      else params.delete('q');

      if (currentState.status.length) params.set('status', currentState.status.join(','));
      else params.delete('status');

      if (currentState.fromDate) params.set('from', currentState.fromDate);
      else params.delete('from');

      if (currentState.toDate) params.set('to', currentState.toDate);
      else params.delete('to');

      const query = params.toString();
      const newUrl = `${currentUrl.pathname}${query ? '?' + query : ''}`;

      if (currentUrl.search !== (query ? '?' + query : '')) {
        goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true });
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
      if (state.search) count++;
      
      const defaultFrom = getFallbackFrom();
      const defaultTo = getFallbackTo();
      if (state.fromDate !== defaultFrom || state.toDate !== defaultTo) {
        count++;
      }
      return count;
    },
    setSearch: (s: string) => {
      state.search = s;
    },
    setStatus: (s: string[]) => {
      state.status = s;
    },
    setDates: (from: string, to: string) => {
      state.fromDate = from;
      state.toDate = to;
    },
    reset: () => {
      state = {
        search: '',
        status: [],
        fromDate: getFallbackFrom(),
        toDate: getFallbackTo(),
      };
    },
  };
}
