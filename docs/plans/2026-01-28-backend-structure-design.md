# Backend Structure Design - Clean Architecture + DDD

## Decisions

- **Framework:** Elysia (Bun)
- **Architecture:** Clean Architecture + DDD (pragmatic)
- **Route organization:** Plugins por dominio (idiomatico Elysia)
- **Dependency injection:** Manual (composition root)
- **Tests:** Adicionar quando houver logica de negocio real

## Directory Structure

```
apps/api/src/
├── index.ts                              # Entry point
├── container.ts                          # Composition root
├── domain/
│   └── health/
│       ├── health.entity.ts              # HealthStatus entity
│       └── health.repository.ts          # IHealthRepository interface
├── application/
│   └── health/
│       └── get-health-status.use-case.ts # GetHealthStatusUseCase
├── infrastructure/
│   └── health/
│       └── health.repository.ts          # HealthRepository implementation
└── presentation/
    └── health/
        └── health.plugin.ts              # GET /health plugin
```

## Layer Rules

- **Domain:** Entities, value objects, repository interfaces. No external dependencies.
- **Application:** Use cases. Depends only on domain interfaces.
- **Infrastructure:** Concrete implementations of domain interfaces (DB, APIs).
- **Presentation:** Elysia plugins (routes). Receives use cases via parameter.

Dependency direction: `presentation → application → domain ← infrastructure`

## Healthcheck Flow

1. `index.ts` initializes container and Elysia server
2. `container.ts` wires: `HealthRepository` → `GetHealthStatusUseCase`
3. `health.plugin.ts` receives use case, exposes `GET /health`
4. Handler calls use case, which calls repository via interface
5. Returns `{ status: "ok", timestamp: "..." }`

## Configuration

- Port: `process.env.PORT ?? 3000`
- TypeScript: extends root tsconfig, strict mode
- Scripts: `dev` (bun --watch), `start` (bun)
