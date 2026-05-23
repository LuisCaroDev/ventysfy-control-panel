<script lang="ts">
  import { defaults, superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { Button } from '$lib/components/ui/button';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Separator } from '$lib/components/ui/separator';
  import * as Sheet from '$lib/components/ui/sheet';
  import { businessFiltersSchema, type BusinessFiltersForm } from '$modules/businesses/schemas';
  import type { createBusinessFilters } from '../filters.svelte';

  let {
    filters,
    countries = [],
    statuses = [],
    docTypes = [],
    onApplied,
  }: {
    filters: ReturnType<typeof createBusinessFilters>;
    countries?: { code2: string; value: string }[];
    statuses?: string[];
    docTypes?: string[];
    onApplied: () => void;
  } = $props();

  function createInitialValues(): BusinessFiltersForm {
    return {
      status: [...filters.state.status],
      country: [...filters.state.country],
      docType: [...filters.state.docType],
      invoiceEnabled: filters.state.invoiceEnabled,
    };
  }

  const initialForm = defaults(createInitialValues(), zod4Client(businessFiltersSchema));
  const { form, validateForm } = superForm(initialForm, {
    validators: zod4Client(businessFiltersSchema),
    SPA: true,
    validationMethod: 'onsubmit',
  });

  function toggleArrayValue(
    field: keyof Pick<BusinessFiltersForm, 'status' | 'country' | 'docType'>,
    value: string,
    checked: boolean,
  ) {
    form.update((current) => {
      const values = current[field];
      return {
        ...current,
        [field]: checked ? [...values, value] : values.filter((item) => item !== value),
      };
    });
  }

  async function applyFilters() {
    const result = await validateForm({ update: true });

    if (!result.valid) return;

    filters.setStatus(result.data.status);
    filters.setCountry(result.data.country);
    filters.setDocType(result.data.docType);
    filters.setInvoiceEnabled(result.data.invoiceEnabled);
    onApplied();
  }
</script>

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
              checked={$form.country.includes(country.code2)}
              onCheckedChange={(checked: boolean) =>
                toggleArrayValue('country', country.code2, checked === true)}
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
              checked={$form.status.includes(status)}
              onCheckedChange={(checked: boolean) =>
                toggleArrayValue('status', status, checked === true)}
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
              checked={$form.docType.includes(docType)}
              onCheckedChange={(checked: boolean) =>
                toggleArrayValue('docType', docType, checked === true)}
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
        class="text-xs py-2 rounded-md font-semibold transition-all {$form.invoiceEnabled === 'all'
          ? 'bg-background shadow text-foreground'
          : 'text-muted-foreground hover:text-foreground'}"
        onclick={() => form.update((current) => ({ ...current, invoiceEnabled: 'all' }))}
      >
        Todos
      </button>
      <button
        type="button"
        class="text-xs py-2 rounded-md font-semibold transition-all {$form.invoiceEnabled ===
        'active'
          ? 'bg-background shadow text-foreground'
          : 'text-muted-foreground hover:text-foreground'}"
        onclick={() => form.update((current) => ({ ...current, invoiceEnabled: 'active' }))}
      >
        Activa
      </button>
      <button
        type="button"
        class="text-xs py-2 rounded-md font-semibold transition-all {$form.invoiceEnabled ===
        'inactive'
          ? 'bg-background shadow text-foreground'
          : 'text-muted-foreground hover:text-foreground'}"
        onclick={() => form.update((current) => ({ ...current, invoiceEnabled: 'inactive' }))}
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
