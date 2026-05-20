<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import { useInvoicingConfig } from '$modules/invoicing/queries';
  import { LoaderCircle } from '@lucide/svelte';
  import { Separator } from '$lib/components/ui/separator';
  import { Button } from '$lib/components/ui/button';
  import TechnicalConfigForm from './TechnicalConfigForm.svelte';

  let {
    open = $bindable(false),
    businessDocNumber,
  }: {
    open: boolean;
    businessDocNumber: string;
  } = $props();

  let configQuery = $derived(useInvoicingConfig(businessDocNumber));
</script>

<Sheet.Root bind:open>
  <Sheet.Content
    side="right"
    class="!w-full !max-w-sm p-6 flex flex-col h-full bg-background border-l shadow-lg overflow-y-auto"
  >
    <Sheet.Header class="mb-6 p-0">
      <Sheet.Title class="text-xl font-bold">Credenciales de Facturación</Sheet.Title>
      <Sheet.Description>
        Configura los accesos técnicos y de conexión provistos por Taxxa para el envío de documentos
        electrónicos.
      </Sheet.Description>
    </Sheet.Header>

    <Separator class="my-2" />

    {#if configQuery.isPending}
      <div class="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <LoaderCircle class="h-8 w-8 animate-spin" />
        <p class="text-sm">Cargando credenciales...</p>
      </div>
    {:else if configQuery.isError}
      <div class="flex-1 flex flex-col items-center justify-center gap-2 text-destructive">
        <p class="text-sm font-medium">Error al cargar las credenciales.</p>
        <Button variant="outline" size="sm" onclick={() => configQuery.refetch()}>Reintentar</Button
        >
      </div>
    {:else if configQuery.data}
      <TechnicalConfigForm config={configQuery.data} {businessDocNumber} bind:open />
    {/if}
  </Sheet.Content>
</Sheet.Root>
