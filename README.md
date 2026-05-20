# VentySfy Admin Panel

Panel de control (Backoffice) de VentySfy. Construido con **Svelte 5** y **SvelteKit**, ofrece una interfaz administrativa robusta, rápida y moderna para la gestión de negocios, suscripciones, y configuración de facturación electrónica.

## Tecnologías Principales

- **Framework:** Svelte 5 + SvelteKit
- **Estilos:** Tailwind CSS
- **Componentes UI:** Shadcn Svelte / Bits UI / Lucide Icons
- **Gestión de Formularios:** SvelteKit Superforms con Zod
- **Gestión de Estado y Consultas:** TanStack Query (Svelte Query) y Svelte 5 Runes (`$state`, `$derived`, `$effect`)
- **Gestión de Fechas:** `@internationalized/date`

## Características Principales

- **Autenticación y Sesiones:** Inicio de sesión y manejo de sesiones a través de un proxy seguro.
- **Gestión de Negocios:** Listado y detalles de los negocios, incluyendo información de suscripción y estado.
- **Facturación Electrónica (Colombia):** 
  - Gestión de credenciales y configuración técnica para la emisión de comprobantes (DIAN).
  - Historial reactivo de documentos fiscales (Facturas, Notas Crédito, POS) con filtrado avanzado por texto, estado (Aceptado, Rechazado, Contingencia, etc.) y rangos de fecha mediante *Datepickers* premium.
  - Proxy local hacia la API de Facturación (`/api/invoicing/colombia`).
  - Depuración de peticiones al proveedor de facturación (Taxxa).
- **Selector de Entorno:** Herramienta integrada en el login para cambiar la URL base de los endpoints y apuntar a desarrollo o producción.

## Estructura del Proyecto

```
src/
├── lib/               # Componentes compartidos, utilidades y configuración de UI (Shadcn)
├── modules/           # Lógica encapsulada por dominios (auth, businesses, invoicing, etc.)
│   └── invoicing/     # Store, queries, schemas y componentes específicos de facturación
├── routes/            # Sistema de enrutamiento de SvelteKit
│   ├── (private)/     # Rutas protegidas (ej. dashboard, negocios)
│   ├── api/           # Endpoints locales (set-env, proxy a servicios externos)
│   └── login/         # Página pública de autenticación
```

## Configuración y Variables de Entorno

Puedes configurar el entorno de pruebas creando un archivo `.env` en la raíz del proyecto. Las credenciales predeterminadas se pueden cargar automáticamente en el login definiendo:

```env
DEFAULT_ADMIN_EMAIL=admin@ventysfy.com
DEFAULT_ADMIN_PASSWORD=tu-contraseña-segura
```

## Desarrollo

Una vez que hayas instalado las dependencias con `pnpm install`, inicia el servidor de desarrollo:

```sh
pnpm run dev
```

O inicia el servidor y abre la aplicación en una nueva pestaña del navegador automáticamente:

```sh
pnpm run dev -- --open
```

## Construcción para Producción

Para crear una versión optimizada de producción de la aplicación:

```sh
pnpm run build
```

Puedes previsualizar el build generado ejecutando `pnpm run preview`.
