<script lang="ts">
  import { useBusinesses } from '$modules/businesses/queries';
  import { createBusinessFilters } from '$modules/businesses/filters.svelte';
  import BusinessTable from '$modules/businesses/components/BusinessTable.svelte';
  import BusinessFiltersDrawer from '$modules/businesses/components/BusinessFiltersDrawer.svelte';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { CircleAlert, RotateCcw } from '@lucide/svelte';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';

  const businessesQuery = useBusinesses();
  const filters = createBusinessFilters();

  // Dynamically compute unique options from the data for maximum reliability
  let countries = $derived.by(() => {
    const map = new Map<string, string>();
    for (const b of businessesQuery.data || []) {
      if (b.country?.code2) map.set(b.country.code2, b.country.value);
    }
    return Array.from(map.entries()).map(([code2, value]) => ({ code2, value }));
  });

  let statuses = $derived.by(() => {
    const set = new Set<string>();
    for (const b of businessesQuery.data || []) {
      if (b.status) set.add(b.status);
    }
    return Array.from(set);
  });

  let docTypes = $derived.by(() => {
    const set = new Set<string>();
    for (const b of businessesQuery.data || []) {
      if (b.docTypeDescription) set.add(b.docTypeDescription);
    }
    return Array.from(set);
  });
</script>

<svelte:head>
  <title>Negocios — VentySfy Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col p-6 space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Negocios</h1>
    <p class="text-sm text-muted-foreground">Gestiona los negocios asociados a VentySfy.</p>
  </div>

  <div class="flex items-center justify-between gap-4">
    <div class="flex-1 max-w-sm">
      <Input
        placeholder="Buscar negocio..."
        value={filters.state.search}
        oninput={(e: any) => filters.setSearch(e.currentTarget.value)}
      />
    </div>

    <div class="flex items-center gap-2">
      <!-- Reset button (Visible only when filters are active) -->
      {#if filters.activeFiltersCount > 0}
        <!-- Desktop view -->
        <Button
          variant="ghost"
          class="hidden md:inline-flex text-muted-foreground hover:text-foreground transition-colors gap-1.5 font-semibold text-xs animate-in fade-in slide-in-from-right-1 duration-200"
          onclick={() => filters.reset()}
        >
          <RotateCcw class="h-3.5 w-3.5" />
          Restablecer
        </Button>
        <!-- Mobile view -->
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

      <!-- Advanced Filters Drawer -->
      <BusinessFiltersDrawer {filters} {countries} {statuses} {docTypes} />
    </div>
  </div>

  {#if businessesQuery.isPending}
    <div class="space-y-4">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-24 w-full" />
    </div>
  {:else if businessesQuery.isError}
    <Alert variant="destructive">
      <CircleAlert class="h-4 w-4" />
      <AlertDescription>
        Ocurrió un error al cargar los negocios. Por favor intente de nuevo.
      </AlertDescription>
    </Alert>
  {:else if businessesQuery.data}
    <BusinessTable
      data={businessesQuery.data || []}
      filterSearch={filters.state.search}
      filterStatus={filters.state.status}
      filterCountry={filters.state.country}
      filterDocType={filters.state.docType}
      filterInvoiceEnabled={filters.state.invoiceEnabled}
    />
  {/if}
</div>
