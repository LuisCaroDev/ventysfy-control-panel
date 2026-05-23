<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import { Button } from '$lib/components/ui/button';
  import Copy from '@lucide/svelte/icons/copy';
  import Check from '@lucide/svelte/icons/check';
  import type { ColDocument } from '../schemas';

  let {
    open = $bindable(false),
    document = null,
  }: {
    open: boolean;
    document: ColDocument | null;
  } = $props();

  let copiedRequest = $state(false);
  let copiedResponse = $state(false);

  async function copyToClipboard(value: any, target: 'request' | 'response') {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
      if (target === 'request') {
        copiedRequest = true;
        setTimeout(() => (copiedRequest = false), 2000);
      } else {
        copiedResponse = true;
        setTimeout(() => (copiedResponse = false), 2000);
      }
    } catch (e) {
      console.error('Failed to copy', e);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  function translateDocumentStatus(status: string) {
    switch (status) {
      case 'approved':
        return 'Aceptado';
      case 'rejected':
        return 'Rechazado';
      case 'contingency_dian':
        return 'Contingencia DIAN';
      case 'contingency_taxxa':
        return 'Contingencia Taxxa';
      case 'unknown':
        return 'Desconocido';
      default:
        return status;
    }
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content
    side="right"
    class="!w-full !max-w-sm p-6 flex flex-col h-full bg-background border-l shadow-lg overflow-y-auto"
  >
    {#if document}
      <Sheet.Header class="mb-6 p-0">
        <Sheet.Title class="text-xl font-bold">Detalle del Documento</Sheet.Title>
        <Sheet.Description>
          Información técnica del comprobante {document.documentNumber}
        </Sheet.Description>
      </Sheet.Header>

      <div class="flex-1 space-y-6">
        <!-- Info general -->
        <div class="grid gap-3 text-sm border p-4 rounded-xl bg-muted/10">
          <div class="flex justify-between items-center border-b border-muted/50 pb-2">
            <span class="font-medium text-muted-foreground">Número:</span>
            <span class="font-semibold">{document.documentNumber}</span>
          </div>
          <div class="flex justify-between items-center border-b border-muted/50 pb-2">
            <span class="font-medium text-muted-foreground">Tipo:</span>
            <span class="font-medium capitalize">
              {document.documentType === 'INVOICE'
                ? 'Factura'
                : document.documentType === 'CREDIT_NOTE'
                  ? 'Nota Crédito'
                  : 'POS'}
            </span>
          </div>
          <div class="flex justify-between items-center border-b border-muted/50 pb-2">
            <span class="font-medium text-muted-foreground">Estado DIAN:</span>
            <span class="font-semibold uppercase text-xs">
              {translateDocumentStatus(document.documentStatus)}
            </span>
          </div>
          <div class="flex justify-between items-center border-b border-muted/50 pb-2">
            <span class="font-medium text-muted-foreground">Fecha:</span>
            <span class="font-medium">{formatDate(document.documentDate)}</span>
          </div>
          <div class="flex justify-between items-center pb-1">
            <span class="font-medium text-muted-foreground">Total:</span>
            <span class="font-bold text-base text-foreground"
              >{formatCurrency(document.totalAmount)}</span
            >
          </div>
        </div>

        <!-- Debug section -->
        {#if document.providerData}
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider block">
              Auditoría DIAN ({document.providerData.provider})
            </h3>

            <details
              class="group border rounded-xl bg-muted/20 overflow-hidden transition-all duration-200"
            >
              <summary
                class="flex items-center justify-between p-4 font-semibold text-sm outline-none cursor-pointer hover:bg-muted/30 select-none"
              >
                <span>API Request Payload</span>
                <span
                  class="text-xs text-muted-foreground group-open:rotate-180 transition-transform"
                  >▼</span
                >
              </summary>
              <div class="p-4 pt-0 border-t bg-card cursor-auto space-y-2">
                <div class="flex items-center justify-between pt-3">
                  <span class="text-xs font-semibold uppercase text-muted-foreground"
                    >JSON enviado</span
                  >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onclick={() => copyToClipboard(document.providerData.request, 'request')}
                  >
                    {#if copiedRequest}
                      <Check class="h-3.5 w-3.5 text-green-500" />
                    {:else}
                      <Copy class="h-3.5 w-3.5" />
                    {/if}
                  </Button>
                </div>
                <div class="bg-muted/40 border rounded-lg max-w-full overflow-hidden">
                  <pre
                    class="p-3 overflow-auto text-[10px] leading-relaxed max-h-64 whitespace-pre-wrap break-all font-mono">{JSON.stringify(
                      document.providerData.request,
                      null,
                      2,
                    )}</pre>
                </div>
              </div>
            </details>

            <details
              class="group border rounded-xl bg-muted/20 overflow-hidden transition-all duration-200"
            >
              <summary
                class="flex items-center justify-between p-4 font-semibold text-sm outline-none cursor-pointer hover:bg-muted/30 select-none"
              >
                <span>API Response Payload</span>
                <span
                  class="text-xs text-muted-foreground group-open:rotate-180 transition-transform"
                  >▼</span
                >
              </summary>
              <div class="p-4 pt-0 border-t bg-card cursor-auto space-y-2">
                <div class="flex items-center justify-between pt-3">
                  <span class="text-xs font-semibold uppercase text-muted-foreground"
                    >JSON recibido</span
                  >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onclick={() => copyToClipboard(document.providerData.response, 'response')}
                  >
                    {#if copiedResponse}
                      <Check class="h-3.5 w-3.5 text-green-500" />
                    {:else}
                      <Copy class="h-3.5 w-3.5" />
                    {/if}
                  </Button>
                </div>
                <div class="bg-muted/40 border rounded-lg max-w-full overflow-hidden">
                  <pre
                    class="p-3 overflow-auto text-[10px] leading-relaxed max-h-64 whitespace-pre-wrap break-all font-mono">{JSON.stringify(
                      document.providerData.response,
                      null,
                      2,
                    )}</pre>
                </div>
              </div>
            </details>
          </div>
        {/if}
      </div>
    {/if}
  </Sheet.Content>
</Sheet.Root>
