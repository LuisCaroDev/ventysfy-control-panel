<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import { Badge } from '$lib/components/ui/badge';
  import { SlidersHorizontal } from '@lucide/svelte';
  import type { createUserFilters } from '../filters.svelte';
  import type { UserFiltersForm } from '../schemas';
  import UserFiltersDrawerForm from './UserFiltersDrawerForm.svelte';

  let {
    filters,
    companies = [],
    statuses = [],
  }: {
    filters: ReturnType<typeof createUserFilters>;
    companies?: { id: string; label: string }[];
    statuses?: { value: UserFiltersForm['accountStatus']; label: string }[];
  } = $props();

  let isDrawerOpen = $state(false);
</script>

<Sheet.Root bind:open={isDrawerOpen}>
  <Sheet.Trigger
    class="flex items-center gap-2 relative font-semibold text-xs h-9 px-3 md:px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground justify-center w-9 md:w-auto"
  >
    <SlidersHorizontal class="h-3.5 w-3.5" />
    <span class="hidden md:inline">Filtros</span>
    {#if filters.activeFiltersCount > 0}
      <Badge
        variant="default"
        class="hidden md:flex ml-1 px-1.5 py-0.5 text-[10px] min-w-5 h-5 items-center justify-center rounded-full font-bold"
      >
        {filters.activeFiltersCount}
      </Badge>
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
        Ajusta los parámetros para segmentar la lista de usuarios.
      </Sheet.Description>
    </Sheet.Header>

    {#if isDrawerOpen}
      <UserFiltersDrawerForm
        {filters}
        {companies}
        {statuses}
        onApplied={() => {
          isDrawerOpen = false;
        }}
      />
    {/if}
  </Sheet.Content>
</Sheet.Root>
