package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Global connection pool variable
var conn *pgxpool.Pool

// TODO - add some context driven timeouts (for connections and queries)

// Connect establishes a connection pool to the PostgreSQL database
func Connect(databaseURL string) error {
	var err error
	// Create a connection pool
	conn, err = pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}

	// Test the connection
	err = conn.Ping(context.Background())
	if err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	fmt.Println("Connected to database successfully")
	return nil
}

// CloseConnection closes the database connection pool
func CloseConnection(ctx context.Context) {
	if conn != nil {
		conn.Close()
	}
}
