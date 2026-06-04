<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { useBusiness } from '$modules/businesses/queries';
  import type { PaymentMethod } from '$modules/businesses/schemas';
  import { rateToPercentage } from '$lib/utils';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import {
    CircleAlert,
    Building2,
    MapPin,
    Wallet,
    CreditCard,
    Settings2,
    Pencil,
    FileText,
    EllipsisVertical,
  } from '@lucide/svelte';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Table from '$lib/components/ui/table';
  import { useDocuments } from '$modules/invoicing/queries';
  import { format, subDays } from 'date-fns';

  // Invoicing filters and components
  import { createInvoicesFilters } from '$modules/invoicing/filters.svelte';
  import InvoicesFiltersDrawer from '$modules/invoicing/components/InvoicesFiltersDrawer.svelte';
  import { RotateCcw } from '@lucide/svelte';

  // Drawers
  import BusinessInvoiceDetailsDrawer from '$modules/invoicing/components/BusinessInvoiceDetailsDrawer.svelte';
  import BusinessInvoiceCard from '$modules/invoicing/components/BusinessInvoiceCard.svelte';

  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import DialogGenerateCredentials from '$modules/businesses/components/DialogGenerateCredentials.svelte';
  import DialogDeleteAccount from '$modules/businesses/components/DialogDeleteAccount.svelte';
  import BusinessPaymentMethodDrawer from '$modules/businesses/components/BusinessPaymentMethodDrawer.svelte';

  let businessId = $derived($page.params.businessId || '');
  let query = $derived(useBusiness(businessId));
  let business = $derived(query.data);
  let showAllPaymentMethods = $state(false);
  let showPaymentMethodDrawer = $state(false);
  let selectedPaymentMethod = $state<PaymentMethod | null>(null);

  // Active tab state derived reactively from URL query parameter, defaulting to 'general'
  let activeTab = $derived($page.url.searchParams.get('tab') || 'general');

  // Helper to cleanly update the active tab query parameter in the URL
  function handleTabChange(tab: string) {
    const url = new URL($page.url);
    url.searchParams.set('tab', tab);
    goto(url.pathname + url.search, { replaceState: true, noScroll: true, keepFocus: true });
  }

  // Details Drawer state
  let showDetailsDrawer = $state(false);
  let selectedDocument = $state<any>(null);

  function handleOpenDetails(doc: any) {
    selectedDocument = doc;
    showDetailsDrawer = true;
  }

  // Invoicing reactive filters
  const filters = createInvoicesFilters();

  let docsQuery = $derived(
    business && business.invoiceService?.enabled
      ? useDocuments(
          business.docNumber,
          filters.state.fromDate,
          filters.state.toDate,
          filters.state.status,
        )
      : null,
  );

  let filteredDocs = $derived.by(() => {
    const list = docsQuery?.data || [];
    return list.filter((doc) => {
      const matchSearch = filters.state.search
        ? doc.documentNumber.toLowerCase().includes(filters.state.search.toLowerCase())
        : true;
      const matchStatus = filters.state.status.length
        ? filters.state.status.includes(doc.documentStatus)
        : true;
      return matchSearch && matchStatus;
    });
  });

  const statuses = ['approved', 'rejected', 'contingency_dian', 'contingency_taxxa', 'unknown'];

  function translateStatus(status: string) {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'cancelled':
        return 'Cancelado';
      case 'suspended':
        return 'Suspendido';
      case 'pending':
        return 'Pendiente';
      case 'incomplete':
        return 'Incompleto';
      default:
        return status;
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

  function getDocumentStatusVariant(status: string) {
    if (status === 'approved') return 'default';
    if (status === 'rejected') return 'destructive';
    if (status === 'contingency_dian' || status === 'contingency_taxxa') return 'outline';
    return 'secondary';
  }

  function formatDateValue(value?: string | null) {
    if (!value) return 'No disponible';
    try {
      return format(new Date(value), 'dd/MM/yyyy');
    } catch {
      return 'No disponible';
    }
  }

  const MAX_VISIBLE_PAYMENT_METHODS = 3;

  let paymentMethods = $derived(business?.salesConfig?.paymentMethodList ?? []);
  let visiblePaymentMethods = $derived(
    showAllPaymentMethods ? paymentMethods : paymentMethods.slice(0, MAX_VISIBLE_PAYMENT_METHODS),
  );
  let hiddenPaymentMethodsCount = $derived(
    Math.max(paymentMethods.length - MAX_VISIBLE_PAYMENT_METHODS, 0),
  );

  function handleOpenPaymentMethod(method: PaymentMethod) {
    selectedPaymentMethod = method;
    showPaymentMethodDrawer = true;
  }

  $effect(() => {
    if (business && !business.invoiceService?.enabled && activeTab === 'invoicing') {
      handleTabChange('general');
    }
  });

  let showGenerateCredsDialog = $state(false);
  let showDeleteAccountDialog = $state(false);
</script>

<div class="flex flex-1 flex-col gap-6 p-6">
  <div class="flex flex-col gap-2">
    <a
      href="/businesses"
      class="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      Volver a negocios
    </a>
  </div>

  {#if query.isPending}
    <div class="space-y-4">
      <Skeleton class="h-32 w-full" />
      <div class="grid grid-cols-2 gap-4">
        <Skeleton class="h-64 w-full" />
        <Skeleton class="h-64 w-full" />
      </div>
    </div>
  {:else if query.isError}
    <Alert variant="destructive">
      <CircleAlert class="h-4 w-4" />
      <AlertDescription>Error al cargar el negocio.</AlertDescription>
    </Alert>
  {:else if business}
    <!-- HEADER DEL NEGOCIO -->
    <div class="flex items-start justify-between md:items-center gap-4 border-b pb-6">
      <div class="flex items-center gap-4 min-w-0">
        <Avatar class="h-16 w-16 rounded-2xl border shadow-sm shrink-0">
          <!-- {#if business.logoPath}
            <AvatarImage src={business.logoPath} alt={business.tradeName} class="object-cover" />
          {/if} -->
          <AvatarFallback class="rounded-2xl text-lg font-semibold">
            {business.tradeName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div class="space-y-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight truncate">{business.tradeName}</h1>
            <Badge
              variant={business.status === 'active' ? 'default' : 'secondary'}
              class="text-xs shrink-0"
            >
              {translateStatus(business.status)}
            </Badge>
          </div>
          <p class="text-sm text-muted-foreground truncate">{business.companyName}</p>
        </div>
      </div>

      <!-- BOTÓN DE ACCIONES -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 w-10 md:w-auto md:px-4 py-2 gap-2 cursor-pointer"
        >
          <EllipsisVertical class="h-4 w-4 md:hidden" />
          <Settings2 class="h-4 w-4 hidden md:block" />
          <span class="hidden md:inline">Acciones</span>
          <ChevronDown class="h-4 w-4 shrink-0 opacity-50 hidden md:block" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-56 rounded-xl p-1 shadow-md">
          <DropdownMenu.Item
            onclick={() => (showGenerateCredsDialog = true)}
            class="rounded-lg cursor-pointer"
          >
            Generar credenciales
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            onclick={() => (showDeleteAccountDialog = true)}
            class="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer"
          >
            Eliminar cuenta
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    <Tabs.Root value={activeTab} onValueChange={handleTabChange} class="space-y-6">
      {#if business.invoiceService?.enabled}
        <Tabs.List class="w-full max-w-md">
          <Tabs.Trigger value="general">
            <Building2 class="mr-2 h-4 w-4" />
            Información General
          </Tabs.Trigger>
          <Tabs.Trigger value="invoicing">
            <FileText class="mr-2 h-4 w-4" />
            Facturas
          </Tabs.Trigger>
        </Tabs.List>
      {/if}

      <!-- PESTAÑA INFORMACIÓN GENERAL -->
      <Tabs.Content value="general" class="focus-visible:outline-none">
        <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <!-- COLUMNA IZQUIERDA -->
          <div class="space-y-6">
            <Card.Root>
              <Card.Header>
                <div class="flex items-start gap-3">
                  <div class="rounded-xl border bg-muted/40 p-2 text-muted-foreground">
                    <Building2 class="h-5 w-5" />
                  </div>
                  <div class="space-y-1">
                    <Card.Title>Información general</Card.Title>
                    <Card.Description>Datos base de identificación y contacto.</Card.Description>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p class="text-sm font-medium">Razón social</p>
                    <p class="text-sm text-muted-foreground">{business.companyName}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium">Documento</p>
                    <p class="text-sm text-muted-foreground">
                      {business.docTypeDescription} · {business.docNumber}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm font-medium">Correo</p>
                    <p class="text-sm text-muted-foreground">{business.email}</p>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <div class="flex items-start gap-3">
                  <div class="rounded-xl border bg-muted/40 p-2 text-muted-foreground">
                    <Wallet class="h-5 w-5" />
                  </div>
                  <div class="space-y-1">
                    <Card.Title>Métodos de pago</Card.Title>
                    <Card.Description>Configuración de cobros para ventas.</Card.Description>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                {#if paymentMethods.length > 0}
                  <div class="flex flex-col gap-3">
                    {#each visiblePaymentMethods as paymentMethod}
                      <div
                        class="flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/40 cursor-pointer"
                        role="button"
                        tabindex="0"
                        onclick={() => handleOpenPaymentMethod(paymentMethod)}
                        onkeydown={(e: KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenPaymentMethod(paymentMethod);
                          }
                        }}
                      >
                        <div class="min-w-0">
                          <p class="truncate text-sm font-medium">{paymentMethod.name}</p>
                          <p class="text-xs text-muted-foreground">
                            Comisión {rateToPercentage(paymentMethod.config.commissionPercentage)}%
                          </p>
                        </div>

                        <Badge variant={paymentMethod.config.isEnabled ? 'default' : 'secondary'}>
                          {paymentMethod.config.isEnabled ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    {/each}

                    {#if hiddenPaymentMethodsCount > 0}
                      <Button
                        variant="ghost"
                        class="w-fit px-0 text-sm"
                        onclick={() => (showAllPaymentMethods = !showAllPaymentMethods)}
                      >
                        {showAllPaymentMethods
                          ? 'Mostrar menos'
                          : `Mostrar ${hiddenPaymentMethodsCount} más`}
                      </Button>
                    {/if}
                  </div>
                {:else}
                  <p class="text-sm text-muted-foreground">
                    Este negocio no tiene métodos de pago configurados.
                  </p>
                {/if}
              </Card.Content>
            </Card.Root>

            <Card.Root>
              <Card.Header>
                <div class="flex items-start gap-3">
                  <div class="rounded-xl border bg-muted/40 p-2 text-muted-foreground">
                    <MapPin class="h-5 w-5" />
                  </div>
                  <div class="space-y-1">
                    <Card.Title>Ubicación</Card.Title>
                    <Card.Description>Cobertura y dirección.</Card.Description>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p class="text-sm font-medium">País</p>
                    <p class="text-sm text-muted-foreground">{business.country.value}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium">Ciudad</p>
                    <p class="text-sm text-muted-foreground">{business.city}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium">Dirección</p>
                    <p class="text-sm text-muted-foreground">{business.address}</p>
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          </div>

          <!-- COLUMNA DERECHA -->
          <div class="space-y-6">
            <Card.Root>
              <Card.Header>
                <div class="flex items-start gap-3">
                  <div class="rounded-xl border bg-muted/40 p-2 text-muted-foreground">
                    <CreditCard class="h-5 w-5" />
                  </div>
                  <div class="space-y-1">
                    <Card.Title>Suscripción</Card.Title>
                    <Card.Description>Estado del plan y vigencia actual.</Card.Description>
                  </div>
                </div>
              </Card.Header>
              <Card.Content>
                {#if business.subscription}
                  <div class="space-y-5">
                    <div class="flex items-center justify-between gap-4">
                      <div class="space-y-1">
                        <p class="text-sm font-medium">Plan actual</p>
                        <p class="text-sm text-muted-foreground">{business.subscription.name}</p>
                      </div>
                      <Badge variant="outline" class="capitalize"
                        >{translateStatus(business.subscription.status)}</Badge
                      >
                    </div>
                  </div>
                {:else}
                  <p class="text-sm text-muted-foreground">
                    Este negocio no tiene una suscripción asignada.
                  </p>
                {/if}
              </Card.Content>
            </Card.Root>

            <!-- FACTURACIÓN CARD -->
            <BusinessInvoiceCard {business} {handleTabChange} />
          </div>
        </div>
      </Tabs.Content>

      <!-- PESTAÑA FACTURACIÓN ELECTRÓNICA -->
      <Tabs.Content value="invoicing" class="focus-visible:outline-none">
        <div class="space-y-4">
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
          >
            <div>
              <h3 class="text-lg font-semibold tracking-tight">Historial de Documentos Fiscales</h3>
              <p class="text-xs text-muted-foreground mt-0.5">
                Consulta el listado y estado de todos los comprobantes emitidos ante la DIAN.
              </p>
            </div>

            <div class="flex items-center gap-2 self-stretch sm:self-auto min-w-0">
              <div class="flex-1 sm:w-64 max-w-sm">
                <Input
                  placeholder="Buscar por número..."
                  value={filters.state.search}
                  oninput={(e: any) => filters.setSearch(e.currentTarget.value)}
                  class="h-9 text-xs rounded-xl"
                />
              </div>

              {#if filters.activeFiltersCount > 0}
                <Button
                  variant="ghost"
                  class="hidden md:inline-flex text-muted-foreground hover:text-foreground gap-1.5 font-semibold text-xs animate-in fade-in rounded-xl h-9"
                  onclick={() => filters.reset()}
                >
                  <RotateCcw class="h-3.5 w-3.5" />
                  Restablecer
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="md:hidden text-muted-foreground hover:text-foreground animate-in fade-in rounded-xl h-9 w-9"
                  onclick={() => filters.reset()}
                >
                  <RotateCcw class="h-4 w-4" />
                </Button>
              {/if}

              <InvoicesFiltersDrawer {filters} {statuses} />
            </div>
          </div>

          {#if docsQuery?.isPending}
            <div class="space-y-4 mt-6">
              <Skeleton class="h-10 w-full animate-pulse" />
              <Skeleton class="h-24 w-full animate-pulse" />
            </div>
          {:else if docsQuery?.data}
            <!-- Mobile View (Stacked Cards) -->
            <div class="grid grid-cols-1 gap-4 md:hidden mt-4">
              {#each filteredDocs as doc}
                <div
                  class="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] flex flex-col gap-3"
                  role="button"
                  tabindex="0"
                  onclick={() => handleOpenDetails(doc)}
                  onkeydown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenDetails(doc);
                    }
                  }}
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex flex-col min-w-0">
                      <span class="font-semibold text-foreground text-sm truncate"
                        >{doc.documentNumber}</span
                      >
                      <span class="text-xs text-muted-foreground mt-0.5">
                        {doc.documentType === 'INVOICE'
                          ? 'Factura'
                          : doc.documentType === 'CREDIT_NOTE'
                            ? 'Nota Crédito'
                            : 'POS'}
                      </span>
                    </div>
                    <Badge
                      variant={getDocumentStatusVariant(doc.documentStatus)}
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase shrink-0"
                    >
                      {translateDocumentStatus(doc.documentStatus)}
                    </Badge>
                  </div>

                  <div class="space-y-1.5 border-t border-border pt-3 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">Fecha:</span>
                      <span class="font-medium text-foreground">
                        {format(new Date(doc.documentDate), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">Total:</span>
                      <span class="font-semibold text-foreground">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                        }).format(doc.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              {:else}
                <div
                  class="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm shadow-sm"
                >
                  No se encontraron documentos emitidos en este rango de fechas.
                </div>
              {/each}
            </div>

            <!-- Desktop View (Shadcn Table) -->
            <div
              class="hidden md:block rounded-xl border bg-card/60 shadow-sm overflow-hidden mt-4"
            >
              <Table.Root>
                <Table.Header>
                  <Table.Row class="bg-muted/40">
                    <Table.Head class="font-bold">Fecha</Table.Head>
                    <Table.Head class="font-bold">Número</Table.Head>
                    <Table.Head class="font-bold">Tipo</Table.Head>
                    <Table.Head class="font-bold text-right">Total</Table.Head>
                    <Table.Head class="font-bold text-center">Estado DIAN</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#each filteredDocs as doc}
                    <Table.Row
                      class="hover:bg-muted/20 cursor-pointer"
                      onclick={() => handleOpenDetails(doc)}
                    >
                      <Table.Cell class="text-sm"
                        >{format(new Date(doc.documentDate), 'dd/MM/yyyy')}</Table.Cell
                      >
                      <Table.Cell class="font-semibold text-sm">{doc.documentNumber}</Table.Cell>
                      <Table.Cell class="text-sm">
                        {doc.documentType === 'INVOICE'
                          ? 'Factura'
                          : doc.documentType === 'CREDIT_NOTE'
                            ? 'Nota Crédito'
                            : 'POS'}
                      </Table.Cell>
                      <Table.Cell class="text-right font-medium text-sm">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                        }).format(doc.totalAmount)}
                      </Table.Cell>
                      <Table.Cell class="text-center">
                        <Badge
                          variant={getDocumentStatusVariant(doc.documentStatus)}
                          class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                        >
                          {translateDocumentStatus(doc.documentStatus)}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  {:else}
                    <Table.Row>
                      <Table.Cell
                        colspan={5}
                        class="h-32 text-center text-sm text-muted-foreground"
                      >
                        No se encontraron documentos emitidos en este rango de fechas.
                      </Table.Cell>
                    </Table.Row>
                  {/each}
                </Table.Body>
              </Table.Root>
            </div>
          {/if}
        </div>
      </Tabs.Content>
    </Tabs.Root>

    <DialogGenerateCredentials bind:open={showGenerateCredsDialog} {business} />
    <DialogDeleteAccount bind:open={showDeleteAccountDialog} {business} />
    <BusinessPaymentMethodDrawer
      bind:open={showPaymentMethodDrawer}
      companyId={business.id}
      paymentMethod={selectedPaymentMethod}
    />
  {/if}

  <BusinessInvoiceDetailsDrawer bind:open={showDetailsDrawer} document={selectedDocument} />
</div>
