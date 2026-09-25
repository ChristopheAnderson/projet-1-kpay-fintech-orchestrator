# 💳 KPay / PayHub Africa — FinTech Payment Gateway & Orchestrator

[![PHP Version](https://img.shields.io/badge/PHP-8.3-777BB4?style=flat&logo=php)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat&logo=laravel)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache%20%26%20Queues-DC382D?style=flat&logo=redis)](https://redis.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

Plateforme SaaS B2B d'orchestration et de passerelle de paiements mobiles et bancaires pour l'Afrique de l'Ouest (MTN MoMo, Moov Money, Celtiis Cash, Cartes Visa/Mastercard). Conçue selon une architecture modulaire, résiliente aux pannes, idempotente et orientée événements.

---

## 🏛️ Architecture Globale du Projet

```mermaid
graph TD
    Client[Client Marchand / Client Web / Mobile Flutter] -->|HTTPS REST API / JSON| Nginx[Reverse Proxy Nginx]
    Nginx -->|Proxy Pass| LaravelAPI[Backend Laravel 11 API]
    
    subgraph Backend [Backend Laravel 11]
        Sanctum[Laravel Sanctum & API Keys]
        RateLimit[Rate Limiter & Idempotency Filter]
        PaymentEngine[Payment Orchestration Service]
        WebhookService[Webhook Dispatcher Engine]
        
        Sanctum --> RateLimit
        RateLimit --> PaymentEngine
        PaymentEngine --> WebhookService
    end

    subgraph Data [Persistance & Traitement Asynchrone]
        Postgres[(PostgreSQL 16 - Transactions & Ledgers)]
        RedisCache[(Redis - Cache & Rate Limiting)]
        RedisQueue[(Redis Horizon - Queues & Workers)]
    end

    PaymentEngine -->|Persistance ACID| Postgres
    RateLimit -->|Store Keys| RedisCache
    WebhookService -->|Dispatch Jobs| RedisQueue

    subgraph External [Passerelles Opérateurs Mobiles]
        MTN[MTN MoMo API]
        Moov[Moov Money Gateway]
        Celtiis[Celtiis Cash API]
    end

    PaymentEngine -->|HTTP Client Guzzle| MTN
    PaymentEngine -->|HTTP Client Guzzle| Moov
    PaymentEngine -->|HTTP Client Guzzle| Celtiis

    subgraph Frontend [Frontend Dashboard Marchand]
        ReactApp[React 18 + TypeScript + Vite]
        ReactQuery[TanStack Query - Data Fetching]
        Tailwind[TailwindCSS + Radix UI Design System]
        Recharts[Recharts - Financial Analytics]
    end

    ReactApp -->|Bearer Auth / API REST| LaravelAPI
```

---

## 📂 Structure du Répertoire

```text
projet-1-kpay-fintech-orchestrator/
├── docker-compose.yml          # Orchestration complète conteneurisée
├── README.md                   # Documentation technique générale
├── backend/                    # API Laravel 11
│   ├── app/
│   │   ├── Http/Controllers/   # Transactions, Webhooks, Wallets, ApiKeys
│   │   ├── Http/Requests/      # Validation FormRequest
│   │   ├── Http/Resources/     # API Transformers
│   │   ├── Models/             # Transaction, Merchant, WebhookLog, Wallet
│   │   ├── Services/           # PaymentOrchestrationService, MoMoProvider
│   │   └── Jobs/               # DispatchWebhookJob (Exponential Backoff)
│   ├── config/
│   ├── database/migrations/    # Schéma des tables financières
│   ├── routes/api.php          # Endpoints v1
│   ├── composer.json
│   └── .env.example
└── frontend/                   # Dashboard Marchand React (TypeScript)
    ├── src/
    │   ├── api/                # Client Axios & endpoints
    │   ├── components/         # Cartes KPI, Tableau de transactions, Modales
    │   ├── pages/              # Dashboard, Transactions, Webhooks, Clés API
    │   ├── types/              # Définitions TypeScript complètes
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🚀 Démarrage Rapide avec Docker

```bash
# 1. Cloner le repository
cd projet-1-kpay-fintech-orchestrator

# 2. Lancer les services (PostgreSQL, Redis, Laravel API, React Dashboard)
docker-compose up -d --build

# 3. Initialiser le backend
docker-compose exec backend php artisan migrate --seed
docker-compose exec backend php artisan key:generate

# 4. Accès aux applications
# Backend API: http://localhost:8000/api/v1
# Frontend Dashboard: http://localhost:3000
```
