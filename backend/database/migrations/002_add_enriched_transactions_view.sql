-- Migration to add enriched transactions view
-- This view joins transactions with accounts and items to provide:
-- 1. Account names (not just IDs)
-- 2. Materialized primary category from JSONB
-- 3. Institution names

DROP VIEW IF EXISTS transactions_enriched CASCADE;

CREATE VIEW transactions_enriched AS
  SELECT
    -- Transaction fields
    t.id,
    t.plaid_transaction_id,
    t.type,
    t.name AS transaction_name,
    t.amount,
    t.iso_currency_code,
    t.unofficial_currency_code,
    t.date,
    t.pending,
    t.account_owner,
    t.created_at,
    t.updated_at,

    -- Legacy category fields
    t.plaid_category_id,
    t.category AS legacy_category,

    -- Materialized primary category from JSONB using #>> for nested path
    -- Prettify: convert to lowercase, replace underscores with spaces, then capitalize first letter of each word
    INITCAP(REPLACE(LOWER(t.category_data#>>'{personal_finance_category,primary}'), '_', ' ')) AS primary_category,
    t.category_data#>>'{personal_finance_category,detailed}' AS detailed_category,
    t.category_data#>>'{personal_finance_category,confidence_level}' AS category_confidence,

    -- Keep full category_data for additional processing if needed
    t.category_data,

    -- simple income vs expense tagging
    CASE WHEN i.institution_name = 'Capital One' and UPPER(t.name) like '%DATABRICKS%' then 'Income' else 'Expense' end as transaction_type,

    -- Account information (enriched with friendly names)
    t.account_id,
    a.plaid_account_id,
    a.name || '_' || a.official_name AS account_name,
    a.mask AS account_mask,
    a.type AS account_type,
    a.subtype AS account_subtype,

    -- Item/Institution information
    a.item_id,
    i.plaid_item_id,
    i.institution_name,

    -- User reference
    i.user_id

  FROM transactions_table t
  LEFT JOIN accounts_table a ON t.account_id = a.id
  LEFT JOIN items_table i ON a.item_id = i.id;