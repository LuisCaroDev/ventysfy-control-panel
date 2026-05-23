<script lang="ts">
  import { page } from '$app/stores';
  import { getAuthStore } from '$lib/stores/auth.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import Logo from '$lib/components/ui/Logo.svelte';
  import { setMode, userPrefersMode } from 'mode-watcher';
  import {
    Building2,
    Users,
    LayoutDashboard,
    CreditCard,
    ShieldHalf,
    EllipsisVertical,
    UserRound,
    Palette,
    LogOut,
  } from '@lucide/svelte';

  const metricsItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, disabled: true },
  ];

  const managementItems = [
    { name: 'Negocios', href: '/businesses', icon: Building2, disabled: false },
    { name: 'Usuarios', href: '/users', icon: Users, disabled: false },
    { name: 'Planes', href: '/plans', icon: CreditCard, disabled: true },
    { name: 'Team', href: '/team', icon: ShieldHalf, disabled: true },
  ];

  let currentPath = $derived($page.url.pathname);
  const auth = getAuthStore();
</script>

<Sidebar.Root class="border-r bg-muted/40 flex flex-col h-full">
  <Sidebar.Header class="flex h-14 items-start justify-center border-b px-6">
    <Logo class="h-6 w-auto text-foreground" />
  </Sidebar.Header>

  <Sidebar.Content class="flex-1 overflow-auto py-2">
    <!-- Grupo Métricas -->
    <Sidebar.Group>
      <Sidebar.GroupLabel
        class="px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
      >
        Métricas
      </Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="grid items-start px-4 text-sm font-medium">
          {#each metricsItems as item}
            {@const Icon = item.icon}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={!item.disabled && currentPath.startsWith(item.href)}>
                {#snippet child({ props }: { props: any })}
                  {#if item.disabled}
                    <span
                      class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground/40 cursor-not-allowed select-none w-full"
                      {...props}
                    >
                      <Icon class="h-4 w-4" />
                      <span>{item.name}</span>
                    </span>
                  {:else}
                    <a
                      href={item.href}
                      class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary w-full"
                      {...props}
                    >
                      <Icon class="h-4 w-4" />
                      <span>{item.name}</span>
                    </a>
                  {/if}
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>

    <!-- Grupo Gestión -->
    <Sidebar.Group class="mt-4">
      <Sidebar.GroupLabel
        class="px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
      >
        Gestión
      </Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="grid items-start px-4 text-sm font-medium">
          {#each managementItems as item}
            {@const Icon = item.icon}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={!item.disabled && currentPath.startsWith(item.href)}>
                {#snippet child({ props }: { props: any })}
                  {#if item.disabled}
                    <span
                      class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground/40 cursor-not-allowed select-none w-full"
                      {...props}
                    >
                      <Icon class="h-4 w-4" />
                      <span>{item.name}</span>
                    </span>
                  {:else}
                    <a
                      href={item.href}
                      class="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary w-full"
                      {...props}
                    >
                      <Icon class="h-4 w-4" />
                      <span>{item.name}</span>
                    </a>
                  {/if}
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <!-- User Profile Sidebar Footer matching original Next.js UI -->
  <Sidebar.Footer class="mt-auto border-t p-4">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        class="w-full flex items-center gap-3 rounded-lg p-2 text-left text-sm transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div
          class="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <UserRound class="h-4 w-4" />
        </div>
        <div class="flex-1 min-w-0 leading-tight">
          <p class="truncate font-medium text-foreground text-sm">
            {auth.user?.name || 'Admin'}
          </p>
          <p class="truncate text-xs text-muted-foreground">
            {auth.user?.email || 'admin@ventysfy.com'}
          </p>
        </div>
        <EllipsisVertical class="h-4 w-4 text-muted-foreground shrink-0" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content class="w-56" align="end" side="right" sideOffset={12}>
        <DropdownMenu.Label class="font-normal text-xs text-muted-foreground px-2 py-1.5"
          >Mi Cuenta</DropdownMenu.Label
        >
        <DropdownMenu.Separator />

        <DropdownMenu.Item class="cursor-pointer">Soporte</DropdownMenu.Item>

        <!-- Submenu for Theme Switcher -->
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger class="cursor-pointer flex items-center">
            <Palette class="mr-2 h-4 w-4" />
            <span>Tema</span>
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.CheckboxItem
              checked={userPrefersMode.current === 'light'}
              onclick={() => setMode('light')}
            >
              Claro
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={userPrefersMode.current === 'dark'}
              onclick={() => setMode('dark')}
            >
              Oscuro
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.Separator />
            <DropdownMenu.CheckboxItem
              checked={userPrefersMode.current === 'system'}
              onclick={() => setMode('system')}
            >
              Sistema
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />

        <DropdownMenu.Item class="p-0">
          <form action="/login?/logout" method="POST" class="w-full">
            <button
              type="submit"
              class="w-full flex items-center px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-sm cursor-pointer transition-colors text-left"
            >
              <LogOut class="mr-2 h-4 w-4 shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.Footer>
</Sidebar.Root>
