-- Add institution_name column to items_table
ALTER TABLE items_table ADD COLUMN IF NOT EXISTS institution_name text;

-- Update the items view to include institution_name
DROP VIEW IF EXISTS transactions CASCADE;
DROP VIEW IF EXISTS accounts CASCADE;
DROP VIEW IF EXISTS items CASCADE;

-- Recreate items view with institution_name
CREATE VIEW items
AS
  SELECT
    id,
    plaid_item_id,
    user_id,
    plaid_access_token,
    plaid_institution_id,
    institution_name,
    status,
    created_at,
    updated_at,
    transactions_cursor
  FROM
    items_table;

-- Recreate accounts view
CREATE VIEW accounts
AS
  SELECT
    a.id,
    a.plaid_account_id,
    a.item_id,
    i.plaid_item_id,
    i.user_id,
    i.institution_name,
    a.name,
    a.mask,
    a.official_name,
    a.current_balance,
    a.available_balance,
    a.iso_currency_code,
    a.unofficial_currency_code,
    a.type,
    a.subtype,
    a.created_at,
    a.updated_at
  FROM
    accounts_table a
    LEFT JOIN items i ON i.id = a.item_id;

-- Recreate transactions view
CREATE VIEW transactions
AS
  SELECT
    t.id,
    t.account_id,
    t.plaid_transaction_id,
    t.plaid_category_id,
    t.category,
    t.category_data,
    t.type,
    t.name,
    t.amount,
    t.iso_currency_code,
    t.unofficial_currency_code,
    t.date,
    t.pending,
    t.account_owner,
    a.item_id,
    a.plaid_account_id
  FROM
    transactions_table t
    LEFT JOIN accounts a ON a.id = t.account_id;
