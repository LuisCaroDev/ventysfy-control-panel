<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  import { Label } from '$lib/components/ui/label';
  import { SlidersHorizontal } from '@lucide/svelte';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import Calendar from '$lib/components/ui/calendar/calendar.svelte';
  import * as Popover from '$lib/components/ui/popover';
  import { getLocalTimeZone, parseDate, type CalendarDate } from '@internationalized/date';
  import type { createInvoicesFilters } from '../filters.svelte';

  let {
    filters,
    statuses = [],
  }: {
    filters: ReturnType<typeof createInvoicesFilters>;
    statuses?: string[];
  } = $props();

  let isDrawerOpen = $state(false);
  let tempStatus = $state<string[]>([]);

  let tempFromDate = $state<CalendarDate | undefined>();
  let tempToDate = $state<CalendarDate | undefined>();

  let fromPopoverOpen = $state(false);
  let toPopoverOpen = $state(false);

  // Synchronize state when opening the drawer
  $effect(() => {
    if (isDrawerOpen) {
      tempStatus = [...filters.state.status];
      try {
        tempFromDate = filters.state.fromDate ? parseDate(filters.state.fromDate) : undefined;
      } catch {
        tempFromDate = undefined;
      }
      try {
        tempToDate = filters.state.toDate ? parseDate(filters.state.toDate) : undefined;
      } catch {
        tempToDate = undefined;
      }
    }
  });

  const statusTranslations: Record<string, string> = {
    approved: 'Aceptado',
    rejected: 'Rechazado',
    contingency_dian: 'Contingencia DIAN',
    contingency_taxxa: 'Contingencia Taxxa',
    unknown: 'Desconocido',
  };

  function translateStatus(status: string) {
    return statusTranslations[status] || status;
  }

  function calendarDateToString(val: CalendarDate | undefined): string {
    if (!val) return '';
    const day = String(val.day).padStart(2, '0');
    const month = String(val.month).padStart(2, '0');
    const year = val.year;
    return `${year}-${month}-${day}`;
  }

  function applyFilters() {
    filters.setStatus(tempStatus);
    filters.setDates(calendarDateToString(tempFromDate), calendarDateToString(tempToDate));
    isDrawerOpen = false;
  }

  function resetLocalFilters() {
    filters.reset();
    tempStatus = [];
    try {
      tempFromDate = filters.state.fromDate ? parseDate(filters.state.fromDate) : undefined;
    } catch {
      tempFromDate = undefined;
    }
    try {
      tempToDate = filters.state.toDate ? parseDate(filters.state.toDate) : undefined;
    } catch {
      tempToDate = undefined;
    }
    isDrawerOpen = false;
  }
</script>

<Sheet.Root bind:open={isDrawerOpen}>
  <Sheet.Trigger
    class="flex items-center gap-2 relative font-semibold text-xs h-9 px-3 md:px-4 rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground justify-center w-9 md:w-auto"
  >
    <SlidersHorizontal class="h-3.5 w-3.5" />
    <span class="hidden md:inline">Filtros</span>
    {#if filters.activeFiltersCount > 0}
      <Badge
        variant="default"
        class="hidden md:flex ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold"
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
    class="w-full sm:max-w-md flex flex-col h-full bg-background border-l shadow-lg"
  >
    <Sheet.Header class="px-6 pt-6">
      <Sheet.Title class="flex items-center gap-2 text-xl font-bold">Filtros Avanzados</Sheet.Title>
      <Sheet.Description class="text-xs text-muted-foreground">
        Ajusta los parámetros para segmentar el historial de documentos.
      </Sheet.Description>
    </Sheet.Header>

    <div class="px-6 py-4">
      <Separator />
    </div>

    <div class="flex-1 overflow-y-auto space-y-6 px-6">
      <!-- Date Range Option -->
      <div class="space-y-3.5">
        <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Rango de Fechas
        </h4>
        <div class="grid grid-cols-2 gap-4 pl-1">
          <div class="space-y-1.5 flex flex-col">
            <Label for="filter-from-date" class="text-xs font-medium text-muted-foreground"
              >Desde</Label
            >
            <Popover.Root bind:open={fromPopoverOpen}>
              <Popover.Trigger id="filter-from-date">
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="outline"
                    class="w-full justify-between font-normal text-xs h-9 rounded-xl px-3 border-input bg-background hover:bg-accent {!tempFromDate
                      ? 'text-muted-foreground'
                      : ''}"
                  >
                    {tempFromDate
                      ? tempFromDate.toDate(getLocalTimeZone()).toLocaleDateString()
                      : 'Seleccionar'}
                    <ChevronDownIcon class="h-3.5 w-3.5 opacity-50 shrink-0" />
                  </Button>
                {/snippet}
              </Popover.Trigger>
              <Popover.Content class="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  type="single"
                  bind:value={tempFromDate}
                  captionLayout="dropdown"
                  onValueChange={() => {
                    fromPopoverOpen = false;
                  }}
                />
              </Popover.Content>
            </Popover.Root>
          </div>

          <div class="space-y-1.5 flex flex-col">
            <Label for="filter-to-date" class="text-xs font-medium text-muted-foreground"
              >Hasta</Label
            >
            <Popover.Root bind:open={toPopoverOpen}>
              <Popover.Trigger id="filter-to-date">
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="outline"
                    class="w-full justify-between font-normal text-xs h-9 rounded-xl px-3 border-input bg-background hover:bg-accent {!tempToDate
                      ? 'text-muted-foreground'
                      : ''}"
                  >
                    {tempToDate
                      ? tempToDate.toDate(getLocalTimeZone()).toLocaleDateString()
                      : 'Seleccionar'}
                    <ChevronDownIcon class="h-3.5 w-3.5 opacity-50 shrink-0" />
                  </Button>
                {/snippet}
              </Popover.Trigger>
              <Popover.Content class="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  type="single"
                  bind:value={tempToDate}
                  captionLayout="dropdown"
                  onValueChange={() => {
                    toPopoverOpen = false;
                  }}
                />
              </Popover.Content>
            </Popover.Root>
          </div>
        </div>
      </div>

      <!-- Status Option List -->
      {#if statuses.length > 0}
        <div class="space-y-3.5">
          <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Estado DIAN
          </h4>
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
                  class="text-sm font-medium leading-none cursor-pointer capitalize text-muted-foreground select-none"
                >
                  {translateStatus(status)}
                </label>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <div class="px-6 py-4">
      <Separator />
    </div>

    <Sheet.Footer class="p-6 pt-2 flex flex-col sm:flex-row gap-3 mt-auto border-t bg-muted/10">
      <Button
        variant="outline"
        class="w-full sm:flex-1 font-semibold text-xs h-9 rounded-xl"
        onclick={resetLocalFilters}
      >
        Limpiar Filtros
      </Button>
      <Button class="w-full sm:flex-1 font-semibold text-xs h-9 rounded-xl" onclick={applyFilters}>
        Aplicar Filtros
      </Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
