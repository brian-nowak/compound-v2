import { Pool } from 'pg';
import { Card } from './financial-cards';

// database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// RSC
async function getTotalIncomeFromDB(userId: number): Promise<number> {
    try {
        // First, let's check what transactions exist
        const debug = await pool.query(
            `SELECT t.name, t.amount, t.date
             FROM transactions_table t
             LEFT JOIN accounts_table a ON t.account_id = a.id
             LEFT JOIN items_table i ON a.item_id = i.id
             WHERE i.user_id = $1
               AND t.amount < 0
             LIMIT 10`,
            [userId]
        );
        // console.log('Sample transactions:', debug.rows);

        const result = await pool.query(
      `SELECT COALESCE(SUM(ABS(t.amount)), 0) as total_income
       FROM transactions_table t
       LEFT JOIN accounts_table a ON t.account_id = a.id
       LEFT JOIN items_table i ON a.item_id = i.id
       WHERE i.user_id = $1
         AND t.amount < 0
         AND t.name ILIKE '%DATABRICKS%'`,
      [userId]
        );
        // console.log('Query result:', result.rows[0]);
        return parseFloat(result.rows[0]?.total_income || '0');
    } catch (error) {
        console.error('Failed to fetch income from DB:', error);
        return 0;
    }
}

// RSC
export default async function TotalIncomeCardRSC({ userId }: { userId: number }) {
    const totalIncome = await getTotalIncomeFromDB(userId);

    return <Card title="Total Income (RSC)" value={totalIncome} type="income" />;
}