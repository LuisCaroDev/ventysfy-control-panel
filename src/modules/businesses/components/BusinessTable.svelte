<script lang="ts">
  import { createTable, FlexRender, type ColumnDef } from '@tanstack/svelte-table';
  import { tableFeatures } from '@tanstack/table-core';
  import * as Table from '$lib/components/ui/table';
  import { Badge } from '$lib/components/ui/badge';
  import { goto } from '$app/navigation';
  import type { Business } from '../schemas';

  let {
    data = [],
    filterSearch = '',
    filterStatus = [],
    filterCountry = [],
    filterDocType = [],
    filterInvoiceEnabled = 'all',
  }: {
    data?: Business[];
    filterSearch?: string;
    filterStatus?: string[];
    filterCountry?: string[];
    filterDocType?: string[];
    filterInvoiceEnabled?: 'all' | 'active' | 'inactive';
  } = $props();

  // Filter the data based on inputs
  let filteredData = $derived(
    data.filter((b) => {
      const matchSearch = filterSearch
        ? b.tradeName.toLowerCase().includes(filterSearch.toLowerCase()) ||
          b.companyName.toLowerCase().includes(filterSearch.toLowerCase()) ||
          b.docNumber.toLowerCase().includes(filterSearch.toLowerCase())
        : true;
      const matchStatus = filterStatus.length ? filterStatus.includes(b.status) : true;
      const matchCountry = filterCountry.length ? filterCountry.includes(b.country.code2) : true;
      const matchDocType = filterDocType.length
        ? filterDocType.includes(b.docTypeDescription)
        : true;
      const matchInvoice =
        filterInvoiceEnabled === 'all'
          ? true
          : filterInvoiceEnabled === 'active'
            ? b.invoiceService?.enabled === true
            : b.invoiceService?.enabled === false || !b.invoiceService?.enabled;
      return matchSearch && matchStatus && matchCountry && matchDocType && matchInvoice;
    }),
  );

  const _features = tableFeatures({});

  const columns: ColumnDef<typeof _features, Business>[] = [
    {
      accessorKey: 'tradeName',
      header: 'Negocio',
      cell: (info: any) => info.getValue(),
    },
    {
      id: 'document',
      header: 'Documento',
      accessorFn: (row) => `${row.docTypeDescription} ${row.docNumber}`,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'companyName',
      header: 'Razón Social',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: 'Email / Contacto',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'cellphone.fullCellphone',
      header: 'Teléfono',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'country.value',
      header: 'País',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: (info: any) => info.getValue(),
    },
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
  <!-- Mobile View (Stacked Cards) -->
  <div class="grid grid-cols-1 gap-4 md:hidden">
    {#each table.getRowModel().rows as row}
      <div
        class="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] flex flex-col gap-3"
        role="button"
        tabindex="0"
        onclick={() => goto(`/businesses/${row.original.docNumber}`)}
        onkeydown={(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goto(`/businesses/${row.original.docNumber}`);
          }
        }}
      >
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="font-semibold text-foreground text-base">{row.original.tradeName}</span>
            <span class="text-xs text-muted-foreground mt-0.5">{row.original.companyName}</span>
          </div>
          <Badge
            variant={row.original.status === 'active' ? 'default' : 'secondary'}
            class="capitalize"
          >
            {row.original.status}
          </Badge>
        </div>

        <div class="space-y-1.5 border-t border-border pt-3 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Documento:</span>
            <span class="font-medium text-foreground"
              >{row.original.docTypeDescription} {row.original.docNumber}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Email:</span>
            <span class="font-medium text-foreground">{row.original.email}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Teléfono:</span>
            <span class="font-medium text-foreground">{row.original.cellphone.fullCellphone}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">País:</span>
            <span
              class="bg-muted px-2 py-0.5 rounded text-[10px] font-semibold uppercase text-muted-foreground"
            >
              {row.original.country.value}
            </span>
          </div>
        </div>
      </div>
    {:else}
      <div
        class="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm shadow-sm"
      >
        No se encontraron negocios.
      </div>
    {/each}
  </div>

  <!-- Desktop View (Shadcn Table) -->
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
            role="button"
            tabindex={0}
            onclick={() => goto(`/businesses/${row.original.docNumber}`)}
            onkeydown={(e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goto(`/businesses/${row.original.docNumber}`);
              }
            }}
          >
            {#each row.getAllCells() as cell}
              <Table.Cell>
                {#if cell.column.id === 'status'}
                  <Badge
                    variant={cell.getValue() === 'active' ? 'default' : 'secondary'}
                    class="capitalize">{cell.getValue()}</Badge
                  >
                {:else}
                  <FlexRender {cell} />
                {/if}
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No se encontraron negocios.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
