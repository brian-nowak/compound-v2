import { Pool } from 'pg';
import { formatCurrency } from '@/app/lib/utils';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

interface Filters {
    dateRange: string;
    category: string;
}

// Shared query helper
async function queryDB(query: string, params: any[], errorMsg: string): Promise<number> {
    try {
        const result = await pool.query(query, params);
        const firstRow = result.rows[0];
        const value = firstRow ? Object.values(firstRow)[0] : '0';
        return parseFloat(String(value) || '0');
    } catch (error) {
        console.error(errorMsg, error);
        return 0;
    }
}

// Individual query functions
async function getTotalIncomeFromDB(userId: number, filters: Filters): Promise<number> {
    // Build date filter
    let dateFilter = '';
    if (filters.dateRange === '30d') {
        dateFilter = "AND t.date >= NOW() - INTERVAL '30 days'";
    } else if (filters.dateRange === '90d') {
        dateFilter = "AND t.date >= NOW() - INTERVAL '90 days'";
    } else if (filters.dateRange === '1y') {
        dateFilter = "AND t.date >= NOW() - INTERVAL '1 year'";
    }

    const query = `
        SELECT COALESCE(SUM(ABS(t.amount)), 0) as total_income
        FROM transactions_table t
        LEFT JOIN accounts_table a ON t.account_id = a.id
        LEFT JOIN items_table i ON a.item_id = i.id
        WHERE i.user_id = $1
          AND t.amount < 0
          AND t.name ILIKE '%DATABRICKS%'
          ${dateFilter}
    `;

    return queryDB(query, [userId], 'Failed to fetch income from DB:');
}

async function getTotalBalanceFromDB(userId: number): Promise<number> {
    const query = `
        SELECT COALESCE(SUM(a.current_balance), 0) as total_balance
        FROM accounts_table a
        LEFT JOIN items_table i ON a.item_id = i.id
        WHERE i.user_id = $1
          AND a.type IN ('depository', 'investment', 'brokerage')
          AND a.current_balance IS NOT NULL
    `;

    return queryDB(query, [userId], 'Failed to fetch total balance from DB:');
}

async function getCashBalanceFromDB(userId: number): Promise<number> {
    const query = `
        SELECT COALESCE(SUM(a.current_balance), 0) as cash_balance
        FROM accounts_table a
        LEFT JOIN items_table i ON a.item_id = i.id
        WHERE i.user_id = $1
          AND a.type = 'depository'
          AND a.current_balance IS NOT NULL
    `;

    return queryDB(query, [userId], 'Failed to fetch cash balance from DB:');
}

async function getCreditBalanceFromDB(userId: number): Promise<number> {
    const query = `
        SELECT COALESCE(SUM(a.current_balance), 0) as credit_balance
        FROM accounts_table a
        LEFT JOIN items_table i ON a.item_id = i.id
        WHERE i.user_id = $1
          AND a.type IN ('credit', 'loan')
          AND a.current_balance IS NOT NULL
    `;

    return queryDB(query, [userId], 'Failed to fetch credit balance from DB:');
}

async function getNetWorthFromDB(userId: number): Promise<number> {
    const query = `
        WITH assets AS (
            SELECT COALESCE(SUM(a.current_balance), 0) as total_assets
            FROM accounts_table a
            LEFT JOIN items_table i ON a.item_id = i.id
            WHERE i.user_id = $1
              AND a.type IN ('depository', 'investment', 'brokerage')
              AND a.current_balance IS NOT NULL
        ),
        liabilities AS (
            SELECT COALESCE(SUM(a.current_balance), 0) as total_liabilities
            FROM accounts_table a
            LEFT JOIN items_table i ON a.item_id = i.id
            WHERE i.user_id = $1
              AND a.type IN ('credit', 'loan')
              AND a.current_balance IS NOT NULL
        )
        SELECT 
            (SELECT total_assets FROM assets) - (SELECT total_liabilities FROM liabilities) as net_worth
    `;

    return queryDB(query, [userId], 'Failed to fetch net worth from DB:');
}

// Shared value component
function MetricValue({ 
    value, 
    isDebt = false 
}: { 
    value: number; 
    isDebt?: boolean;
}) {
    const isPositive = value > 0;
    const colorClass = isDebt 
        ? 'text-red-600 dark:text-red-400'
        : isPositive 
            ? 'text-green-600 dark:text-green-400' 
            : '';
    
    return (
        <div className={`text-2xl font-bold leading-tight ${colorClass}`}>
            {formatCurrency(value)}
        </div>
    );
}

// Named exports for each component
export async function TotalIncomeValue({ 
    userId, 
    filters 
}: { 
    userId: number; 
    filters: Filters;
}) {
    const value = await getTotalIncomeFromDB(userId, filters);
    return <MetricValue value={value} />;
}

export async function TotalBalanceValue({ 
    userId 
}: { 
    userId: number;
}) {
    const value = await getTotalBalanceFromDB(userId);
    return <MetricValue value={value} />;
}

export async function CashBalanceValue({ 
    userId 
}: { 
    userId: number;
}) {
    const value = await getCashBalanceFromDB(userId);
    return <MetricValue value={value} />;
}

export async function CreditBalanceValue({ 
    userId 
}: { 
    userId: number;
}) {
    const value = await getCreditBalanceFromDB(userId);
    return <MetricValue value={value} isDebt={true} />;
}

export async function NetWorthValue({ 
    userId 
}: { 
    userId: number;
}) {
    const value = await getNetWorthFromDB(userId);
    return <MetricValue value={value} />;
}

