package handlers

import (
	"compound/go-server/internal/db"
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

	// Convert to response format
	var responseAccounts []gin.H
	for _, account := range accounts {
		responseAccounts = append(responseAccounts, gin.H{
			"id":                account.ID,
			"item_id":           account.ItemID,
			"plaid_account_id":  account.PlaidAccountID,
			"name":              account.Name,
			"mask":              account.Mask,
			"type":              account.Type,
			"subtype":           account.Subtype,
			"current_balance":   nil, // TODO: fetch from Plaid or cache in DB
			"available_balance": nil, // TODO: fetch from Plaid or cache in DB
		})
	}

	c.JSON(http.StatusOK, responseAccounts)
}
