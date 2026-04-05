CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name_en VARCHAR(100),
    display_name_bn VARCHAR(100),
    price_bdt NUMERIC(10, 2),
    ai_queries_per_day INTEGER,
    features TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    started_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usage_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    action_type VARCHAR(30) NOT NULL,
    query_text TEXT,
    tokens_used INTEGER,
    llm_provider VARCHAR(50),
    cost_usd NUMERIC(10, 6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_subs_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subs_status ON user_subscriptions(status);
CREATE INDEX idx_usage_user ON usage_log(user_id);
CREATE INDEX idx_usage_created ON usage_log(created_at);
