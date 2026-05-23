<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { loginSchema } from '$modules/auth/schemas';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import * as Select from '$lib/components/ui/select';
  import Logo from '$lib/components/ui/Logo.svelte';
  import { CircleAlert, LoaderCircle } from '@lucide/svelte';

  let { data, form: actionForm } = $props();
  let formActionError = $derived((actionForm as any)?.error);

  // Env selector state
  let selectedEnv = $state(data.env ?? 'dev');
  let isSettingEnv = $state(false);
  const envOptions = [
    { value: 'dev', label: 'UAT' },
    { value: 'prod', label: 'Prod' },
  ];

  async function handleEnvChange(value: string) {
    if (!value) return;
    isSettingEnv = true;
    try {
      await fetch('/api/set-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ env: value }),
      });
    } finally {
      isSettingEnv = false;
    }
  }

  // Svelte 5 reactive trigger when selectedEnv changes (excluding initial load)
  let isInitial = true;
  $effect(() => {
    const current = selectedEnv;
    if (isInitial) {
      isInitial = false;
      return;
    }
    handleEnvChange(current);
  });

  const { form, errors, enhance, submitting } = superForm(data.form, {
    validators: zod4Client(loginSchema),
    onResult: ({ result }) => {
      if (result.type === 'failure') {
        formActionError = (result.data as any)?.error || 'Error de autenticación';
      } else if (result.type === 'error') {
        formActionError = result.error?.message || 'Error interno del servidor';
      } else {
        formActionError = undefined;
      }
    },
  });
</script>

<svelte:head>
  <title>Iniciar sesión — VentySfy Admin</title>
</svelte:head>

<div
  class="relative min-h-screen flex justify-center items-start md:items-center md:grid lg:grid-cols-2"
>
  <!-- Env selector (top-right) using Shadcn-Svelte Select component -->
  <div class="py-2 absolute right-4 top-4 md:right-8 md:top-8 z-10">
    <Select.Root type="single" disabled={isSettingEnv} bind:value={selectedEnv}>
      <Select.Trigger class="w-[80px] h-7 text-xs">
        {envOptions.find((option) => option.value === selectedEnv)!.label}
      </Select.Trigger>
      <Select.Content>
        {#each envOptions as option}
          <Select.Item class="text-xs" value={option.value}>{option.label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>

  <!-- Left panel (desktop only) featuring the original Next.js logo -->
  <div
    class="relative hidden h-full flex-col bg-muted p-10 text-card-foreground dark:border-r lg:flex"
  >
    <Logo class="relative z-20 w-40 flex justify-start" />
    <div class="relative z-20 mt-auto">
      <blockquote class="space-y-2">
        <p class="text-lg">
          Con VentySfy Admin hemos centralizado el control total de nuestra app.
          <br />
          ahora podemos monitorear negocios, ver métricas clave y gestionar funcionalidades de forma sencilla
          y eficiente.
        </p>
      </blockquote>
    </div>
  </div>

  <!-- Right panel / login form -->
  <div class="p-6 lg:p-8 flex justify-center items-center w-full md:w-auto min-h-dvh md:min-h-auto">
    <div class="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p class="text-sm text-muted-foreground">Bienvenido al panel de control de VentySfy</p>
      </div>

      {#if formActionError}
        <Alert variant="destructive">
          <CircleAlert class="h-4 w-4" />
          <AlertDescription>{formActionError}</AlertDescription>
        </Alert>
      {/if}

      <form method="POST" action="?/login" use:enhance class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            bind:value={$form.email}
            placeholder="admin@ventysfy.com"
            disabled={$submitting}
          />
          {#if $errors.email}
            <p class="text-sm text-destructive">{$errors.email}</p>
          {/if}
        </div>

        <div class="space-y-2">
          <Label for="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            bind:value={$form.password}
            disabled={$submitting}
          />
          {#if $errors.password}
            <p class="text-sm text-destructive">{$errors.password}</p>
          {/if}
        </div>

        <Button type="submit" class="w-full" disabled={$submitting}>
          {#if $submitting}
            <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          {:else}
            Iniciar sesión
          {/if}
        </Button>
      </form>

      <span class="text-xs text-center">
        <span class="text-muted-foreground">version</span>&nbsp;
        <span>1.04</span>
      </span>
    </div>
  </div>
</div>
