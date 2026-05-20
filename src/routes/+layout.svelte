<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { Toaster } from '$lib/components/ui/sonner';
  import { setAuthStore } from '$lib/stores/auth.svelte';
  import '../app.css';

  let { data, children } = $props();

  // Initialize auth store synchronously on load so children have instant access
  setAuthStore(data.user || null);

  $effect(() => {
    setAuthStore(data.user || null);
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
</script>

<ModeWatcher />
<Toaster />

<QueryClientProvider client={queryClient}>
  {@render children()}
</QueryClientProvider>
