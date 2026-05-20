<script lang="ts">
  import { untrack } from 'svelte';
  import * as Sheet from '$lib/components/ui/sheet';
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  import { useUpdateInvoiceService } from '$modules/invoicing/queries';
  import { toast } from 'svelte-sonner';
  import { LoaderCircle } from '@lucide/svelte';

  let {
    open = $bindable(false),
    companyId,
    initialEnabled = false,
    initialEmail = '',
  }: {
    open: boolean;
    companyId: string;
    initialEnabled: boolean;
    initialEmail: string;
  } = $props();

  let enabled = $state(false);
  let email = $state('');

  $effect(() => {
    if (open) {
      untrack(() => {
        enabled = initialEnabled;
        email = initialEmail;
      });
    }
  });

  const updateMutation = useUpdateInvoiceService();

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        companyId,
        enabled,
        email,
      });
      toast.success('Servicio de facturación actualizado correctamente.');
      open = false;
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar el servicio.');
    }
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content
    side="right"
    class="!w-full !max-w-sm p-6 flex flex-col h-full bg-background border-l shadow-lg"
  >
    <Sheet.Header class="mb-6 p-0">
      <Sheet.Title class="text-xl font-bold">Configurar facturación electrónica</Sheet.Title>
      <Sheet.Description>
        Define si el negocio puede usar facturación electrónica y el correo donde se recibirán los
        invoices.
      </Sheet.Description>
    </Sheet.Header>

    <div class="flex-1 space-y-4">
      <div class="flex items-center space-x-4 p-4 border rounded-xl bg-muted/20">
        <Switch id="enabled-toggle" bind:checked={enabled} />
        <div class="space-y-0.5">
          <Label for="enabled-toggle" class="text-sm font-medium cursor-pointer">
            Habilitar facturación electrónica
          </Label>
          <p class="text-xs text-muted-foreground">
            Activa o desactiva este servicio para el negocio.
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <Label for="receiver-email" class="text-sm font-medium">
          Correo de recepción de invoices
        </Label>
        <Input
          id="receiver-email"
          type="email"
          placeholder="user@example.com"
          bind:value={email}
          class="w-full"
        />
      </div>
    </div>

    <Sheet.Footer class="mt-auto p-0 pt-6 border-t flex flex-col sm:flex-row gap-3">
      <Button
        variant="outline"
        class="w-full sm:flex-1"
        onclick={() => {
          enabled = initialEnabled;
          email = initialEmail;
          open = false;
        }}
        disabled={updateMutation.isPending}
      >
        Cancelar
      </Button>
      <Button
        class="w-full sm:flex-1 gap-2"
        onclick={handleSave}
        disabled={updateMutation.isPending}
      >
        {#if updateMutation.isPending}
          <LoaderCircle class="h-4 w-4 animate-spin" />
          Guardando
        {:else}
          Guardar cambios
        {/if}
      </Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
