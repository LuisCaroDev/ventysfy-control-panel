import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { untrack } from 'svelte';

export interface UsersFiltersState {
  search: string;
  companyId: string;
  accountStatus: string;
}

export function createUserFilters() {
  const STORAGE_KEY = 'users-filters';

  function readInitial(): UsersFiltersState {
    if (typeof window === 'undefined') {
      return { search: '', companyId: '', accountStatus: '' };
    }

    const params = get(page).url.searchParams;
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    return {
      search: params.get('q') ?? stored.search ?? '',
      companyId: params.get('companyId') ?? stored.companyId ?? '',
      accountStatus: params.get('accountStatus') ?? stored.accountStatus ?? '',
    };
  }

  let state = $state<UsersFiltersState>(readInitial());

  $effect(() => {
    const currentState = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));

    untrack(() => {
      const currentUrl = get(page).url;
      const params = new URLSearchParams(currentUrl.searchParams);

      if (currentState.search) params.set('q', currentState.search);
      else params.delete('q');

      if (currentState.companyId) params.set('companyId', currentState.companyId);
      else params.delete('companyId');

      if (currentState.accountStatus) params.set('accountStatus', currentState.accountStatus);
      else params.delete('accountStatus');

      const query = params.toString();
      const newUrl = `${currentUrl.pathname}${query ? '?' + query : ''}`;

      if (currentUrl.search !== (query ? `?${query}` : '')) {
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
      if (state.companyId) count++;
      if (state.accountStatus) count++;
      return count;
    },
    setSearch: (search: string) => {
      state.search = search;
    },
    setCompanyId: (companyId: string) => {
      state.companyId = companyId;
    },
    setAccountStatus: (accountStatus: string) => {
      state.accountStatus = accountStatus;
    },
    reset: () => {
      state = { search: '', companyId: '', accountStatus: '' };
    },
  };
}
