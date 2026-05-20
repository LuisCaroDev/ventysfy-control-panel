<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';
  import { FileText, Pencil, Settings2 } from '@lucide/svelte';

  import BusinessInvoiceActivationDrawer from '$modules/invoicing/components/BusinessInvoiceActivationDrawer.svelte';
  import BusinessInvoiceTechnicalDrawer from '$modules/invoicing/components/BusinessInvoiceTechnicalDrawer.svelte';
  import BusinessInvoiceDocumentDrawer from '$modules/invoicing/components/BusinessInvoiceDocumentDrawer.svelte';

  let {
    business,
    handleTabChange,
  }: {
    business: any;
    handleTabChange: (tab: string) => void;
  } = $props();

  let showActivationDrawer = $state(false);
  let showTechnicalDrawer = $state(false);
  let showDocumentDrawer = $state(false);

  // Feature Flag: Currently only Colombia is supported for electronic invoicing
  const isCountrySupported = $derived(business.country?.code2 === 'CO');
</script>

<Card.Root>
  <Card.Header>
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-3">
        <div class="rounded-xl border bg-muted/40 p-2 text-muted-foreground">
          <FileText class="h-5 w-5" />
        </div>
        <div class="space-y-1">
          <Card.Title>Facturación</Card.Title>
          <Card.Description>
            Controla si el negocio tiene facturación electrónica habilitada y a qué correo se
            enviarán los invoices.
          </Card.Description>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onclick={() => {
          showActivationDrawer = true;
        }}
        disabled={!isCountrySupported}
      >
        <Pencil class="h-4 w-4" />
        Editar
      </Button>
    </div>
  </Card.Header>
  <Card.Content class="space-y-5">
    <div class="space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <p class="text-sm font-medium">Facturación electrónica</p>
          <p class="text-xs text-muted-foreground">
            {business.invoiceService?.enabled && isCountrySupported
              ? 'Habilitada para este negocio.'
              : 'No habilitada para este negocio.'}
          </p>
        </div>
        <Badge
          variant={business.invoiceService?.enabled && isCountrySupported ? 'default' : 'outline'}
        >
          {business.invoiceService?.enabled && isCountrySupported ? 'Habilitada' : 'No habilitada'}
        </Badge>
      </div>

      <div class="space-y-1">
        <p class="text-sm font-medium">Correo de recepción de invoices</p>
        <p class="text-xs text-muted-foreground">
          {business.invoiceService?.email || 'Sin correo configurado'}
        </p>
      </div>

      {#if !isCountrySupported}
        <div
          class="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs flex items-center gap-2"
        >
          <span
            >Facturación electrónica no disponible para {business.country?.value ||
              'este país'}.</span
          >
        </div>
      {/if}
    </div>

    {#if business.invoiceService?.enabled && isCountrySupported}
      <Separator />

      <div class="space-y-3">
        <p class="text-sm font-medium">Accesos del flujo</p>
        <div class="grid gap-3">
          <Button
            variant="outline"
            class="h-auto justify-start p-0 w-full hover:bg-muted/50 transition-colors whitespace-normal"
            onclick={() => {
              showTechnicalDrawer = true;
            }}
          >
            <div class="flex w-full min-w-0 items-start gap-3 rounded-xl px-4 py-3 text-left">
              <div class="mt-0.5 text-muted-foreground shrink-0">
                <Settings2 class="h-4 w-4" />
              </div>
              <div class="space-y-1 min-w-0 flex-1">
                <p class="font-medium text-sm">Configuración general</p>
                <p class="text-xs font-normal text-muted-foreground leading-normal break-words">
                  Administra la configuración técnica del proveedor.
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            class="h-auto justify-start p-0 w-full hover:bg-muted/50 transition-colors whitespace-normal"
            onclick={() => {
              showDocumentDrawer = true;
            }}
          >
            <div class="flex w-full min-w-0 items-start gap-3 rounded-xl px-4 py-3 text-left">
              <div class="mt-0.5 text-muted-foreground shrink-0">
                <FileText class="h-4 w-4" />
              </div>
              <div class="space-y-1 min-w-0 flex-1">
                <p class="font-medium text-sm">Configuración por documento</p>
                <p class="text-xs font-normal text-muted-foreground leading-normal break-words">
                  Ajusta la numeración y parámetros por tipo de documento.
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            class="h-auto justify-start p-0 w-full hover:bg-muted/50 transition-colors whitespace-normal"
            onclick={() => {
              handleTabChange('invoicing');
            }}
          >
            <div class="flex w-full min-w-0 items-start gap-3 rounded-xl px-4 py-3 text-left">
              <div class="mt-0.5 text-muted-foreground shrink-0">
                <FileText class="h-4 w-4" />
              </div>
              <div class="space-y-1 min-w-0 flex-1">
                <p class="font-medium text-sm">Documentos electrónicos</p>
                <p class="text-xs font-normal text-muted-foreground leading-normal break-words">
                  Consulta el histórico y estado de documentos emitidos.
                </p>
              </div>
            </div>
          </Button>
        </div>
      </div>
    {/if}
  </Card.Content>
</Card.Root>

<!-- DRAWER COMPONENT CALLS (Locally encapsulated) -->
<BusinessInvoiceActivationDrawer
  bind:open={showActivationDrawer}
  companyId={business.id}
  initialEnabled={business.invoiceService?.enabled ?? false}
  initialEmail={business.invoiceService?.email ?? ''}
/>

{#if business.invoiceService?.enabled && isCountrySupported}
  <BusinessInvoiceTechnicalDrawer
    bind:open={showTechnicalDrawer}
    businessDocNumber={business.docNumber}
  />

  <BusinessInvoiceDocumentDrawer
    bind:open={showDocumentDrawer}
    businessDocNumber={business.docNumber}
  />
{/if}
