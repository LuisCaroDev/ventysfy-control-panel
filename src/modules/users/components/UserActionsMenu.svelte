<script lang="ts">
  import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import DialogUpdateUserPassword from './DialogUpdateUserPassword.svelte';
  import type { User } from '../schemas';

  let { user }: { user: User } = $props();

  let showUpdatePasswordDialog = $state(false);
  let canUpdatePassword = $derived(user.hasAccount && user.accountStatus !== 'without_account');
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 shrink-0"
        aria-label={`Abrir acciones para ${user.name}`}
        {...props}
      >
        <MoreHorizontal class="h-4 w-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>

  <DropdownMenu.Content align="end" class="w-56 rounded-xl p-1 shadow-md">
    <DropdownMenu.Item
      class="cursor-pointer rounded-lg"
      disabled={!canUpdatePassword}
      onclick={() => {
        if (!canUpdatePassword) return;
        showUpdatePasswordDialog = true;
      }}
    >
      <KeyRound class="h-4 w-4" />
      Actualizar password
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<DialogUpdateUserPassword bind:open={showUpdatePasswordDialog} {user} />
