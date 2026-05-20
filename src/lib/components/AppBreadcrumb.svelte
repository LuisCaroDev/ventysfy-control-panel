<script lang="ts">
  import { page } from '$app/stores';
  import * as Breadcrumb from '$lib/components/ui/breadcrumb';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { replacePathParams } from '$lib/utils';
  import { useBusiness } from '$modules/businesses/queries';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';

  interface StepComponentType {
    type: 'link' | 'label';
  }
  interface StepComponentTypeSelect {
    type: 'select';
    options: { text: string; value: string }[];
  }

  interface LabelOptions {
    label?: string;
    component: StepComponentType | StepComponentTypeSelect;
  }

  const labels: Record<string, LabelOptions> = {
    '/dashboard': { label: 'Dashboard', component: { type: 'link' } },
    '/businesses': { label: 'Negocios', component: { type: 'link' } },
    '/businesses/[businessId]': { component: { type: 'link' } },
    '/team': { label: 'Equipo', component: { type: 'link' } },
    '/plans': { label: 'Planes', component: { type: 'link' } },
    '/plans/[dynamic]': { label: 'Plan', component: { type: 'link' } },
  };

  let businessId = $derived($page.params.businessId || '');
  let businessQuery = $derived(useBusiness(businessId));
  let businessName = $derived(businessQuery.data?.tradeName || businessId);

  let breadcrumbs = $derived.by(() => {
    const paths = $page.url.pathname;
    const params = $page.params;

    const flippedParams = new Map<string, string>();
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        flippedParams.set(value, key);
      }
    }

    const pathNames = paths.split('/').filter((path) => path);
    const items: Array<{
      key: string;
      name: string;
      label: string;
      url: string;
      isLast: boolean;
      component?: StepComponentType | StepComponentTypeSelect;
    }> = [];

    for (let i = 0; i < pathNames.length; i++) {
      const name = pathNames[i];
      const isLast = i === pathNames.length - 1;

      const urlCreator = [''];
      const keyCreator = [''];
      for (let j = 0; j <= i; j++) {
        const segment = pathNames[j];
        urlCreator.push(segment);
        const step = flippedParams.has(segment) ? `[${flippedParams.get(segment)}]` : segment;
        keyCreator.push(step);
      }

      const url = urlCreator.join('/');
      const key = keyCreator.join('/');
      const component = labels[key]?.component;
      let label = labels[key]?.label ?? name;

      if (key === '/businesses/[businessId]') {
        label = businessName;
      }

      items.push({
        key,
        name,
        label,
        url,
        isLast,
        component,
      });
    }

    return items;
  });
</script>

<Breadcrumb.Root class="flex">
  <Breadcrumb.List>
    {#each breadcrumbs as breadcrumb, index (breadcrumb.key)}
      <Breadcrumb.Item>
        {#if breadcrumb.isLast}
          <Breadcrumb.Page>{breadcrumb.label}</Breadcrumb.Page>
        {:else if breadcrumb.component?.type === 'select'}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              class="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none"
            >
              <span>{breadcrumb.label}</span>
              <ChevronDown class="h-4 w-4 shrink-0" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              {#each breadcrumb.component.options || [] as option}
                {@const finalPath = replacePathParams(option.value, $page.params)}
                <DropdownMenu.Item class="p-0">
                  <a
                    href={finalPath}
                    class="w-full px-2 py-1.5 text-sm text-foreground hover:bg-muted rounded-sm transition-colors block"
                  >
                    {option.text}
                  </a>
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        {:else}
          <Breadcrumb.Link href={breadcrumb.url}>
            {breadcrumb.label}
          </Breadcrumb.Link>
        {/if}
      </Breadcrumb.Item>

      {#if !breadcrumb.isLast}
        <Breadcrumb.Separator />
      {/if}
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
