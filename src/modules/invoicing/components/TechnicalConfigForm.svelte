<script lang="ts">
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  import { LoaderCircle } from '@lucide/svelte';
  import * as Select from '$lib/components/ui/select';
  import { useSaveInvoicingConfig } from '$modules/invoicing/queries';
  import {
    invoicingFormSchema,
    organizationOptions,
    regimeOptions,
    responsabilityOptions,
    type InvoicingConfigApiValues,
  } from '$modules/invoicing/schemas';
  import { toast } from 'svelte-sonner';

  let {
    config,
    businessDocNumber,
    open = $bindable(false),
  }: {
    config: InvoicingConfigApiValues;
    businessDocNumber: string;
    open: boolean;
  } = $props();

  // Form state initialized with empty/default values
  let formValues = $state({
    prod: false,
    providerUrl: '',
    taxxaEmail: '',
    taxxaPassword: '',
    organization: '',
    regime: '',
    responsability: '',
    department: '',
    province: '',
  });

  // Keep formValues synchronized whenever the config prop updates
  $effect(() => {
    if (config) {
      formValues.prod = config.prod;
      formValues.providerUrl = config.providerUrl;
      formValues.taxxaEmail = config.taxxaEmail;
      formValues.taxxaPassword = config.taxxaPassword;
      formValues.organization = config.organization?.code ?? '';
      formValues.regime = config.regime?.code ?? '';
      formValues.responsability = config.responsability?.code ?? '';
      formValues.department = config.department?.code ?? '';
      formValues.province = config.province?.code ?? '';
    }
  });

  // Derived labels for Select triggers
  const selectedOrganizationLabel = $derived(
    organizationOptions.find((opt) => opt.code === formValues.organization)?.name ??
      'Seleccionar...',
  );

  const selectedRegimeLabel = $derived(
    regimeOptions.find((opt) => opt.code === formValues.regime)?.name ?? 'Seleccionar...',
  );

  const selectedResponsabilityLabel = $derived(
    responsabilityOptions.find((opt) => opt.code === formValues.responsability)?.name ??
      'Seleccionar...',
  );

  let formErrors = $state<Record<string, string>>({});
  let saveMutation = useSaveInvoicingConfig();

  async function handleSave() {
    formErrors = {};
    const result = invoicingFormSchema.safeParse(formValues);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      }
      formErrors = fieldErrors;
      toast.error('Por favor corrige los errores del formulario.');
      return;
    }
    try {
      await saveMutation.mutateAsync({ businessDocNumber, data: result.data });
      toast.success('Configuración técnica guardada correctamente.');
      open = false;
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar la configuración técnica.');
    }
  }
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    handleSave();
  }}
  id="technical-config-form"
  class="flex-1 space-y-5 py-2"
>
  <!-- Modo producción -->
  <div class="flex items-center justify-between gap-4 p-4 border rounded-xl bg-muted/20">
    <div class="space-y-0.5">
      <Label for="tech-prod-toggle" class="text-sm font-medium cursor-pointer">
        Modo Producción
      </Label>
      <p class="text-xs text-muted-foreground">
        Alterna entre el entorno de pruebas de la DIAN y producción real.
      </p>
    </div>
    <Switch id="tech-prod-toggle" bind:checked={formValues.prod} />
  </div>

  <!-- URL Proveedor -->
  <div class="space-y-2">
    <Label for="tech-provider-url" class="text-sm font-medium">URL Proveedor</Label>
    <Input
      id="tech-provider-url"
      bind:value={formValues.providerUrl}
      placeholder="https://taxxaapi.com/api.djson"
    />
    {#if formErrors.providerUrl}
      <p class="text-xs text-destructive">{formErrors.providerUrl}</p>
    {/if}
  </div>

  <!-- Credenciales -->
  <div class="space-y-2">
    <div class="space-y-0.5">
      <p class="text-sm font-medium">Credenciales</p>
      <p class="text-xs text-muted-foreground">
        Agrega las credenciales a usar para generar el token
      </p>
    </div>
    <Input
      id="tech-email"
      type="email"
      bind:value={formValues.taxxaEmail}
      placeholder="demo@taxxa.co"
    />
    {#if formErrors.taxxaEmail}
      <p class="text-xs text-destructive">{formErrors.taxxaEmail}</p>
    {/if}
    <Input
      id="tech-password"
      type="text"
      bind:value={formValues.taxxaPassword}
      placeholder="Contraseña"
    />
    {#if formErrors.taxxaPassword}
      <p class="text-xs text-destructive">{formErrors.taxxaPassword}</p>
    {/if}
  </div>

  <!-- Organización & Régimen -->
  <div class="grid grid-cols-2 gap-3">
    <div class="space-y-2">
      <Label for="tech-orlganization" class="text-sm font-medium">Organización</Label>
      <Select.Root type="single" bind:value={formValues.organization}>
        <Select.Trigger>
          {selectedOrganizationLabel}
        </Select.Trigger>
        <Select.Content>
          {#each organizationOptions as opt}
            <Select.Item value={opt.code}>{opt.name}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      {#if formErrors.organization}
        <p class="text-xs text-destructive">{formErrors.organization}</p>
      {/if}
    </div>
    <div class="space-y-2">
      <Label for="tech-regime" class="text-sm font-medium">Régimen</Label>
      <Select.Root type="single" bind:value={formValues.regime}>
        <Select.Trigger
          class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring {!formValues.regime
            ? 'text-muted-foreground'
            : ''}"
        >
          {selectedRegimeLabel}
        </Select.Trigger>
        <Select.Content>
          {#each regimeOptions as opt}
            <Select.Item value={opt.code}>{opt.name}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      {#if formErrors.regime}
        <p class="text-xs text-destructive">{formErrors.regime}</p>
      {/if}
    </div>
  </div>

  <!-- Responsabilidad -->
  <div class="space-y-2">
    <Label for="tech-responsability" class="text-sm font-medium">Responsabilidad</Label>
    <Select.Root type="single" bind:value={formValues.responsability}>
      <Select.Trigger
        class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring {!formValues.responsability
          ? 'text-muted-foreground'
          : ''}"
      >
        {selectedResponsabilityLabel}
      </Select.Trigger>
      <Select.Content>
        {#each responsabilityOptions as opt}
          <Select.Item value={opt.code}>{opt.name}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    {#if formErrors.responsability}
      <p class="text-xs text-destructive">{formErrors.responsability}</p>
    {/if}
  </div>

  <!-- Departamento & Provincia -->
  <div class="grid grid-cols-2 gap-3">
    <div class="space-y-2">
      <Label for="tech-department" class="text-sm font-medium">Departamento</Label>
      <Input id="tech-department" bind:value={formValues.department} placeholder="05" />
      {#if formErrors.department}
        <p class="text-xs text-destructive">{formErrors.department}</p>
      {/if}
    </div>
    <div class="space-y-2">
      <Label for="tech-province" class="text-sm font-medium">Provincia</Label>
      <Input id="tech-province" bind:value={formValues.province} placeholder="05001" />
      {#if formErrors.province}
        <p class="text-xs text-destructive">{formErrors.province}</p>
      {/if}
    </div>
  </div>
</form>

<footer class="mt-auto p-0 pt-6 border-t flex flex-col sm:flex-row gap-3">
  <Button
    variant="outline"
    class="w-full sm:flex-1"
    onclick={() => {
      open = false;
    }}
    disabled={saveMutation.isPending}
  >
    Cancelar
  </Button>
  <Button
    type="submit"
    form="technical-config-form"
    class="w-full sm:flex-1 gap-2"
    disabled={saveMutation.isPending}
  >
    {#if saveMutation.isPending}
      <LoaderCircle class="h-4 w-4 animate-spin" />
      Guardando
    {:else}
      Guardar credenciales
    {/if}
  </Button>
</footer>
