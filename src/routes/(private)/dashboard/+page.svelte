<script lang="ts">
  import { Separator } from '$lib/components/ui/separator';
  import * as Card from '$lib/components/ui/card';
</script>

<div class="p-6 space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
    <p class="text-sm text-muted-foreground">Métricas principales de VentySfy.</p>
  </div>
  <Separator />

  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <Card.Root>
      <Card.Header class="pb-2">
        <Card.Title class="text-sm font-medium text-muted-foreground">Negocios Activos</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">124</div>
        <p class="text-xs text-muted-foreground">+12% vs mes anterior</p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header class="pb-2">
        <Card.Title class="text-sm font-medium text-muted-foreground">MRR Estimado</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">$4,520</div>
        <p class="text-xs text-muted-foreground">+8% vs mes anterior</p>
      </Card.Content>
    </Card.Root>
  </div>
</div>
