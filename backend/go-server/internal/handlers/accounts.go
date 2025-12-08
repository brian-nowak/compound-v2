package handlers

import (
	"compound/go-server/internal/db"
	plaidpkg "compound/go-server/internal/plaid"
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetUserAccounts handles GET /api/users/:id/accounts
// Retrieves all accounts for a specific user across all their items
func GetUserAccounts(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid user ID",
		})
		return
	}

	// Get all accounts for the user
	accounts, err := db.GetAccountsByUserID(context.Background(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get accounts: " + err.Error(),
		})
		return
	}

	// Return accounts array directly to match frontend expectation
	c.JSON(http.StatusOK, accounts)
}

// RefreshUserAccountBalances handles POST /api/users/:id/refresh-balances
// Fetches latest balance data from Plaid for all user accounts
func RefreshUserAccountBalances(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid user ID",
		})
		return
	}

	// Get all items for the user
	items, err := db.GetItemsByUserID(context.Background(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get items: " + err.Error(),
		})
		return
	}

	updatedCount := 0
	for _, item := range items {
		// Fetch accounts from Plaid with current balance data
		accounts, err := plaidpkg.GetAccounts(context.Background(), item.PlaidAccessToken)
		if err != nil {
			// Log error but continue with other items
			continue
		}

		// Update each account with balance information
		for _, account := range accounts {
			// Extract balance information
			var officialName *string
			if account.OfficialName.IsSet() {
				officialName = account.OfficialName.Get()
			}

			var currentBalance *float64
			if account.Balances.Current.IsSet() {
				currentBalance = account.Balances.Current.Get()
			}

			var availableBalance *float64
			if account.Balances.Available.IsSet() {
				availableBalance = account.Balances.Available.Get()
			}

			var isoCurrencyCode *string
			if account.Balances.IsoCurrencyCode.IsSet() {
				isoCurrencyCode = account.Balances.IsoCurrencyCode.Get()
			}

			var unofficialCurrencyCode *string
			if account.Balances.UnofficialCurrencyCode.IsSet() {
				unofficialCurrencyCode = account.Balances.UnofficialCurrencyCode.Get()
			}

			_, err := db.CreateOrUpdateAccount(
				context.Background(),
				item.ID,
				account.GetAccountId(),
				account.GetName(),
				account.GetMask(),
				string(account.GetType()),
				string(account.GetSubtype()),
				officialName,
				currentBalance,
				availableBalance,
				isoCurrencyCode,
				unofficialCurrencyCode,
			)
			if err == nil {
				updatedCount++
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"updated_count": updatedCount,
	})
}
