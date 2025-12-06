# Frontend Modernization Plan
## Monarch Money-Inspired UI with AI-First Aesthetic

### Current State Analysis

**Tech Stack:**
- React 16.14 (outdated - current is React 18)
- React Router v5 (current is v6)
- plaid-threads components (dated design system)
- Basic SCSS styling
- No design system or component library

**Current UI Issues:**
- No sidebar navigation
- Basic layout without modern patterns
- Limited visual hierarchy
- No charts/graphs for net worth trends
- Account grouping is basic
- No summary panels or insights
- Outdated component library

---

## Phase 1: Foundation & Tech Stack Upgrade

### 1.1 Upgrade Core Dependencies
- [ ] Upgrade React 16 → React 18
- [ ] Upgrade React Router v5 → v6
- [ ] Remove plaid-threads dependency
- [ ] Add modern UI library (choose one):
  - **Option A:** shadcn/ui (highly customizable, Tailwind-based)
  - **Option B:** MUI v5 (comprehensive, well-documented)
  - **Option C:** Radix UI + Tailwind (most flexible, modern)
- [ ] Add Tailwind CSS for utility-first styling
- [ ] Add Framer Motion for smooth animations
- [ ] Upgrade Recharts or consider alternatives (Chart.js, Victory, or custom with D3)

### 1.2 Project Structure
```
client/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Main navigation sidebar
│   │   ├── Header.tsx           # Top header with search, notifications
│   │   └── Layout.tsx           # Main layout wrapper
│   ├── accounts/
│   │   ├── AccountCard.tsx      # Individual account card
│   │   ├── AccountList.tsx      # Grouped account lists
│   │   └── AccountGroup.tsx     # Cash, Investments, etc.
│   ├── net-worth/
│   │   ├── NetWorthCard.tsx     # Main net worth display
│   │   ├── NetWorthChart.tsx    # Time series chart
│   │   └── NetWorthSummary.tsx  # Assets/Liabilities breakdown
│   ├── transactions/
│   │   ├── TransactionsTable.tsx
│   │   ├── TransactionFilters.tsx
│   │   └── TransactionRow.tsx
│   └── insights/
│       ├── SpendingInsights.tsx
│       └── CategoryBreakdown.tsx
├── pages/
│   ├── Dashboard.tsx            # Main dashboard (net worth, overview)
│   ├── Accounts.tsx            # Accounts page
│   ├── Transactions.tsx         # Transactions page
│   └── Reports.tsx              # Reports/analytics
├── hooks/
│   ├── useNetWorth.ts           # Net worth calculations
│   ├── useAccounts.ts           # Account data management
│   └── useTransactions.ts      # Transaction data management
└── styles/
    ├── globals.css              # Tailwind + custom CSS
    └── theme.css                # Design tokens
```

---

## Phase 2: Layout & Navigation (Monarch Money Pattern)

### 2.1 Sidebar Navigation
**Inspired by Monarch Money's left sidebar:**

- [ ] Create collapsible sidebar with:
  - Dashboard (home icon)
  - Accounts (piggy bank icon) - **Main focus**
  - Transactions (document icon)
  - Cash Flow (bar chart icon)
  - Reports (chart icon)
  - Budget (clipboard icon) - *Future*
  - Goals (target icon) - *Future*
  - Investments (mountain chart icon)
  - Settings (gear icon)
- [ ] Active state highlighting
- [ ] Smooth transitions
- [ ] Mobile-responsive (hamburger menu)

### 2.2 Header Bar
**Top header with:**
- [ ] Logo/branding (left)
- [ ] Search bar (center)
- [ ] Action buttons: Refresh, Add Account
- [ ] User menu (right)
- [ ] Notifications icon (optional)

### 2.3 Main Content Area
- [ ] Three-column layout:
  - Left: Main content (net worth, accounts, etc.)
  - Right: Summary panel (assets/liabilities breakdown)
- [ ] Responsive grid system
- [ ] Card-based design

---

## Phase 3: Net Worth Dashboard (Monarch Money Style)

### 3.1 Net Worth Display
**Top section showing:**
- [ ] Large net worth amount ($686,547.97 style)
- [ ] Change indicator: "+$23,292.75 (3.5%) 1 month change" in green
- [ ] Time period selector dropdown (1 month, 3 months, 1 year, All time)
- [ ] View type selector (Net worth performance, etc.)

### 3.2 Net Worth Chart
- [ ] Line chart showing net worth over time
- [ ] Smooth gradient fill
- [ ] Interactive tooltips
- [ ] Time range selection
- [ ] Y-axis: $663K - $689K range (dynamic)
- [ ] X-axis: Date labels

### 3.3 Account Grouping
**Collapsible sections:**
- [ ] **Cash Section:**
  - Icon: Hand holding money
  - Total: $65,755.47
  - Change: "+$1,573.70 (2.5%) 1 month change"
  - Individual accounts with:
    - Bank logo/icon
    - Account name
    - Account type badge
    - Balance
    - Last updated timestamp
    - Mini trend graph

- [ ] **Investments Section:**
  - Icon: Downward arrow (expandable)
  - Total: $541,793.51
  - Change: "+$10,635.13 (2%) 1 month change"
  - Individual investment accounts (401k, IRA, etc.)

- [ ] **Credit Cards Section** (if applicable)
- [ ] **Loans Section** (if applicable)

### 3.4 Right Summary Panel
**Three tabs: Summary, Totals, Percent**

**Assets Breakdown:**
- [ ] Total Assets: $928,436.75
- [ ] Horizontal colored bar showing proportions
- [ ] List with colored dots:
  - Investments: $541,793.51 (blue)
  - Real Estate: $300,816.71 (purple)
  - Cash: $65,755.47 (green)
  - Vehicles: $20,071.06 (orange)

**Liabilities Breakdown:**
- [ ] Total Liabilities: $241,888.78
- [ ] Horizontal colored bar
- [ ] List:
  - Loans: $239,377.23 (yellow)
  - Credit Cards: $2,511.55 (red)

---

## Phase 4: AI-First Design System

### 4.1 Color Palette
**Modern, AI-forward colors:**
- Primary: Deep blue/purple gradient (#6366f1 → #8b5cf6)
- Success: Emerald green (#10b981)
- Warning: Amber (#f59e0b)
- Error: Rose red (#ef4444)
- Background: Light gray/white (#f9fafb)
- Text: Dark slate (#1f2937)
- Accent: Cyan/teal for AI elements (#06b6d4)

### 4.2 Typography
- [ ] Modern sans-serif (Inter, Poppins, or system font stack)
- [ ] Clear hierarchy (h1-h6, body, caption)
- [ ] Number formatting: Tabular numbers for financial data

### 4.3 Component Styling
- [ ] Glassmorphism effects (frosted glass cards)
- [ ] Subtle shadows and borders
- [ ] Smooth animations (Framer Motion)
- [ ] Hover states with micro-interactions
- [ ] Loading skeletons (not spinners)
- [ ] Empty states with illustrations

### 4.4 AI-First Elements (Future)
- [ ] AI chat interface (bottom right corner)
- [ ] Smart insights cards
- [ ] Anomaly detection highlights
- [ ] Predictive text/autocomplete
- [ ] AI-powered categorization suggestions

---

## Phase 5: Accounts Page

### 5.1 Account List View
- [ ] Grouped by type (Cash, Investments, Credit, Loans)
- [ ] Each account card shows:
  - Institution logo
  - Account name
  - Account type badge
  - Current balance (large, prominent)
  - Available balance (if different)
  - Last updated timestamp
  - Mini trend graph
  - Action menu (3 dots)

### 5.2 Account Details Modal
- [ ] Full account information
- [ ] Transaction history
- [ ] Account settings
- [ ] Re-link option

---

## Phase 6: Transactions Page

### 6.1 Transaction Table
- [ ] Sortable columns
- [ ] Filters (date range, category, account)
- [ ] Search functionality
- [ ] Pagination or infinite scroll
- [ ] Category icons/colors
- [ ] Pending vs posted indicators

### 6.2 Transaction Details
- [ ] Expandable rows
- [ ] Category editing
- [ ] Notes/tags
- [ ] Receipt upload (future)

---

## Phase 7: Implementation Priority

### High Priority (MVP)
1. ✅ Tech stack upgrade (React 18, Router v6, Tailwind)
2. ✅ Sidebar navigation
3. ✅ Header bar
4. ✅ Net worth dashboard with chart
5. ✅ Account grouping (Cash, Investments)
6. ✅ Summary panel (Assets/Liabilities)

### Medium Priority
7. Transactions page redesign
8. Spending insights improvements
9. Responsive mobile design
10. Loading states and skeletons

### Low Priority (Future)
11. AI chat interface
12. Budget planning
13. Goals tracking
14. Advanced reports
15. Dark mode

---

## Tech Stack Recommendations

### Recommended Stack:
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "tailwindcss": "^3.3.0",
  "framer-motion": "^10.16.0",
  "@radix-ui/react-*": "Latest",
  "recharts": "^2.10.0",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.292.0" // Modern icons
}
```

### Component Library Choice:
**Recommendation: shadcn/ui + Tailwind**
- Fully customizable
- Copy-paste components (not a dependency)
- Built on Radix UI (accessible)
- Tailwind-based (fast, modern)
- Easy to theme

---

## Questions to Answer

1. **Component Library Preference?**
   - shadcn/ui (recommended)
   - MUI
   - Radix UI + custom
   - Other?

2. **Charting Library?**
   - Keep Recharts
   - Switch to Chart.js
   - Use Victory
   - Custom D3

3. **Priority Order?**
   - Start with layout/navigation?
   - Start with net worth dashboard?
   - Full redesign at once?

4. **AI-First Elements?**
   - What specific AI features should we plan for?
   - Chat interface?
   - Smart insights?
   - Auto-categorization?

5. **Backend Integration?**
   - Use Go server (port 8000)?
   - Keep Node.js server (port 5001)?
   - Both during transition?

---

## Next Steps

1. **Decide on component library** (shadcn/ui recommended)
2. **Upgrade React and dependencies**
3. **Set up Tailwind CSS**
4. **Create new layout structure** (Sidebar + Header)
5. **Build net worth dashboard** (highest visual impact)
6. **Migrate existing components** one by one

---

## Estimated Timeline

- **Phase 1 (Foundation):** 1-2 days
- **Phase 2 (Layout):** 2-3 days
- **Phase 3 (Net Worth):** 3-4 days
- **Phase 4 (Design System):** 1-2 days
- **Phase 5-6 (Pages):** 2-3 days each

**Total MVP:** ~2 weeks
**Full Redesign:** ~4-6 weeks

