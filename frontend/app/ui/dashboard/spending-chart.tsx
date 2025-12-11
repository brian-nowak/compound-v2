import { Pool } from 'pg';
import SpendingChartClient from './spending-chart-client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface Filters {
  dateRange: string;
  category: string;
}

async function getSpendingData(userId: number, filters: Filters) {
  // Build WHERE clause based on filters
  let dateFilter = '';
  if (filters.dateRange === '30d') {
    dateFilter = "AND t.date >= NOW() - INTERVAL '30 days'";
  } else if (filters.dateRange === '90d') {
    dateFilter = "AND t.date >= NOW() - INTERVAL '90 days'";
  } else if (filters.dateRange === '1y') {
    dateFilter = "AND t.date >= NOW() - INTERVAL '1 year'";
  }

  let categoryFilter = '';
  const queryParams: (number | string)[] = [userId];

  if (filters.category !== 'all') {
    categoryFilter = 'AND t.primary_category = $2';
    queryParams.push(filters.category);
  }

  const query = `
    SELECT
      primary_category,
      SUM(t.amount) as total
    FROM transactions_enriched t
    WHERE t.user_id = $1
    AND t.primary_category not like '%Transfer%' and t.primary_category <> 'Loan Payments'
    ${dateFilter}
      ${categoryFilter}
    GROUP BY primary_category
    ORDER BY total DESC
    LIMIT 7
  `;

  try {
    console.log('=== SPENDING CHART DEBUG ===');
    console.log('Filters:', filters);
    console.log('Query:', query);
    console.log('Query params:', queryParams);
    const result = await pool.query(query, queryParams);
    console.log('Result rows count:', result.rows.length);
    console.log('Result rows:', result.rows);

    if (result.rows.length === 0) {
      console.log('No rows returned - checking if data exists at all...');
      const checkQuery = 'SELECT COUNT(*) FROM transactions_enriched WHERE user_id = $1';
      const checkResult = await pool.query(checkQuery, [userId]);
      console.log('Total transactions for user:', checkResult.rows[0].count);
    }

    // Define shades of blue from light to dark
    const blueShades = [
      'hsl(210, 100%, 70%)',  // Light blue
      'hsl(210, 100%, 60%)',  // Medium-light blue
      'hsl(210, 100%, 50%)',  // Medium blue
      'hsl(210, 100%, 40%)',  // Medium-dark blue
      'hsl(210, 100%, 30%)',  // Dark blue
      'hsl(210, 100%, 25%)',  // Darker blue
      'hsl(210, 100%, 20%)',  // Darkest blue
    ];

    return result.rows.map((row, index) => ({
      category: row.primary_category || 'Uncategorized',
      amount: parseFloat(row.total),
      fill: blueShades[index % blueShades.length]
    }));
  } catch (error) {
    console.error('Failed to fetch spending data:', error);
    console.error('Error details:', error);
    return [];
  }
}

export default async function SpendingChart({
  userId,
  filters
}: {
  userId: number;
  filters: Filters;
}) {
  const spendingData = await getSpendingData(userId, filters);

  // Take top 5 categories for display
  const chartData = spendingData.slice(0, 5);

  // Get display text for date range
  const getDateRangeText = () => {
    switch (filters.dateRange) {
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      default: return 'All Time';
    }
  };

  return <SpendingChartClient data={chartData} dateRangeText={getDateRangeText()} />;
}
