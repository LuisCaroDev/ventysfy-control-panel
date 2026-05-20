# Skill: Creación de Tablas Filtrables en Svelte 5

Esta guía define el estándar de arquitectura y diseño para crear vistas de listados de datos interactivos con tablas responsivas, cajones de filtros avanzados (con confirmación retardada/draft), barra de búsqueda, restablecimiento de filtros e integración con URL search params.

---

## 1. Arquitectura del Módulo

Al estructurar una nueva sección de listado (ej. `users`, `products`), divide el código en los siguientes 4 archivos dentro de tu carpeta de módulo:

```
src/
└── modules/
    └── [module-name]/
        ├── components/
        │   ├── [Entity]Table.svelte         # Vista de Tabla (Desktop) y Tarjetas (Mobile)
        │   └── [Entity]FiltersDrawer.svelte # Drawer con filtros en modo borrador
        ├── filters.svelte.ts                # Store reactiva y sincronización con URL
        └── schemas.ts                       # Tipos de TypeScript e interfaces Zod
```

---

## 2. Store Reactiva y Sincronización con URL (`filters.svelte.ts`)

La store de filtros debe persistir en los parámetros de búsqueda de la URL (`searchParams`) y, opcionalmente, en `localStorage` como fallback. Debe usar las Svelte 5 Runes (`$state`, `$effect`) y actualizar el navegador de forma silenciosa.

### Estructura Recomendada

```typescript
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { untrack } from 'svelte';

export interface EntityFiltersState {
  search: string;
  status: string[];
  category: string[];
}

export function createEntityFilters() {
  const STORAGE_KEY = 'entity-filters';

  function readInitial(): EntityFiltersState {
    if (typeof window === 'undefined') {
      return { search: '', status: [], category: [] };
    }
    const params = get(page).url.searchParams;
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    return {
      search: params.get('q') ?? stored.search ?? '',
      status: params.get('status')?.split(',').filter(Boolean) ?? stored.status ?? [],
      category: params.get('category')?.split(',').filter(Boolean) ?? stored.category ?? [],
    };
  }

  let state = $state<EntityFiltersState>(readInitial());

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

      if (currentState.category.length) params.set('category', currentState.category.join(','));
      else params.delete('category');

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
      if (state.category.length) count++;
      return count;
    },
    setSearch: (s: string) => {
      state.search = s;
    },
    setStatus: (s: string[]) => {
      state.status = s;
    },
    setCategory: (c: string[]) => {
      state.category = c;
    },
    reset: () => {
      state = { search: '', status: [], category: [] };
    },
  };
}
```

---

## 3. Cajón de Filtros en Modo Borrador (`[Entity]FiltersDrawer.svelte`)

Los filtros en el Drawer **no se deben aplicar instantáneamente** mientras el usuario interactúa. Se debe usar un estado borrador local (`tempState`) que se confirma cuando el usuario hace clic en "Aplicar", o se descarta si presiona "Close" o hace clic fuera.

### Estructura Recomendada

```svelte
<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  import { SlidersHorizontal } from '@lucide/svelte';
  import type { createEntityFilters } from '../filters.svelte';

  let {
    filters,
    statuses = [],
    categories = [],
  }: {
    filters: ReturnType<typeof createEntityFilters>;
    statuses?: string[];
    categories?: string[];
  } = $props();

  let isDrawerOpen = $state(false);
  let tempStatus = $state<string[]>([]);
  let tempCategory = $state<string[]>([]);

  // Copia el estado de los filtros al abrir el drawer
  $effect(() => {
    if (isDrawerOpen) {
      tempStatus = [...filters.state.status];
      tempCategory = [...filters.state.category];
    }
  });

  function applyFilters() {
    filters.setStatus(tempStatus);
    filters.setCategory(tempCategory);
    isDrawerOpen = false;
  }
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

  <Sheet.Content side="right" class="w-full sm:max-w-md flex flex-col h-full">
    <Sheet.Header>
      <Sheet.Title class="flex items-center gap-2">
        <SlidersHorizontal class="h-5 w-5 text-muted-foreground" />
        Filtros Avanzados
      </Sheet.Title>
      <Sheet.Description>Ajusta los parámetros para segmentar el listado.</Sheet.Description>
    </Sheet.Header>
    <Separator />

    <div class="flex-1 overflow-y-auto space-y-6 px-4 my-2">
      <!-- Status Option List -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</h4>
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
                {status}
              </label>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <Separator />
    <Sheet.Footer class="pt-2 flex gap-3">
      <Sheet.Close class={buttonVariants({ variant: 'outline' })}>Close</Sheet.Close>
      <Button class={buttonVariants({ variant: 'default' })} onclick={applyFilters}>Aplicar</Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
```

---

## 4. Visualización Dual Desktop/Mobile (`[Entity]Table.svelte`)

El listado debe ser adaptable. En pantallas móviles (`md:hidden`) debe presentarse como un listado vertical de tarjetas táctiles (stacked cards). En pantallas grandes (`hidden md:block`) debe presentarse como una tabla formal de Shadcn usando TanStack Table.

```svelte
<script lang="ts">
  import { createTable, FlexRender, type ColumnDef } from '@tanstack/svelte-table';
  import { tableFeatures } from '@tanstack/table-core';
  import * as Table from '$lib/components/ui/table';
  import { Badge } from '$lib/components/ui/badge';
  import { goto } from '$app/navigation';

  let {
    data = [],
    filterSearch = '',
    filterStatus = [],
  }: {
    data?: any[];
    filterSearch?: string;
    filterStatus?: string[];
  } = $props();

  let filteredData = $derived(
    data.filter((item) => {
      const matchSearch = filterSearch
        ? item.name.toLowerCase().includes(filterSearch.toLowerCase())
        : true;
      const matchStatus = filterStatus.length ? filterStatus.includes(item.status) : true;
      return matchSearch && matchStatus;
    }),
  );

  const _features = tableFeatures({});
  const columns: ColumnDef<typeof _features, any>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'status', header: 'Estado' },
  ];

  const table = createTable({
    _features,
    _rowModels: {},
    columns,
    get data() {
      return filteredData;
    },
  });
</script>

<div class="space-y-4">
  <!-- MOBILE VIEW: Stacked Cards -->
  <div class="grid grid-cols-1 gap-4 md:hidden">
    {#each table.getRowModel().rows as row}
      <div
        class="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] flex flex-col gap-3"
        role="button"
        tabindex="0"
        onclick={() => goto(`/entities/${row.original.id}`)}
      >
        <div class="flex items-start justify-between">
          <span class="font-semibold text-foreground">{row.original.name}</span>
          <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
            {row.original.status}
          </Badge>
        </div>
      </div>
    {:else}
      <div class="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
        No se encontraron resultados.
      </div>
    {/each}
  </div>

  <!-- DESKTOP VIEW: Shadcn Table -->
  <div class="hidden md:block rounded-md border bg-card overflow-hidden">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup}
          <Table.Row>
            {#each headerGroup.headers as header}
              <Table.Head>
                {#if !header.isPlaceholder}
                  <FlexRender {header} />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row}
          <Table.Row
            class="cursor-pointer hover:bg-muted/50 transition-colors"
            onclick={() => goto(`/entities/${row.original.id}`)}
          >
            {#each row.getAllCells() as cell}
              <Table.Cell>
                <FlexRender {cell} />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No se encontraron resultados.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
```

---

## 5. Integración Principal (`+page.svelte`)

El archivo de la ruta unifica el buscador de texto (`Input`), el botón "Restablecer" (que solo aparece cuando hay filtros activos), el trigger del Drawer y la tabla modularizada.

```svelte
<script lang="ts">
  import { useEntities } from '$modules/entities/queries';
  import { createEntityFilters } from '$modules/entities/filters.svelte';
  import EntityTable from '$modules/entities/components/EntityTable.svelte';
  import EntityFiltersDrawer from '$modules/entities/components/EntityFiltersDrawer.svelte';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { AlertCircle, RotateCcw } from '@lucide/svelte';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';

  const entitiesQuery = useEntities();
  const filters = createEntityFilters();

  let statuses = $derived.by(() => {
    const set = new Set<string>();
    for (const item of entitiesQuery.data || []) {
      if (item.status) set.add(item.status);
    }
    return Array.from(set);
  });
</script>

<div class="flex flex-1 flex-col p-6 space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Entidades</h1>
    <p class="text-sm text-muted-foreground">Administración general de registros.</p>
  </div>

  <div class="flex items-center justify-between gap-4">
    <div class="flex-1 max-w-sm">
      <Input
        placeholder="Buscar..."
        value={filters.state.search}
        oninput={(e: any) => filters.setSearch(e.currentTarget.value)}
      />
    </div>

    <div class="flex items-center gap-2">
      <!-- Restablecer Filters Button -->
      {#if filters.activeFiltersCount > 0}
        <Button
          variant="ghost"
          class="hidden md:inline-flex text-muted-foreground hover:text-foreground gap-1.5 font-semibold text-xs animate-in fade-in"
          onclick={() => filters.reset()}
        >
          <RotateCcw class="h-3.5 w-3.5" />
          Restablecer
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden text-muted-foreground hover:text-foreground animate-in fade-in"
          onclick={() => filters.reset()}
        >
          <RotateCcw class="h-4 w-4" />
        </Button>
      {/if}

      <EntityFiltersDrawer {filters} {statuses} />
    </div>
  </div>

  {#if entitiesQuery.isPending}
    <div class="space-y-4">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-24 w-full" />
    </div>
  {:else if entitiesQuery.isError}
    <Alert variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>Error al cargar información.</AlertDescription>
    </Alert>
  {:else if entitiesQuery.data}
    <EntityTable
      data={entitiesQuery.data}
      filterSearch={filters.state.search}
      filterStatus={filters.state.status}
    />
  {/if}
</div>
```
