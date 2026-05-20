<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import AlertCircle from '@lucide/svelte/icons/alert-circle';
  import { toast } from 'svelte-sonner';
  import { useDeleteBusiness } from '$modules/businesses/queries';
  import type { Business } from '$modules/businesses/schemas';
  import { goto } from '$app/navigation';

  let {
    open = $bindable(false),
    business,
  }: {
    open: boolean;
    business: Business;
  } = $props();

  const deleteMutation = useDeleteBusiness();
  let typedDocNumber = $state('');

  let isInputValid = $derived(typedDocNumber === business.docNumber);

  async function handleDelete(e: SubmitEvent) {
    e.preventDefault();
    if (!isInputValid) return;

    try {
      await deleteMutation.mutateAsync(business.id);
      toast.success('El negocio ha sido eliminado correctamente.');
      open = false;
      // Navigate back to the list of businesses
      goto('/businesses');
    } catch (e: any) {
      toast.error(e.message || 'No fue posible eliminar el negocio.');
    }
  }

  // Reset verification input when dialog is closed
  $effect(() => {
    if (!open) {
      typedDocNumber = '';
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Eliminar Negocio</Dialog.Title>
      <Dialog.Description>
        Esta acción eliminará permanentemente el negocio <strong>{business.tradeName}</strong>.
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 py-2">
      <Alert variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Advertencia:</AlertTitle>
        <AlertDescription>
          Esta acción no es reversible. Por favor, proceda con cuidado.
        </AlertDescription>
      </Alert>

      <form id="delete-business-form" onsubmit={handleDelete} class="space-y-4">
        <div class="space-y-2">
          <p class="text-xs text-muted-foreground">
            Ingresa el número de documento <strong>{business.docNumber}</strong> para continuar:
          </p>
          <label
            for="doc-number-input"
            class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
          >
            Número de documento
          </label>
          <Input
            id="doc-number-input"
            type="text"
            bind:value={typedDocNumber}
            placeholder="Escribe el documento del negocio"
            autocomplete="off"
            disabled={deleteMutation.isPending}
          />
          {#if typedDocNumber && !isInputValid}
            <p class="text-xs text-destructive">El documento no coincide</p>
          {/if}
        </div>
      </form>
    </div>

    <Dialog.Footer class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
      <Button variant="outline" onclick={() => (open = false)} disabled={deleteMutation.isPending}>
        Cancelar
      </Button>
      <Button
        type="submit"
        form="delete-business-form"
        variant="destructive"
        disabled={!isInputValid || deleteMutation.isPending}
      >
        {#if deleteMutation.isPending}
          Eliminando...
        {:else}
          Eliminar
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
