<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import Copy from '@lucide/svelte/icons/copy';
  import { toast } from 'svelte-sonner';
  import { useCreateMasterUser } from '$modules/businesses/queries';
  import type { Business } from '$modules/businesses/schemas';

  let {
    open = $bindable(false),
    business,
  }: {
    open: boolean;
    business: Business;
  } = $props();

  const createMasterMutation = useCreateMasterUser();
  let credentials = $state<{ userName: string; password: string } | null>(null);

  async function handleGenerate() {
    try {
      const data = await createMasterMutation.mutateAsync(business.id);
      credentials = data;
      toast.success('Credenciales generadas con éxito.');
    } catch (e: any) {
      toast.error(e.message || 'Error al generar las credenciales.');
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  }

  // Reset credentials display when dialog is closed
  $effect(() => {
    if (!open) {
      credentials = null;
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Generar credenciales de acceso</Dialog.Title>
      {#if !credentials}
        <Dialog.Description>
          Se generarán automáticamente un usuario y una contraseña.
          <br />
          Estas credenciales se mostrarán una sola vez y luego se eliminarán por seguridad. ¿Deseas continuar?
        </Dialog.Description>
      {:else}
        <Dialog.Description>
          Estas son tus credenciales. Se mostrarán solo una vez, así que asegúrate de guardarlas en
          un lugar seguro. Serán eliminadas automáticamente cada día por motivos de seguridad.
        </Dialog.Description>
      {/if}
    </Dialog.Header>

    {#if credentials}
      <div class="space-y-4 py-2">
        <div class="space-y-2">
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
            >Usuario</label
          >
          <div class="flex items-center gap-2">
            <code class="flex-1 p-2 bg-muted rounded-md select-all text-xs font-mono break-all"
              >{credentials.userName}</code
            >
            <Button variant="ghost" size="icon" onclick={() => handleCopy(credentials!.userName)}>
              <Copy class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
            >Contraseña</label
          >
          <div class="flex items-center gap-2">
            <code class="flex-1 p-2 bg-muted rounded-md select-all text-xs font-mono break-all"
              >{credentials.password}</code
            >
            <Button variant="ghost" size="icon" onclick={() => handleCopy(credentials!.password)}>
              <Copy class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    {/if}

    <Dialog.Footer class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
      {#if !credentials}
        <Button
          variant="outline"
          onclick={() => (open = false)}
          disabled={createMasterMutation.isPending}
        >
          Cancelar
        </Button>
        <Button onclick={handleGenerate} disabled={createMasterMutation.isPending}>
          {#if createMasterMutation.isPending}
            Generando...
          {:else}
            Generar
          {/if}
        </Button>
      {:else}
        <Button onclick={() => (open = false)}>Aceptar</Button>
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
