<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  import { SlidersHorizontal } from '@lucide/svelte';
  import type { createBusinessFilters } from '../filters.svelte';

  let {
    filters,
    countries = [],
    statuses = [],
    docTypes = [],
  }: {
    filters: ReturnType<typeof createBusinessFilters>;
    countries?: { code2: string; value: string }[];
    statuses?: string[];
    docTypes?: string[];
  } = $props();

  // Drawer state management for delayed filters application
  let isDrawerOpen = $state(false);
  let tempStatus = $state<string[]>([]);
  let tempCountry = $state<string[]>([]);
  let tempDocType = $state<string[]>([]);
  let tempInvoiceEnabled = $state<'all' | 'active' | 'inactive'>('all');

  // Copy current active filters to temporary local state when drawer opens
  $effect(() => {
    if (isDrawerOpen) {
      tempStatus = [...filters.state.status];
      tempCountry = [...filters.state.country];
      tempDocType = [...filters.state.docType];
      tempInvoiceEnabled = filters.state.invoiceEnabled;
    }
  });

  function applyFilters() {
    filters.setStatus(tempStatus);
    filters.setCountry(tempCountry);
    filters.setDocType(tempDocType);
    filters.setInvoiceEnabled(tempInvoiceEnabled);
    isDrawerOpen = false;
  }
</script>

<!-- Advanced Filters Drawer (Sheet) -->
<Sheet.Root bind:open={isDrawerOpen}>
  <!-- Responsive Trigger using only one trigger element for flawless Svelte 5 snippet rendering -->
  <Sheet.Trigger
    class="flex items-center gap-2 relative font-semibold text-xs h-9 px-3 md:px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground justify-center w-9 md:w-auto"
  >
    <SlidersHorizontal class="h-3.5 w-3.5" />
    <span class="hidden md:inline">Filtros</span>
    {#if filters.activeFiltersCount > 0}
      <!-- Desktop badge -->
      <Badge
        variant="default"
        class="hidden md:flex ml-1 px-1.5 py-0.5 text-[10px] min-w-5 h-5 items-center justify-center rounded-full font-bold"
      >
        {filters.activeFiltersCount}
      </Badge>
      <!-- Mobile indicator badge -->
      <span
        class="md:hidden absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold border-2 border-background"
      >
        {filters.activeFiltersCount}
      </span>
    {/if}
  </Sheet.Trigger>
  <Sheet.Content
    side="right"
    class="!w-full !max-w-sm p-6 flex flex-col h-full bg-background border-l shadow-lg"
  >
    <Sheet.Header class="mb-6 p-0">
      <Sheet.Title class="flex items-center gap-2 text-xl font-bold">Filtros Avanzados</Sheet.Title>
      <Sheet.Description>
        Ajusta los parámetros para segmentar la lista de negocios asociados.
      </Sheet.Description>
    </Sheet.Header>

    <!-- Drawer content (scrollable) -->
    <div class="flex-1 overflow-y-auto space-y-6 py-2 my-2">
      <!-- Country filter -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">País</h4>
        {#if countries.length === 0}
          <p class="text-xs text-muted-foreground">Cargando países...</p>
        {:else}
          <div class="flex flex-col gap-3.5 pl-1">
            {#each countries as country}
              <div class="flex items-center space-x-2.5">
                <Checkbox
                  id={`country-${country.code2}`}
                  checked={tempCountry.includes(country.code2)}
                  onCheckedChange={(checked: any) => {
                    if (checked) {
                      tempCountry = [...tempCountry, country.code2];
                    } else {
                      tempCountry = tempCountry.filter((x) => x !== country.code2);
                    }
                  }}
                />
                <label
                  for={`country-${country.code2}`}
                  class="text-sm font-medium leading-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none"
                >
                  {country.value}
                </label>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <Separator />

      <!-- Status filter -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</h4>
        {#if statuses.length === 0}
          <p class="text-xs text-muted-foreground">Cargando estados...</p>
        {:else}
          <div class="flex flex-col gap-3.5 pl-1">
            {#each statuses as status}
              <div class="flex items-center space-x-2.5">
                <Checkbox
                  id={`status-${status}`}
                  checked={tempStatus.includes(status)}
                  onCheckedChange={(checked: any) => {
                    if (checked) {
                      tempStatus = [...tempStatus, status];
                    } else {
                      tempStatus = tempStatus.filter((x) => x !== status);
                    }
                  }}
                />
                <label
                  for={`status-${status}`}
                  class="text-sm font-medium leading-none cursor-pointer capitalize text-muted-foreground hover:text-foreground transition-colors select-none"
                >
                  {status}
                </label>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <Separator />

      <!-- Document Type filter -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Tipo de Documento
        </h4>
        {#if docTypes.length === 0}
          <p class="text-xs text-muted-foreground">Cargando tipos de documento...</p>
        {:else}
          <div class="flex flex-col gap-3.5 pl-1">
            {#each docTypes as docType}
              <div class="flex items-center space-x-2.5">
                <Checkbox
                  id={`docType-${docType}`}
                  checked={tempDocType.includes(docType)}
                  onCheckedChange={(checked: any) => {
                    if (checked) {
                      tempDocType = [...tempDocType, docType];
                    } else {
                      tempDocType = tempDocType.filter((x) => x !== docType);
                    }
                  }}
                />
                <label
                  for={`docType-${docType}`}
                  class="text-sm font-medium leading-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none"
                >
                  {docType}
                </label>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <Separator />

      <!-- Electronic Invoicing filter -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Facturación Electrónica
        </h4>
        <div class="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg border border-border/50">
          <button
            type="button"
            class="text-xs py-2 rounded-md font-semibold transition-all {tempInvoiceEnabled ===
            'all'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'}"
            onclick={() => (tempInvoiceEnabled = 'all')}
          >
            Todos
          </button>
          <button
            type="button"
            class="text-xs py-2 rounded-md font-semibold transition-all {tempInvoiceEnabled ===
            'active'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'}"
            onclick={() => (tempInvoiceEnabled = 'active')}
          >
            Activa
          </button>
          <button
            type="button"
            class="text-xs py-2 rounded-md font-semibold transition-all {tempInvoiceEnabled ===
            'inactive'
              ? 'bg-background shadow text-foreground'
              : 'text-muted-foreground hover:text-foreground'}"
            onclick={() => (tempInvoiceEnabled = 'inactive')}
          >
            Inactiva
          </button>
        </div>
      </div>
    </div>

    <Sheet.Footer class="mt-auto p-0 pt-6 border-t flex flex-col sm:flex-row gap-3">
      <Sheet.Close class="w-full sm:flex-1">
        <Button variant="outline" class="w-full">Cancelar</Button>
      </Sheet.Close>
      <Button class="w-full sm:flex-1 font-semibold" onclick={applyFilters}>Aplicar filtros</Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
