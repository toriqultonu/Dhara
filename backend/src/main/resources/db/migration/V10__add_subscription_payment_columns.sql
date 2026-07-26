-- Payment integration support:
-- 1. transaction_id on user_subscriptions to track SSLCommerz transactions (PENDING → ACTIVE flow)
-- 2. duration_days on subscription_plans so activation can compute expires_at

ALTER TABLE user_subscriptions
    ADD COLUMN transaction_id VARCHAR(64);

CREATE UNIQUE INDEX idx_user_subs_transaction_id
    ON user_subscriptions (transaction_id)
    WHERE transaction_id IS NOT NULL;

ALTER TABLE subscription_plans
    ADD COLUMN duration_days INTEGER NOT NULL DEFAULT 30;
