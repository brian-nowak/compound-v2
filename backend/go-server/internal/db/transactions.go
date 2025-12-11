package db

import (
	"compound/go-server/pkg/models"
	"context"
	"fmt"
	"strings"
)

// CreateOrUpdateTransaction creates or updates a transaction in the database
func CreateOrUpdateTransaction(ctx context.Context, accountID int, plaidTransactionID string, categoryData interface{}, txType, name string, amount float64, isoCurrencyCode, unofficialCurrencyCode string, date string, pending bool, accountOwner *string) (*models.Transaction, error) {
	query := `INSERT INTO transactions_table (account_id, plaid_transaction_id, category_data, type, name, amount, iso_currency_code, unofficial_currency_code, date, pending, account_owner, created_at, updated_at)
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
	          ON CONFLICT (plaid_transaction_id) DO UPDATE SET
	            type = EXCLUDED.type,
	            name = EXCLUDED.name,
	            amount = EXCLUDED.amount,
	            category_data = EXCLUDED.category_data,
	            iso_currency_code = EXCLUDED.iso_currency_code,
	            unofficial_currency_code = EXCLUDED.unofficial_currency_code,
	            pending = EXCLUDED.pending,
	            account_owner = EXCLUDED.account_owner,
	            updated_at = NOW()
	          RETURNING id, account_id, plaid_transaction_id, type, name, amount, iso_currency_code, unofficial_currency_code, date, pending, account_owner, created_at, updated_at`

	transaction := &models.Transaction{}
	err := conn.QueryRow(ctx, query, accountID, plaidTransactionID, categoryData, txType, name, amount, isoCurrencyCode, unofficialCurrencyCode, date, pending, accountOwner).Scan(
		&transaction.ID,
		&transaction.AccountID,
		&transaction.PlaidTransactionID,
		&transaction.Type,
		&transaction.Name,
		&transaction.Amount,
		&transaction.IsoCurrencyCode,
		&transaction.UnofficialCurrencyCode,
		&transaction.Date,
		&transaction.Pending,
		&transaction.AccountOwner,
		&transaction.CreatedAt,
		&transaction.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}

	return transaction, nil
}

// GetTransactionsByAccountID retrieves all transactions for a specific account
func GetTransactionsByAccountID(ctx context.Context, accountID int) ([]*models.Transaction, error) {
	query := `SELECT id, account_id, plaid_transaction_id, plaid_category_id, category, type, name, amount, iso_currency_code, unofficial_currency_code, date, pending, account_owner, created_at, updated_at
	          FROM transactions_table WHERE account_id=$1`

	rows, err := conn.Query(ctx, query, accountID)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var transactions []*models.Transaction
	for rows.Next() {
		transaction := &models.Transaction{}
		err := rows.Scan(
			&transaction.ID,
			&transaction.AccountID,
			&transaction.PlaidTransactionID,
			&transaction.PlaidCategoryID,
			&transaction.Category,
			&transaction.Type,
			&transaction.Name,
			&transaction.Amount,
			&transaction.IsoCurrencyCode,
			&transaction.UnofficialCurrencyCode,
			&transaction.Date,
			&transaction.Pending,
			&transaction.AccountOwner,
			&transaction.CreatedAt,
			&transaction.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("row scan failed: %w", err)
		}
		transactions = append(transactions, transaction)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration failed: %w", err)
	}

	return transactions, nil
}

// GetTransactionByID retrieves a single transaction by ID
func GetTransactionByID(ctx context.Context, transactionID int) (*models.Transaction, error) {
	query := `SELECT id, account_id, plaid_transaction_id, plaid_category_id, category, type, name, amount, iso_currency_code, unofficial_currency_code, date, pending, account_owner, created_at, updated_at
	          FROM transactions_table WHERE id=$1`

	transaction := &models.Transaction{}
	err := conn.QueryRow(ctx, query, transactionID).Scan(
		&transaction.ID,
		&transaction.AccountID,
		&transaction.PlaidTransactionID,
		&transaction.PlaidCategoryID,
		&transaction.Category,
		&transaction.Type,
		&transaction.Name,
		&transaction.Amount,
		&transaction.IsoCurrencyCode,
		&transaction.UnofficialCurrencyCode,
		&transaction.Date,
		&transaction.Pending,
		&transaction.AccountOwner,
		&transaction.CreatedAt,
		&transaction.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}

	return transaction, nil
}

// GetTransactionByUserID retrieves all transactions for a specific user
// Uses transactions_enriched view to include primary_category from JSONB category_data
func GetTransactionByUserID(ctx context.Context, userID int) ([]*models.Transaction, error) {
	query := `SELECT id, account_id, plaid_transaction_id, plaid_category_id, legacy_category, primary_category, type, transaction_name AS name, amount, iso_currency_code, unofficial_currency_code, date, pending, account_owner, created_at, updated_at
	          FROM transactions_enriched
	          WHERE user_id = $1
	          ORDER BY date DESC`

	rows, err := conn.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var transactions []*models.Transaction
	for rows.Next() {
		transaction := &models.Transaction{}
		var primaryCategory *string
		err := rows.Scan(
			&transaction.ID,
			&transaction.AccountID,
			&transaction.PlaidTransactionID,
			&transaction.PlaidCategoryID,
			&transaction.Category, // legacy_category from view
			&primaryCategory,       // primary_category from view
			&transaction.Type,
			&transaction.Name, // transaction_name aliased as name
			&transaction.Amount,
			&transaction.IsoCurrencyCode,
			&transaction.UnofficialCurrencyCode,
			&transaction.Date,
			&transaction.Pending,
			&transaction.AccountOwner,
			&transaction.CreatedAt,
			&transaction.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("row scan failed: %w", err)
		}
		// Use primary_category if available, otherwise fall back to legacy category
		if primaryCategory != nil && *primaryCategory != "" {
			transaction.PrimaryCategory = primaryCategory
			// Also set Category for backward compatibility
			if transaction.Category == nil || *transaction.Category == "" {
				transaction.Category = primaryCategory
			}
		}
		transactions = append(transactions, transaction)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration failed: %w", err)
	}

	return transactions, nil
}

// DeleteTransaction deletes a transaction from the database
func DeleteTransaction(ctx context.Context, transactionID int) error {
	query := `DELETE FROM transactions_table WHERE id=$1`

	result, err := conn.Exec(ctx, query, transactionID)
	if err != nil {
		return fmt.Errorf("query failed: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("transaction not found")
	}

	return nil
}

// DeleteTransactionByPlaidID deletes a transaction from the database by its Plaid ID
func DeleteTransactionByPlaidID(ctx context.Context, plaidTransactionID string) error {
	query := `DELETE FROM transactions_table WHERE plaid_transaction_id=$1`

	result, err := conn.Exec(ctx, query, plaidTransactionID)
	if err != nil {
		return fmt.Errorf("query failed: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("transaction not found")
	}

	return nil
}

// TransactionFilter for dynamic queries
type TransactionFilter struct {
	Field    string
	Operator string
	Value    interface{}
}

type TransactionAggregation struct {
	Function string
	Field    string
	Alias    string
}

// QueryTransactions
func QueryTransactionsDynamic(
	ctx context.Context,
	userID int,
	aggregation TransactionAggregation,
	filters []TransactionFilter,
) (float64, error) {
	// build base query
	baseQuery := `SELECT %s(%s) as %s
				  FROM transactions_table t
				  LEFT JOIN accounts_table a ON t.account_id = a.id
	              LEFT JOIN items_table i ON a.item_id = i.id
	              WHERE i.user_id = $1`

	args := []interface{}{userID}
	argCounter := 2

	// build where clause from filters
	whereClauses := []string{}
	for _, filter := range filters {
		clause, arg := buildFilterClause(filter, argCounter)
		whereClauses = append(whereClauses, clause)
		args = append(args, arg)
		argCounter++
	}

	// construct final query
	query := fmt.Sprintf(
		baseQuery,
		aggregation.Function,
		aggregation.Field,
		aggregation.Alias,
	)

	// add filter clauses
	if len(whereClauses) > 0 {
		query += " AND " + strings.Join(whereClauses, " AND ")
	}

	// execute built query
	var result float64
	err := conn.QueryRow(ctx, query, args...).Scan(&result)
	if err != nil {
		return 0, fmt.Errorf("aggregation query failed: %w", err)
	}

	return result, nil
}

// buildFilterClause converts a TransactionFilter into a SQL WHERE clause fragment
func buildFilterClause(filter TransactionFilter, argNum int) (string, interface{}) {
	placeholder := fmt.Sprintf("$%d", argNum)

	switch filter.Operator {
	case "<", ">", "<=", "=>", "=", "!=":
		return fmt.Sprintf("t.%s %s %s", filter.Field, filter.Operator, placeholder), filter.Value

	case "BETWEEN":
		// Expects Value to be a slice/array with 2 elements [start, end]
		// Note: For BETWEEN, you'll need to handle 2 parameters - see enhanced version below
		return fmt.Sprintf("t.%s BETWEEN %s AND %s", filter.Field, placeholder, placeholder), filter.Value

	case "IN":
		// Expects Value to be a slice
		return fmt.Sprintf("t.%s IN (%s)", filter.Field, placeholder), filter.Value

	case "LIKE", "ILIKE":
		return fmt.Sprintf("t.%s %s %s", filter.Field, filter.Operator, placeholder), filter.Value

	default:
		// Default to equality
		return fmt.Sprintf("t.%s = %s", filter.Field, placeholder), filter.Value
	}
}

// GetUserTotalIncome calculates total income for a user
func GetUserTotalIncome(ctx context.Context, userID int, startDate, endDate *string) (float64, error) {
	aggregation := TransactionAggregation{
		Function: "COALESCE(SUM(ABS",
		Field:    "t.amount))",
		Alias:    "total_income",
	}

	filters := []TransactionFilter{
		{
			Field:    "amount",
			Operator: "<",
			Value:    0,
		},
		{
			Field:    "name",
			Operator: "ILIKE",
			Value:    "%DATABRICKS%",
		},
	}

	// add date range filters
	if startDate != nil {
		filters = append(filters, TransactionFilter{
			Field:    "date",
			Operator: ">=",
			Value:    *startDate,
		})
	}

	if endDate != nil {
		filters = append(filters, TransactionFilter{
			Field:    "date",
			Operator: "<=",
			Value:    *startDate,
		})
	}

	return QueryTransactionsDynamic(ctx, userID, aggregation, filters)
}
