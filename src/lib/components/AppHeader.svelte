<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { Separator } from '$lib/components/ui/separator';
  import AppBreadcrumb from './AppBreadcrumb.svelte';
</script>

<!-- Header matching Next.js visual hierarchy with dynamic breadcrumbs -->
<header
  class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear"
>
  <div class="flex w-full items-center gap-1 px-6 py-4">
    <Sidebar.Trigger class="-ml-1 [&_svg]:size-4 [&_svg]:shrink-0" />

    <Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />

    <AppBreadcrumb />
  </div>
</header>
