<script lang="ts">
  import { createTable, FlexRender, type ColumnDef } from '@tanstack/svelte-table';
  import { tableFeatures } from '@tanstack/table-core';
  import { Badge } from '$lib/components/ui/badge';
  import { rateToPercentage } from '$lib/utils';
  import { PAYMENT_METHOD_COUNTRY_CODE3, paymentMethodCountryLabels } from '$lib/schemas/country';
  import * as Table from '$lib/components/ui/table';
  import { type PaymentMethod } from '$modules/payment-methods/schemas';

  let { data = [] }: { data?: PaymentMethod[] } = $props();

  const _features = tableFeatures({});

  function formatCountries(method: PaymentMethod) {
    if (method.isGlobal) return 'Todos';
    if (method.countryCode3.length === 0) return 'Sin países';
    return method.countryCode3.map((code) => paymentMethodCountryLabels[code] ?? code).join(', ');
  }

  function formatCommission(value: number) {
    return `${rateToPercentage(value)}%`;
  }

  const columns: ColumnDef<typeof _features, PaymentMethod>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: (info: any) => info.getValue(),
    },
    {
      id: 'countryCode3',
      header: 'Países',
      accessorFn: (row) => formatCountries(row),
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'allowRefund',
      header: 'Refund',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'commissionPercentage',
      header: 'Comisión',
      cell: (info: any) => formatCommission(info.getValue()),
    },
    {
      accessorKey: 'companyPaysCommission',
      header: 'Quién paga comisión',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'isGlobal',
      header: 'Global',
      cell: (info: any) => info.getValue(),
    },
  ];

  const table = createTable({
    _features,
    _rowModels: {},
    columns,
    get data() {
      return data;
    },
  });
</script>

<div class="space-y-4">
  <div class="grid grid-cols-1 gap-4 md:hidden">
    {#each table.getRowModel().rows as row}
      <div class="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-col min-w-0">
            <span class="font-semibold text-foreground text-base truncate">{row.original.name}</span
            >
            <span class="text-xs text-muted-foreground mt-0.5">
              {formatCountries(row.original)}
            </span>
          </div>
          <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
            {row.original.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        <div class="space-y-1.5 border-t border-border pt-3 text-xs">
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted-foreground">Refund:</span>
            <Badge variant={row.original.allowRefund ? 'default' : 'outline'}>
              {row.original.allowRefund ? 'Sí' : 'No'}
            </Badge>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted-foreground">Comisión:</span>
            <span class="font-medium text-foreground">
              {formatCommission(row.original.commissionPercentage)}
            </span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted-foreground">Quién paga:</span>
            <Badge variant="outline">
              {row.original.companyPaysCommission ? 'Empresa' : 'Cliente'}
            </Badge>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted-foreground">Global:</span>
            <Badge variant={row.original.isGlobal ? 'default' : 'secondary'}>
              {row.original.isGlobal ? 'Global' : 'Por países'}
            </Badge>
          </div>
        </div>
      </div>
    {:else}
      <div
        class="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm shadow-sm"
      >
        No se encontraron métodos de pago.
      </div>
    {/each}
  </div>

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
          <Table.Row class="transition-colors hover:bg-muted/50">
            {#each row.getAllCells() as cell}
              <Table.Cell>
                {#if cell.column.id === 'allowRefund'}
                  <Badge variant={cell.getValue() ? 'default' : 'outline'}>
                    {cell.getValue() ? 'Sí' : 'No'}
                  </Badge>
                {:else if cell.column.id === 'companyPaysCommission'}
                  <Badge variant="outline">
                    {cell.getValue() ? 'Empresa' : 'Cliente'}
                  </Badge>
                {:else if cell.column.id === 'isActive'}
                  <Badge variant={cell.getValue() ? 'default' : 'secondary'}>
                    {cell.getValue() ? 'Activo' : 'Inactivo'}
                  </Badge>
                {:else if cell.column.id === 'isGlobal'}
                  <Badge variant={cell.getValue() ? 'default' : 'secondary'}>
                    {cell.getValue() ? 'Global' : 'Por países'}
                  </Badge>
                {:else}
                  <FlexRender {cell} />
                {/if}
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No se encontraron métodos de pago.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
