<script lang="ts">
  import { untrack } from 'svelte';
  import { defaults, superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { LoaderCircle } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';
  import { Button } from '$lib/components/ui/button';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { PAYMENT_METHOD_COUNTRY_CODE3, paymentMethodCountryLabels } from '$lib/schemas/country';
  import * as Sheet from '$lib/components/ui/sheet';
  import { Switch } from '$lib/components/ui/switch';
  import { useCreatePaymentMethod } from '$modules/payment-methods/queries';
  import {
    createPaymentMethodSchema,
    type CreatePaymentMethodForm,
  } from '$modules/payment-methods/schemas';

  let { open = $bindable(false) }: { open: boolean } = $props();

  function getInitialValues(): CreatePaymentMethodForm {
    return {
      name: '',
      allowRefund: false,
      isGlobal: true,
      countryCode3: [],
      commissionPercentage: 0,
      companyPaysCommission: false,
      isEnabledByDefault: true,
    };
  }

  const initialForm = defaults(getInitialValues(), zod4Client(createPaymentMethodSchema));
  const { form, errors, validateForm } = superForm(initialForm, {
    validators: zod4Client(createPaymentMethodSchema),
    SPA: true,
    validationMethod: 'onsubmit',
  });

  const createMutation = useCreatePaymentMethod();

  function resetForm() {
    form.set(getInitialValues());
  }

  function handleCancel() {
    resetForm();
    open = false;
  }

  function toggleCountry(code: (typeof PAYMENT_METHOD_COUNTRY_CODE3)[number], checked: boolean) {
    form.update((current) => ({
      ...current,
      countryCode3: checked
        ? [...current.countryCode3, code]
        : current.countryCode3.filter((item) => item !== code),
    }));
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const result = await validateForm({ update: true });
    if (!result.valid) {
      toast.error('Por favor corrige los errores del formulario.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...result.data,
        countryCode3: result.data.isGlobal ? [] : result.data.countryCode3,
      });
      toast.success('Método de pago creado correctamente.');
      open = false;
      resetForm();
    } catch (e: any) {
      toast.error(e.message || 'No fue posible crear el método de pago.');
    }
  }

  $effect(() => {
    if ($form.isGlobal && $form.countryCode3.length > 0) {
      untrack(() => {
        form.update((current) => ({
          ...current,
          countryCode3: [],
        }));
      });
    }
  });

  $effect(() => {
    if (open) {
      untrack(() => {
        resetForm();
      });
    }
  });
</script>

<Sheet.Root bind:open>
  <Sheet.Content
    side="right"
    class="w-full! max-w-md! p-6 flex flex-col h-full bg-background border-l shadow-lg overflow-x-auto"
  >
    <Sheet.Header class="mb-6 p-0">
      <Sheet.Title class="text-xl font-bold">Crear método de pago</Sheet.Title>
      <Sheet.Description>Configura un método de pago global para la app mobile.</Sheet.Description>
    </Sheet.Header>

    <form class="flex flex-1 flex-col" novalidate onsubmit={handleSubmit}>
      <div class="flex-1 overflow-y-auto space-y-5 pr-1">
        <div class="space-y-2" data-invalid={$errors.name ? true : undefined}>
          <Label for="payment-method-name" class="text-sm font-medium">Nombre</Label>
          <Input
            id="payment-method-name"
            bind:value={$form.name}
            placeholder="Ej. Tarjeta débito"
            aria-invalid={$errors.name ? true : undefined}
            disabled={createMutation.isPending}
          />
          {#if $errors.name}
            <p class="text-sm text-destructive">{$errors.name}</p>
          {/if}
        </div>

        <div class="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
          <Switch
            id="payment-method-global"
            bind:checked={$form.isGlobal}
            disabled={createMutation.isPending}
          />
          <div class="space-y-0.5">
            <Label for="payment-method-global" class="text-sm font-medium cursor-pointer">
              Disponible globalmente
            </Label>
            <p class="text-xs text-muted-foreground">
              Si está activo, aplica para todos los países soportados por la app.
            </p>
          </div>
        </div>

        <div
          class="space-y-3"
          data-invalid={$errors.countryCode3 ? true : undefined}
          aria-disabled={$form.isGlobal ? true : undefined}
        >
          <div class="space-y-1">
            <Label class="text-sm font-medium">Países soportados</Label>
            <p class="text-xs text-muted-foreground">
              Selecciona los países donde este método estará disponible.
            </p>
          </div>
          <div class="space-y-3 rounded-xl border bg-muted/20 p-4">
            {#each PAYMENT_METHOD_COUNTRY_CODE3 as code}
              <div class="flex items-center space-x-2.5">
                <Checkbox
                  id={`payment-country-${code}`}
                  checked={$form.countryCode3.includes(code)}
                  disabled={$form.isGlobal || createMutation.isPending}
                  onCheckedChange={(checked: boolean) => toggleCountry(code, checked === true)}
                />
                <label
                  for={`payment-country-${code}`}
                  class="text-sm font-medium leading-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors select-none"
                >
                  {paymentMethodCountryLabels[code]} ({code})
                </label>
              </div>
            {/each}
          </div>
          {#if $errors.countryCode3}
            <p class="text-sm text-destructive">{$errors.countryCode3}</p>
          {/if}
        </div>

        <div class="space-y-2" data-invalid={$errors.commissionPercentage ? true : undefined}>
          <Label for="payment-method-commission" class="text-sm font-medium">Comisión (%)</Label>
          <Input
            id="payment-method-commission"
            type="number"
            min="0"
            max="100"
            step="0.01"
            bind:value={$form.commissionPercentage}
            aria-invalid={$errors.commissionPercentage ? true : undefined}
            disabled={createMutation.isPending}
          />
          {#if $errors.commissionPercentage}
            <p class="text-sm text-destructive">{$errors.commissionPercentage}</p>
          {/if}
        </div>

        <div class="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
          <Switch
            id="payment-method-refund"
            bind:checked={$form.allowRefund}
            disabled={createMutation.isPending}
          />
          <div class="space-y-0.5">
            <Label for="payment-method-refund" class="text-sm font-medium cursor-pointer">
              Permite reembolsos
            </Label>
            <p class="text-xs text-muted-foreground">
              Define si este método acepta devoluciones desde el flujo de cobro.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
          <Switch
            id="payment-method-company-pays"
            bind:checked={$form.companyPaysCommission}
            disabled={createMutation.isPending}
          />
          <div class="space-y-0.5">
            <Label for="payment-method-company-pays" class="text-sm font-medium cursor-pointer">
              La empresa asume la comisión
            </Label>
            <p class="text-xs text-muted-foreground">
              Si está desactivado, la comisión la asume el cliente.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4 rounded-xl border bg-muted/20 p-4">
          <Switch
            id="payment-method-enabled-default"
            bind:checked={$form.isEnabledByDefault}
            disabled={createMutation.isPending}
          />
          <div class="space-y-0.5">
            <Label for="payment-method-enabled-default" class="text-sm font-medium cursor-pointer">
              Habilitado por defecto
            </Label>
            <p class="text-xs text-muted-foreground">
              Se activará automáticamente para nuevas configuraciones compatibles.
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
          disabled={createMutation.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" class="w-full sm:flex-1 gap-2" disabled={createMutation.isPending}>
          {#if createMutation.isPending}
            <LoaderCircle class="h-4 w-4 animate-spin" />
            Creando
          {:else}
            Crear método
          {/if}
        </Button>
      </Sheet.Footer>
    </form>
  </Sheet.Content>
</Sheet.Root>
