<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Switch } from '$lib/components/ui/switch';
  import { Textarea } from '$lib/components/ui/textarea';
  import {
    useInvoicingConfigRaw,
    useSaveInvoicingConfigForDocuments,
  } from '$modules/invoicing/queries';
  import { toast } from 'svelte-sonner';
  import { LoaderCircle } from '@lucide/svelte';
  import { Separator } from '$lib/components/ui/separator';
  import Calendar from '$lib/components/ui/calendar/calendar.svelte';
  import * as Popover from '$lib/components/ui/popover';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import { parseDate, getLocalTimeZone } from '@internationalized/date';

  let {
    open = $bindable(false),
    businessDocNumber,
  }: {
    open: boolean;
    businessDocNumber: string;
  } = $props();

  let configQuery = $derived(businessDocNumber ? useInvoicingConfigRaw(businessDocNumber) : null);
  const saveMutation = useSaveInvoicingConfigForDocuments();

  const defaultDoc = {
    prefix: '',
    from: 1,
    to: 1000,
    expirationDate: '',
    resolution: '',
    active: false,
  };

  let localConfig = $state<any>({
    invoice: { ...defaultDoc },
    creditNote: { ...defaultDoc },
    pos: { ...defaultDoc },
  });

  $effect(() => {
    if (configQuery && configQuery.data) {
      localConfig = {
        invoice: { ...defaultDoc, ...(configQuery.data.invoice || {}) },
        creditNote: { ...defaultDoc, ...(configQuery.data.creditNote || {}) },
        pos: { ...defaultDoc, ...(configQuery.data.pos || {}) },
      };
    }
  });

  let popoverOpen = $state<Record<string, boolean>>({
    invoice: false,
    creditNote: false,
    pos: false,
  });

  function getDateValue(key: 'invoice' | 'creditNote' | 'pos') {
    const dateStr = localConfig[key].expirationDate;
    if (!dateStr) return undefined;
    try {
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return parseDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }
      return parseDate(dateStr);
    } catch {
      return undefined;
    }
  }

  function setDateValue(key: 'invoice' | 'creditNote' | 'pos', val: any) {
    if (!val) {
      localConfig[key].expirationDate = '';
    } else {
      const day = String(val.day).padStart(2, '0');
      const month = String(val.month).padStart(2, '0');
      const year = val.year;
      localConfig[key].expirationDate = `${day}/${month}/${year}`;
    }
  }

  async function handleSave() {
    // Basic validation
    for (const key of ['invoice', 'creditNote', 'pos'] as const) {
      const doc = localConfig[key];
      if (doc.active) {
        if (!doc.prefix) {
          toast.error(
            `El prefijo es requerido para ${key === 'invoice' ? 'Facturas' : key === 'creditNote' ? 'Notas de Crédito' : 'POS'}.`,
          );
          return;
        }
        if (Number(doc.to) <= Number(doc.from)) {
          toast.error(
            `El rango 'Hasta' debe ser mayor que 'Desde' para ${key === 'invoice' ? 'Facturas' : key === 'creditNote' ? 'Notas de Crédito' : 'POS'}.`,
          );
          return;
        }
      }
    }

    try {
      await saveMutation.mutateAsync({
        businessDocNumber,
        configByDocument: {
          invoice: {
            ...localConfig.invoice,
            from: Number(localConfig.invoice.from),
            to: Number(localConfig.invoice.to),
          },
          creditNote: {
            ...localConfig.creditNote,
            from: Number(localConfig.creditNote.from),
            to: Number(localConfig.creditNote.to),
          },
          pos: {
            ...localConfig.pos,
            from: Number(localConfig.pos.from),
            to: Number(localConfig.pos.to),
          },
        },
      });
      toast.success('Configuración de documentos guardada correctamente.');
      open = false;
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar la configuración de documentos.');
    }
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content
    side="right"
    class="!w-full !max-w-sm p-6 flex flex-col h-full bg-background border-l shadow-lg overflow-y-auto"
  >
    <Sheet.Header class="mb-6 p-0">
      <Sheet.Title class="text-xl font-bold">Configuración por Documento</Sheet.Title>
      <Sheet.Description>
        Ajusta la numeración, prefijos y resoluciones autorizadas por la DIAN para cada tipo de
        comprobante.
      </Sheet.Description>
    </Sheet.Header>

    <Separator class="my-2" />

    {#if configQuery?.isPending}
      <div class="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <LoaderCircle class="h-8 w-8 animate-spin" />
        <p class="text-sm">Cargando resoluciones...</p>
      </div>
    {:else}
      <Tabs.Root value="invoice" class="flex-1 flex flex-col">
        <Tabs.List class="grid w-full grid-cols-3 mb-6 bg-muted/60 p-1 rounded-xl">
          <Tabs.Trigger value="invoice" class="rounded-lg py-2 text-xs font-semibold"
            >Facturas</Tabs.Trigger
          >
          <Tabs.Trigger value="creditNote" class="rounded-lg py-2 text-xs font-semibold"
            >Notas Crédito</Tabs.Trigger
          >
          <Tabs.Trigger value="pos" class="rounded-lg py-2 text-xs font-semibold">POS</Tabs.Trigger>
        </Tabs.List>

        {#each ['invoice', 'creditNote', 'pos'] as key}
          <Tabs.Content value={key} class="flex-1 space-y-5 focus-visible:outline-none">
            <div class="flex items-center justify-between gap-4 p-4 border rounded-xl bg-muted/20">
              <div class="space-y-0.5">
                <Label for="doc-active-{key}" class="text-sm font-semibold cursor-pointer">
                  Habilitar emisión de {key === 'invoice'
                    ? 'Facturas'
                    : key === 'creditNote'
                      ? 'Notas de Crédito'
                      : 'POS'}
                </Label>
                <p class="text-xs text-muted-foreground">
                  Activa el procesamiento electrónico para este tipo de documento.
                </p>
              </div>
              <Switch id="doc-active-{key}" bind:checked={localConfig[key].active} />
            </div>

            <div class="space-y-2">
              <Label for="doc-prefix-{key}" class="text-sm font-medium">Prefijo</Label>
              <Input
                id="doc-prefix-{key}"
                placeholder="Ex. SETT"
                bind:value={localConfig[key].prefix}
                disabled={!localConfig[key].active}
              />
            </div>

            <div class="space-y-2">
              <Label for="doc-from-{key}" class="text-sm font-medium">Rango Desde</Label>
              <Input
                id="doc-from-{key}"
                type="number"
                placeholder="1"
                bind:value={localConfig[key].from}
                disabled={!localConfig[key].active}
              />
            </div>
            <div class="space-y-2">
              <Label for="doc-to-{key}" class="text-sm font-medium">Rango Hasta</Label>
              <Input
                id="doc-to-{key}"
                type="number"
                placeholder="5000"
                bind:value={localConfig[key].to}
                disabled={!localConfig[key].active}
              />
            </div>

            <div class="space-y-2 flex flex-col">
              <Label for="doc-expiration-{key}" class="text-sm font-medium"
                >Fecha de Expiración</Label
              >
              <Popover.Root bind:open={popoverOpen[key]}>
                <Popover.Trigger id="doc-expiration-{key}" disabled={!localConfig[key].active}>
                  {#snippet child({ props })}
                    <Button
                      {...props}
                      variant="outline"
                      class="w-full justify-between font-normal {!getDateValue(key)
                        ? 'text-muted-foreground'
                        : ''}"
                      disabled={!localConfig[key].active}
                    >
                      {getDateValue(key)
                        ? getDateValue(key)!.toDate(getLocalTimeZone()).toLocaleDateString()
                        : 'Seleccionar fecha'}
                      <ChevronDownIcon class="h-4 w-4 opacity-50" />
                    </Button>
                  {/snippet}
                </Popover.Trigger>
                <Popover.Content class="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    type="single"
                    value={getDateValue(key)}
                    onValueChange={(val) => {
                      setDateValue(key, val);
                      popoverOpen[key] = false;
                    }}
                  />
                </Popover.Content>
              </Popover.Root>
            </div>

            <div class="space-y-2">
              <Label for="doc-resolution-{key}" class="text-sm font-medium"
                >Texto de Resolución Autorizada</Label
              >
              <Textarea
                id="doc-resolution-{key}"
                placeholder="Resolución DIAN No. 1876... del 2026-05-01"
                bind:value={localConfig[key].resolution}
                disabled={!localConfig[key].active}
                class="min-h-24"
              />
            </div>
          </Tabs.Content>
        {/each}
      </Tabs.Root>
    {/if}

    <Sheet.Footer class="mt-auto p-0 pt-6 border-t flex flex-col sm:flex-row gap-3">
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
        class="w-full sm:flex-1 gap-2"
        onclick={handleSave}
        disabled={saveMutation.isPending || configQuery?.isPending}
      >
        {#if saveMutation.isPending}
          <LoaderCircle class="h-4 w-4 animate-spin" />
          Guardando
        {:else}
          Guardar resoluciones
        {/if}
      </Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
