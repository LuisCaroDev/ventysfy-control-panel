<script lang="ts">
  import { CircleAlert, Plus } from '@lucide/svelte';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import CreatePaymentMethodDrawer from '$modules/payment-methods/components/CreatePaymentMethodDrawer.svelte';
  import PaymentMethodsTable from '$modules/payment-methods/components/PaymentMethodsTable.svelte';
  import { usePaymentMethods } from '$modules/payment-methods/queries';

  const paymentMethodsQuery = usePaymentMethods();
  let isCreateDrawerOpen = $state(false);
</script>

<svelte:head>
  <title>Métodos de pago — VentySfy Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col p-6 space-y-6">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Métodos de pago</h1>
      <p class="text-sm text-muted-foreground">
        Administra el catálogo global de métodos de pago disponible para la app mobile.
      </p>
    </div>
  </div>
  <div class="flex items-center justify-end gap-4">
    <Button class="gap-2 shrink-0" onclick={() => (isCreateDrawerOpen = true)}>
      <Plus class="h-4 w-4" />
      Crear método de pago
    </Button>
  </div>

  {#if paymentMethodsQuery.isPending}
    <div class="space-y-4">
      <Skeleton class="h-10 w-full" />
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-24 w-full" />
    </div>
  {:else if paymentMethodsQuery.isError}
    <Alert variant="destructive">
      <CircleAlert class="h-4 w-4" />
      <AlertDescription>
        Ocurrió un error al cargar los métodos de pago. Por favor intente de nuevo.
      </AlertDescription>
    </Alert>
  {:else if paymentMethodsQuery.data}
    <PaymentMethodsTable data={paymentMethodsQuery.data || []} />
  {/if}
</div>

<CreatePaymentMethodDrawer bind:open={isCreateDrawerOpen} />
