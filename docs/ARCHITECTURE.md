# Arquitectura inicial (Monorepo)

## Apps
- `apps/web`: Next.js 15, responsive + a11y (WCAG 2.2 AA), i18n ES/EN.
- `apps/api`: NestJS (pendiente implementación completa), cookies HTTP-only.

## Packages
- `packages/types`: modelos compartidos de dominio.
- `packages/ui`: espacio para design system reusable.
- `packages/config`: shared configs (eslint, tsconfig, vitest) en siguientes fases.

## Dominio
- 6 salas
- Mesas: `small`, `large`, `removable_top`
- Regla crítica: en `removable_top`, reservar `top` bloquea `bottom` en el mismo intervalo.

## Seguridad y privacidad
- Nunca exponer contraseña en UI/admin.
- Admin puede editar email/rol y borrar usuarios.
- Login por `memberNumber` o `email`.

## Accesibilidad
- Skip link
- Contraste alto
- Focus visible
- Semántica HTML

## Roadmap corto
1. Bootstrap real de NestJS + Next.js con Tailwind/shadcn/next-intl/TanStack Query/Zod.
2. Mock API + contratos NestJS.
3. Auth + dashboard admin + reservas + QR.
4. Tests Vitest + RTL (unit/component/integration).
