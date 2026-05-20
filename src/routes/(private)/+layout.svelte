<script lang="ts">
  import AppSidebar from '$lib/components/AppSidebar.svelte';
  import AppHeader from '$lib/components/AppHeader.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar';

  let { children } = $props();
</script>

<Sidebar.Provider>
  <div class="flex h-screen w-full overflow-hidden">
    <AppSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-y-auto bg-muted/20">
        {@render children()}
      </main>
    </div>
  </div>
</Sidebar.Provider>
