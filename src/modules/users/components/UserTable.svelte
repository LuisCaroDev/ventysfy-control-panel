<script lang="ts">
  import { createTable, FlexRender, type ColumnDef } from '@tanstack/svelte-table';
  import { tableFeatures } from '@tanstack/table-core';
  import * as Table from '$lib/components/ui/table';
  import { Badge } from '$lib/components/ui/badge';
  import UserActionsMenu from './UserActionsMenu.svelte';
  import type { User } from '../schemas';

  let { data = [] }: { data?: User[] } = $props();

  const _features = tableFeatures({});

  const statusTone: Record<string, 'default' | 'secondary' | 'outline'> = {
    active: 'default',
    without_account: 'secondary',
    locked: 'secondary',
    suspended: 'secondary',
    pending: 'outline',
    deleted: 'outline',
    unknown: 'outline',
  };

  const statusLabel: Record<string, string> = {
    active: 'Activa',
    without_account: 'Sin cuenta',
    locked: 'Bloqueada',
    suspended: 'Suspendida',
    pending: 'Pendiente',
    deleted: 'Eliminada',
    unknown: 'Desconocido',
  };

  function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  const columns: ColumnDef<typeof _features, User>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: 'Correo',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'companyName',
      header: 'Compañía',
      cell: (info: any) => info.getValue() ?? 'Sin compañía',
    },
    {
      accessorKey: 'accountStatus',
      header: 'Estado',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'hasAccount',
      header: 'Cuenta',
      cell: (info: any) => (info.getValue() ? 'Sí' : 'No'),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Actualizado',
      cell: (info: any) => formatDate(info.getValue()),
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
            <span class="text-xs text-muted-foreground mt-0.5 truncate">{row.original.email}</span>
          </div>
          <div class="flex items-center gap-2">
            <Badge
              variant={statusTone[row.original.accountStatus] ?? 'outline'}
              class="text-[10px] whitespace-nowrap"
            >
              {statusLabel[row.original.accountStatus] ?? row.original.accountStatus}
            </Badge>
            <UserActionsMenu user={row.original} />
          </div>
        </div>

        <div class="space-y-1.5 border-t border-border pt-3 text-xs">
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted-foreground">Compañía:</span>
            <span class="font-medium text-foreground text-right">
              {row.original.companyName ?? 'Sin compañía'}
            </span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted-foreground">Cuenta:</span>
            <span class="font-medium text-foreground">{row.original.hasAccount ? 'Sí' : 'No'}</span>
          </div>
          <div class="flex items-center justify-between gap-3">
            <span class="text-muted-foreground">Actualizado:</span>
            <span class="font-medium text-foreground">{formatDate(row.original.updatedAt)}</span>
          </div>
        </div>
      </div>
    {:else}
      <div
        class="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm shadow-sm"
      >
        No se encontraron usuarios.
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
            <Table.Head class="w-14 text-right">Acciones</Table.Head>
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row}
          <Table.Row class="transition-colors hover:bg-muted/50">
            {#each row.getAllCells() as cell}
              <Table.Cell>
                {#if cell.column.id === 'accountStatus'}
                  <Badge
                    variant={statusTone[cell.getValue() as string] ?? 'outline'}
                    class="capitalize"
                  >
                    {statusLabel[cell.getValue() as string] ?? cell.getValue()}
                  </Badge>
                {:else if cell.column.id === 'hasAccount'}
                  <Badge variant={cell.getValue() ? 'default' : 'outline'}>
                    {cell.getValue() ? 'Sí' : 'No'}
                  </Badge>
                {:else}
                  <FlexRender {cell} />
                {/if}
              </Table.Cell>
            {/each}
            <Table.Cell class="text-right">
              <div class="flex justify-end">
                <UserActionsMenu user={row.original} />
              </div>
            </Table.Cell>
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length + 1} class="h-24 text-center">
              No se encontraron usuarios.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
