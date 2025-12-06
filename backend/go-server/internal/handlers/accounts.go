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

	// Return accounts array directly to match frontend expectation
	c.JSON(http.StatusOK, accounts)
}
