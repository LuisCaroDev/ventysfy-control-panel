<script lang="ts">
  import { usePlans } from '$modules/businesses/queries';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';

  const plansQuery = usePlans();
</script>

<div class="p-6 space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Planes</h1>
    <p class="text-sm text-muted-foreground">Gestiona los planes de suscripción disponibles.</p>
  </div>
  <Separator />

  {#if plansQuery.isPending}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton class="h-48 w-full" />
      <Skeleton class="h-48 w-full" />
      <Skeleton class="h-48 w-full" />
    </div>
  {:else if plansQuery.data}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each plansQuery.data || [] as plan}
        <Card.Root>
          <Card.Header>
            <div class="flex items-start justify-between">
              <Card.Title>{plan.name}</Card.Title>
              <Badge variant={plan.active ? 'default' : 'secondary'}>
                {plan.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </Card.Header>
          <Card.Content>
            <div class="space-y-2">
              <p class="text-sm font-medium">Precios ({plan.currency}):</p>
              {#each plan.prices as price}
                <div class="flex justify-between text-sm text-muted-foreground">
                  <span>{price.id}</span>
                  <span
                    >{new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: price.currency,
                    }).format(price.amount)}</span
                  >
                </div>
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>
