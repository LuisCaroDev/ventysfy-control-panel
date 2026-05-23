<script lang="ts">
  import { defaults, superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';
  import * as Sheet from '$lib/components/ui/sheet';
  import * as Select from '$lib/components/ui/select';
  import * as Popover from '$lib/components/ui/popover';
  import * as Command from '$lib/components/ui/command';
  import { userFiltersSchema, type UserFiltersForm } from '$modules/users/schemas';
  import type { createUserFilters } from '../filters.svelte';
  import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
  import Check from '@lucide/svelte/icons/check';
  import { cn } from '$lib/utils';

  const ALL_COMPANIES = '__all_companies__';
  const ALL_STATUSES = '__all_statuses__';
  let companyComboboxOpen = $state(false);

  let {
    filters,
    companies = [],
    statuses = [],
    onApplied,
  }: {
    filters: ReturnType<typeof createUserFilters>;
    companies?: { id: string; label: string }[];
    statuses?: { value: string; label: string }[];
    onApplied: () => void;
  } = $props();

  function createInitialValues(): UserFiltersForm {
    return {
      companyId: filters.state.companyId || ALL_COMPANIES,
      accountStatus: filters.state.accountStatus || ALL_STATUSES,
    };
  }

  const initialForm = defaults(createInitialValues(), zod4Client(userFiltersSchema));
  const { form, validateForm } = superForm(initialForm, {
    validators: zod4Client(userFiltersSchema),
    SPA: true,
    validationMethod: 'onsubmit',
  });

  const selectedCompanyLabel = $derived(
    $form.companyId === ALL_COMPANIES
      ? 'Todas las compañías'
      : (companies.find((company) => company.id === $form.companyId)?.label ??
          'Todas las compañías'),
  );

  const selectedStatusLabel = $derived(
    $form.accountStatus === ALL_STATUSES
      ? 'Todos los estados'
      : (statuses.find((status) => status.value === $form.accountStatus)?.label ??
          'Todos los estados'),
  );

  async function applyFilters() {
    const result = await validateForm({ update: true });
    if (!result.valid) return;

    filters.setCompanyId(result.data.companyId === ALL_COMPANIES ? '' : result.data.companyId);
    filters.setAccountStatus(
      result.data.accountStatus === ALL_STATUSES ? '' : result.data.accountStatus,
    );
    onApplied();
  }
</script>

<div class="flex-1 overflow-y-auto space-y-6 py-2 my-2">
  <div class="space-y-3">
    <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compañía</h4>
    <Popover.Root bind:open={companyComboboxOpen}>
      <Popover.Trigger>
        {#snippet child({ props })}
          {@const { class: triggerClass, ...triggerProps } = props}
          <Button
            variant="outline"
            class={cn(
              'w-full justify-between font-normal',
              $form.companyId === ALL_COMPANIES && 'text-muted-foreground',
            )}
            {...triggerProps}
          >
            <span class="truncate">{selectedCompanyLabel}</span>
            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content class="w-[--bits-popover-anchor-width] p-0" align="start">
        <Command.Root>
          <Command.Input placeholder="Buscar compañía..." />
          <Command.List>
            <Command.Empty class="px-2 py-3 text-sm text-muted-foreground">
              No se encontraron compañías.
            </Command.Empty>
            <Command.Item
              value="Todas las compañías"
              onSelect={() => {
                form.update((current) => ({ ...current, companyId: ALL_COMPANIES }));
                companyComboboxOpen = false;
              }}
            >
              <span>Todas las compañías</span>
              <Check
                class={cn(
                  'ml-auto h-4 w-4',
                  $form.companyId === ALL_COMPANIES ? 'opacity-100' : 'opacity-0',
                )}
              />
            </Command.Item>
            {#each companies as company}
              <Command.Item
                value={company.label}
                onSelect={() => {
                  form.update((current) => ({ ...current, companyId: company.id }));
                  companyComboboxOpen = false;
                }}
              >
                <span class="truncate">{company.label}</span>
                <Check
                  class={cn(
                    'ml-auto h-4 w-4',
                    $form.companyId === company.id ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </Command.Item>
            {/each}
          </Command.List>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
  </div>

  <Separator />

  <div class="space-y-3">
    <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      Estado de cuenta
    </h4>
    <Select.Root type="single" bind:value={$form.accountStatus}>
      <Select.Trigger class={cn('w-full', !$form.accountStatus && 'text-muted-foreground')}>
        {selectedStatusLabel}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={ALL_STATUSES}>Todos los estados</Select.Item>
        {#each statuses as status}
          <Select.Item value={status.value}>{status.label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
</div>

<Sheet.Footer class="mt-auto p-0 pt-6 border-t flex flex-col sm:flex-row gap-3">
  <Sheet.Close class="w-full sm:flex-1">
    <Button variant="outline" class="w-full">Cancelar</Button>
  </Sheet.Close>
  <Button class="w-full sm:flex-1 font-semibold" onclick={applyFilters}>Aplicar filtros</Button>
</Sheet.Footer>
