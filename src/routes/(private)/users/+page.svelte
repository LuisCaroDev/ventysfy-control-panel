<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { CircleAlert, RotateCcw } from '@lucide/svelte';
  import { useBusinesses } from '$modules/businesses/queries';
  import { createUserFilters } from '$modules/users/filters.svelte';
  import { useUsers } from '$modules/users/queries';
  import UserTable from '$modules/users/components/UserTable.svelte';
  import UserFiltersDrawer from '$modules/users/components/UserFiltersDrawer.svelte';
  import { USER_ACCOUNT_STATUS } from '$modules/users/schemas';

  const filters = createUserFilters();
  const businessesQuery = useBusinesses();

  let debouncedSearch = $state(filters.state.search);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    const search = filters.state.search;

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      debouncedSearch = search;
    }, 300);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  });

  const usersQuery = useUsers({
    get search() {
      return debouncedSearch;
    },
    get companyId() {
      return filters.state.companyId;
    },
    get accountStatus() {
      return filters.state.accountStatus;
    },
  });

  let companies = $derived.by(() => {
    const map = new Map<string, string>();
    for (const business of businessesQuery.data || []) {
      if (!business.id) continue;
      map.set(business.id, business.tradeName || business.companyName);
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  });

  const statusLabels: Record<string, string> = {
    without_account: 'Sin cuenta',
    active: 'Activa',
    locked: 'Bloqueada',
    suspended: 'Suspendida',
    pending: 'Pendiente',
    deleted: 'Eliminada',
    unknown: 'Desconocido',
  };

  let statuses = $derived(
    USER_ACCOUNT_STATUS.map((value) => ({
      value,
      label: statusLabels[value],
    })),
  );
</script>

<svelte:head>
  <title>Usuarios — VentySfy Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col p-6 space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Usuarios</h1>
    <p class="text-sm text-muted-foreground">
      Gestiona los accesos de usuarios asociados a las compañías.
    </p>
  </div>

  <div class="flex items-center justify-between gap-4">
    <div class="flex-1 max-w-sm">
      <Input
        placeholder="Buscar usuario por nombre o correo..."
        value={filters.state.search}
        oninput={(e: Event) => filters.setSearch((e.currentTarget as HTMLInputElement).value)}
      />
    </div>

    <div class="flex items-center gap-2">
      {#if filters.activeFiltersCount > 0}
        <Button
          variant="ghost"
          class="hidden md:inline-flex text-muted-foreground hover:text-foreground transition-colors gap-1.5 font-semibold text-xs animate-in fade-in slide-in-from-right-1 duration-200"
          onclick={() => filters.reset()}
        >
          <RotateCcw class="h-3.5 w-3.5" />
          Restablecer
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden text-muted-foreground hover:text-foreground animate-in fade-in duration-200"
          onclick={() => filters.reset()}
          title="Restablecer filtros"
        >
          <RotateCcw class="h-4 w-4" />
        </Button>
      {/if}

      <UserFiltersDrawer {filters} {companies} {statuses} />
    </div>
  </div>

  {#if usersQuery.isPending}
    <div class="space-y-4">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-24 w-full" />
    </div>
  {:else if usersQuery.isError}
    <Alert variant="destructive">
      <CircleAlert class="h-4 w-4" />
      <AlertDescription>
        Ocurrió un error al cargar los usuarios. Por favor intente de nuevo.
      </AlertDescription>
    </Alert>
  {:else if usersQuery.data}
    <UserTable data={usersQuery.data || []} />
  {/if}
</div>
