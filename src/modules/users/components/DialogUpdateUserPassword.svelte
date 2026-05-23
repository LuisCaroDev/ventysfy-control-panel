<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { toast } from 'svelte-sonner';
  import { useUpdateUserPassword } from '$modules/users/queries';
  import {
    updateUserPasswordSchema,
    type UpdateUserPasswordForm,
    type User,
  } from '$modules/users/schemas';

  let {
    open = $bindable(false),
    user,
  }: {
    open: boolean;
    user: User;
  } = $props();

  const updatePasswordMutation = useUpdateUserPassword();
  let canUpdatePassword = $derived(user.hasAccount && user.accountStatus !== 'without_account');

  let form = $state<UpdateUserPasswordForm>({
    email: user.email,
    password: '',
    confirmPassword: '',
  });

  let fieldErrors = $state<Partial<Record<keyof UpdateUserPasswordForm, string[]>>>({});

  let organizationName = $derived(user.companyName ?? 'Sin compañía');

  function resetForm() {
    form = {
      email: user.email,
      password: '',
      confirmPassword: '',
    };
    fieldErrors = {};
  }

  function validateForm() {
    const parsed = updateUserPasswordSchema.safeParse(form);

    if (parsed.success) {
      fieldErrors = {};
      return parsed.data;
    }

    fieldErrors = parsed.error.flatten().fieldErrors;
    return null;
  }

  function updateField<K extends keyof UpdateUserPasswordForm>(field: K, value: string) {
    form = { ...form, [field]: value };
    if (fieldErrors[field]?.length) {
      fieldErrors = { ...fieldErrors, [field]: undefined };
    }
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!canUpdatePassword) {
      toast.error('No se puede actualizar la contraseña de un usuario sin cuenta.');
      open = false;
      return;
    }

    const validData = validateForm();
    if (!validData) {
      toast.error('Por favor corrige los errores del formulario.');
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        email: validData.email,
        password: validData.password,
      });
      toast.success('La contraseña fue actualizada correctamente.');
      open = false;
    } catch (e: any) {
      toast.error(e.message || 'No fue posible actualizar la contraseña.');
    }
  }

  $effect(() => {
    if (open && !canUpdatePassword) {
      open = false;
      return;
    }

    if (open) {
      resetForm();
      return;
    }

    resetForm();
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Actualizar contraseña</Dialog.Title>
      <Dialog.Description>
        Se va a actualizar el password del usuario <strong>{user.name}</strong> de
        <strong>{organizationName}</strong>.
      </Dialog.Description>
    </Dialog.Header>

    <form id="update-user-password-form" class="space-y-4 py-2" onsubmit={handleSubmit}>
      <div class="space-y-2">
        <Label for="user-email">Correo</Label>
        <Input id="user-email" type="email" value={form.email} disabled />
      </div>

      <div class="space-y-2">
        <Label for="user-password">Nueva contraseña</Label>
        <Input
          id="user-password"
          type="password"
          value={form.password}
          placeholder="Mínimo 6 caracteres"
          autocomplete="new-password"
          disabled={updatePasswordMutation.isPending}
          oninput={(event: Event) =>
            updateField('password', (event.currentTarget as HTMLInputElement).value)}
        />
        {#if fieldErrors.password?.length}
          <p class="text-sm font-medium text-destructive">{fieldErrors.password[0]}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="user-confirm-password">Confirmar contraseña</Label>
        <Input
          id="user-confirm-password"
          type="password"
          value={form.confirmPassword}
          placeholder="Vuelve a escribir la contraseña"
          autocomplete="new-password"
          disabled={updatePasswordMutation.isPending}
          oninput={(event: Event) =>
            updateField('confirmPassword', (event.currentTarget as HTMLInputElement).value)}
        />
        {#if fieldErrors.confirmPassword?.length}
          <p class="text-sm font-medium text-destructive">{fieldErrors.confirmPassword[0]}</p>
        {/if}
      </div>
    </form>

    <Dialog.Footer class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        variant="outline"
        onclick={() => (open = false)}
        disabled={updatePasswordMutation.isPending}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="update-user-password-form"
        disabled={updatePasswordMutation.isPending || !canUpdatePassword}
      >
        {#if updatePasswordMutation.isPending}
          Actualizando...
        {:else}
          Actualizar contraseña
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
