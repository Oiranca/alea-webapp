# Alea WebApp (Monorepo)

Monorepo para la asociación cultural de juegos (rol y mesa, nunca casino).

## Estructura

- `apps/web`: Frontend Next.js (App Router)
- `apps/api`: Backend NestJS
- `packages/types`: Tipos compartidos
- `packages/ui`: UI compartida (futuro)
- `packages/config`: Configuración compartida

## Requisitos funcionales clave

- Login por número de socio o email + contraseña.
- Registro con contraseña robusta (mínimo 12, alfanumérica + símbolo).
- 6 salas con mesas de tipo: `small`, `large`, `removable_top`.
- Reservas por fecha/hora y QR por mesa.
- Regla `removable_top`: si se reserva `top` o `bottom`, bloquea la otra superficie en el mismo horario.
- Dashboard admin: gestión de usuarios (10 por página, búsqueda, editar/eliminar sin ver/modificar contraseña), salas, mesas y reservas.
- i18n: español e inglés.
- Front conectado a API (sin lógica de datos persistente en UI).

## Accesibilidad y responsive

- Objetivo: WCAG 2.2 AA.
- Navegación completa por teclado.
- Contrastes altos y focus visibles.
- Estructura semántica y etiquetas ARIA donde aplique.

## Próximos pasos

1. `pnpm install`
2. `pnpm dev:web`
3. `pnpm dev:api`
