<script lang="ts">
  import { untrack } from 'svelte';
  import { defaults, superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import * as Sheet from '$lib/components/ui/sheet';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { toast } from 'svelte-sonner';
  import { LoaderCircle } from '@lucide/svelte';
  import { rateToPercentage } from '$lib/utils';
  import { useUpdateBusinessSaleConfig } from '$modules/businesses/queries';
  import {
    updatePaymentMethodFormSchema,
    type PaymentMethod,
    type UpdatePaymentMethodForm,
  } from '$modules/businesses/schemas';

  let {
    open = $bindable(false),
    companyId,
    paymentMethod,
  }: {
    open: boolean;
    companyId: string;
    paymentMethod: PaymentMethod | null;
  } = $props();

  function getInitialValues(method: PaymentMethod | null): UpdatePaymentMethodForm {
    return {
      isEnabled: method?.config.isEnabled ?? false,
      commissionPercentage: method ? rateToPercentage(method.config.commissionPercentage) : 0,
      clientAssumesCommission: method ? !method.config.companyPaysCommission : false,
    };
  }

  const initialForm = defaults(getInitialValues(null), zod4Client(updatePaymentMethodFormSchema));
  const { form, errors, validateForm } = superForm(initialForm, {
    validators: zod4Client(updatePaymentMethodFormSchema),
    SPA: true,
    validationMethod: 'onsubmit',
  });

  const updateMutation = useUpdateBusinessSaleConfig();

  $effect(() => {
    if (open) {
      untrack(() => {
        form.set(getInitialValues(paymentMethod));
      });
    }
  });

  function handleCancel() {
    form.set(getInitialValues(paymentMethod));
    open = false;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!paymentMethod) return;

    const result = await validateForm({ update: true });
    if (!result.valid) return;

    try {
      await updateMutation.mutateAsync({
        companyId,
        paymentMethod: {
          id: paymentMethod.id,
          config: {
            isEnabled: result.data.isEnabled,
            commissionPercentage: result.data.commissionPercentage,
            companyPaysCommission: !result.data.clientAssumesCommission,
          },
        },
      });

      toast.success('Método de pago actualizado correctamente.');
      open = false;
    } catch (e: any) {
      toast.error(e.message || 'No fue posible actualizar el método de pago.');
    }
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content
    side="right"
    class="!w-full !max-w-sm p-6 flex flex-col h-full bg-background border-l shadow-lg"
  >
    <Sheet.Header class="mb-6 p-0">
      <Sheet.Title class="text-xl font-bold">Editar método de pago</Sheet.Title>
      <Sheet.Description>
        Ajusta la disponibilidad y comisión de {paymentMethod?.name ?? 'este método'}.
      </Sheet.Description>
    </Sheet.Header>

    <form class="flex flex-1 flex-col" novalidate onsubmit={handleSubmit}>
      <div class="flex-1 space-y-5">
        <div class="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
          <Switch
            id="payment-method-enabled"
            bind:checked={$form.isEnabled}
            disabled={updateMutation.isPending}
          />
          <div class="space-y-0.5">
            <Label for="payment-method-enabled" class="text-sm font-medium cursor-pointer">
              Activo
            </Label>
            <p class="text-xs text-muted-foreground">
              Permite usar este método en ventas del negocio.
            </p>
          </div>
        </div>

        <div class="space-y-2" data-invalid={$errors.commissionPercentage ? true : undefined}>
          <Label for="commission-percentage" class="text-sm font-medium">Comisión (%)</Label>
          <Input
            id="commission-percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            bind:value={$form.commissionPercentage}
            aria-invalid={$errors.commissionPercentage ? true : undefined}
            disabled={updateMutation.isPending}
          />
          {#if $errors.commissionPercentage}
            <p class="text-sm text-destructive">{$errors.commissionPercentage}</p>
          {/if}
        </div>

        <div class="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
          <Switch
            id="client-assumes-commission"
            bind:checked={$form.clientAssumesCommission}
            disabled={updateMutation.isPending}
          />
          <div class="space-y-0.5">
            <Label for="client-assumes-commission" class="text-sm font-medium cursor-pointer">
              Cliente asume comisión
            </Label>
            <p class="text-xs text-muted-foreground">
              Si está desactivado, la comisión la asume el negocio.
            </p>
          </div>
        </div>
      </div>

      <Sheet.Footer class="mt-auto p-0 pt-6 border-t flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          class="w-full sm:flex-1"
          onclick={handleCancel}
          disabled={updateMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          class="w-full sm:flex-1 gap-2"
          disabled={updateMutation.isPending || !paymentMethod}
        >
          {#if updateMutation.isPending}
            <LoaderCircle class="h-4 w-4 animate-spin" />
            Guardando
          {:else}
            Guardar cambios
          {/if}
        </Button>
      </Sheet.Footer>
    </form>
  </Sheet.Content>
</Sheet.Root>
