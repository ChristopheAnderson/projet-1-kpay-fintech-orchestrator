-- ==========================================================
-- Database Schema Initialization : KPAY PAYMENT ORCHESTRATOR
-- Target DBMS : PostgreSQL 16
-- ==========================================================

-- Types énumérés pour la rigueur des données
CREATE TYPE payment_operator AS ENUM ('MTN_MOMO', 'MOOV_MONEY', 'CELTIIS_CASH', 'VISA_CARD');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE api_key_environment AS ENUM ('TEST', 'LIVE');
CREATE TYPE webhook_status AS ENUM ('PENDING', 'DELIVERED', 'FAILED');

-- 1. Table des Marchands (Merchants / Entreprises partenaires)
CREATE TABLE IF NOT EXISTS merchants (
    id BIGSERIAL PRIMARY KEY,
    business_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL,
    country_code VARCHAR(5) DEFAULT 'BJ',
    webhook_url VARCHAR(255),
    webhook_secret VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Clés API (Authentication & Rate Limiting)
CREATE TABLE IF NOT EXISTS api_keys (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    environment api_key_environment DEFAULT 'TEST',
    public_key VARCHAR(80) NOT NULL UNIQUE,
    secret_hash VARCHAR(255) NOT NULL,
    label VARCHAR(100) DEFAULT 'Default API Key',
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table Principale des Transactions Financières
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,
    reference VARCHAR(50) NOT NULL UNIQUE,
    external_reference VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
    currency VARCHAR(5) DEFAULT 'XOF',
    operator payment_operator NOT NULL,
    status payment_status DEFAULT 'PENDING',
    customer_phone VARCHAR(30) NOT NULL,
    customer_email VARCHAR(150),
    idempotency_key VARCHAR(100) UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des Livraisons de Webhooks Asynchrones (Audit & Retries)
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    event_type VARCHAR(60) NOT NULL,
    payload JSONB NOT NULL,
    response_code INT,
    response_body TEXT,
    attempts INT DEFAULT 0,
    status webhook_status DEFAULT 'PENDING',
    next_retry_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour la haute performance
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_operator ON transactions(operator);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency ON transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry ON webhook_deliveries(status, next_retry_at);

-- Données initiales de démonstration réalistes
INSERT INTO merchants (id, business_name, contact_email, phone_number, country_code, webhook_url, webhook_secret)
VALUES 
(1, 'Global Commerce SARL', 'finances@global-commerce.com', '+229 97 00 11 22', 'BJ', 'https://webhook.site/merchant-callback', 'whsec_merchant_live_secret_99818')
ON CONFLICT (id) DO NOTHING;

INSERT INTO api_keys (merchant_id, environment, public_key, secret_hash, label)
VALUES 
(1, 'LIVE', 'kpay_live_pub_78a1bc92e0f4', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Production Key'),
(1, 'TEST', 'kpay_test_pub_34d9ef11a8b2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sandbox Key')
ON CONFLICT (public_key) DO NOTHING;

INSERT INTO transactions (merchant_id, reference, external_reference, amount, fee, currency, operator, status, customer_phone, customer_email, idempotency_key)
VALUES
(1, 'KPAY_8F9A2B3C4D11', 'TELCO_9482910', 45000.00, 675.00, 'XOF', 'MTN_MOMO', 'SUCCESS', '+229 97 00 12 34', 'client@example.bj', 'idemp_8910283401'),
(1, 'KPAY_3E7D1C5B9A22', 'TELCO_8192034', 12500.00, 175.00, 'XOF', 'MOOV_MONEY', 'SUCCESS', '+229 95 11 22 33', 'client2@example.bj', 'idemp_7718293012'),
(1, 'KPAY_9C2D4E6F8A33', NULL, 80000.00, 960.00, 'XOF', 'CELTIIS_CASH', 'PENDING', '+229 40 88 99 00', NULL, 'idemp_1192837465'),
(1, 'KPAY_1A5C7E9B2D44', 'VISA_AUTH_9921', 150000.00, 3750.00, 'XOF', 'VISA_CARD', 'SUCCESS', '+229 96 44 55 66', 'finance@entreprise.bj', 'idemp_4455667788')
ON CONFLICT (reference) DO NOTHING;
