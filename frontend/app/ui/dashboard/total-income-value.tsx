import { Pool } from 'pg';
import { formatCurrency } from '@/app/lib/utils';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

interface Filters {
    dateRange: string;
    category: string;
}

async function getTotalIncomeFromDB(userId: number, filters: Filters): Promise<number> {
    try {
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

        const result = await pool.query(query, [userId]);
        return parseFloat(result.rows[0]?.total_income || '0');
    } catch (error) {
        console.error('Failed to fetch income from DB:', error);
        return 0;
    }
}

export default async function TotalIncomeValue({
    userId,
    filters
}: {
    userId: number;
    filters: Filters;
}) {
    const totalIncome = await getTotalIncomeFromDB(userId, filters);
    return <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>;
}