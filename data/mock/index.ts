import {
  formatMoneyMinor,
  isDiscretionaryCategory,
  type Category,
  type DatasetBundle,
  type Day,
  type Fact,
  type StoryPlan,
  type Transaction,
} from '../../contracts/index.js';

export function buildMockDataset(): DatasetBundle {
  const transactions: Transaction[] = [];
  const days: Day[] = [];

  const startUtc = Date.UTC(2025, 0, 1);
  let txnSeq = 1;

  const addTxn = (params: {
    date: string;
    account: 'Credit card' | 'Savings';
    tran_type: string;
    amount_minor: number;
    direction: 'out' | 'in';
    raw_description: string;
    merchant: string;
    category: Category;
    is_recurring?: boolean;
    is_transfer?: boolean;
    is_refund?: boolean;
  }): string => {
    const id = `MOCK-${params.date.replace(/-/g, '')}-${String(txnSeq++).padStart(4, '0')}`;
    const signedAmt =
      params.direction === 'out'
        ? -(params.amount_minor / 100)
        : params.amount_minor / 100;
    transactions.push({
      id,
      date: params.date,
      posted_date: params.date,
      account: params.account,
      tran_type: params.tran_type,
      amount_minor: params.amount_minor,
      currency: 'USD',
      direction: params.direction,
      raw_description: params.raw_description,
      merchant: params.merchant,
      merchant_confidence: 0.99,
      category: params.category,
      category_confidence: 0.99,
      is_recurring: params.is_recurring ?? false,
      is_transfer: params.is_transfer ?? false,
      is_refund: params.is_refund ?? false,
      source_row: {
        id,
        date: params.date,
        posted_date: params.date,
        account: params.account,
        tran_type: params.tran_type,
        description: params.raw_description,
        amount: signedAmt.toFixed(2),
        currency: 'USD',
      },
    });
    return id;
  };

  // 1. Add 69 Blue Bottle Coffee visits across 2025
  for (let i = 0; i < 69; i++) {
    const dayIndex = Math.min(364, Math.floor((i * 365) / 69));
    const dateStr = new Date(startUtc + dayIndex * 86_400_000).toISOString().slice(0, 10);
    const amountMinor = i % 3 === 0 ? 850 : i % 3 === 1 ? 780 : 840;
    addTxn({
      date: dateStr,
      account: 'Credit card',
      tran_type: 'DEBIT',
      amount_minor: amountMinor,
      direction: 'out',
      raw_description: 'SQ *BLUE BOTTLE COFFEE SEATTLE WA',
      merchant: 'Blue Bottle Coffee',
      category: 'coffee',
      is_recurring: true,
    });
  }

  // 2. Add 41 Sightglass Coffee visits
  for (let i = 0; i < 41; i++) {
    const dayIndex = Math.min(364, Math.floor((i * 365) / 41) + 1);
    const dateStr = new Date(startUtc + dayIndex * 86_400_000).toISOString().slice(0, 10);
    addTxn({
      date: dateStr,
      account: 'Credit card',
      tran_type: 'DEBIT',
      amount_minor: 1450,
      direction: 'out',
      raw_description: 'SIGHTGLASS COFFEE SF CA',
      merchant: 'Sightglass Coffee',
      category: 'coffee',
      is_recurring: true,
    });
  }

  // 3. Add 12 monthly paydays, rent, savings, bills, and subscriptions
  const paydayDates = [
    '2025-01-31',
    '2025-02-28',
    '2025-03-31',
    '2025-04-30',
    '2025-05-30',
    '2025-06-30',
    '2025-07-31',
    '2025-08-29',
    '2025-09-30',
    '2025-10-31',
    '2025-11-28',
    '2025-12-31',
  ];
  const paydaySet = new Set<string>(paydayDates);

  paydayDates.forEach((payDate, mIdx) => {
    const ym = `2025-${String(mIdx + 1).padStart(2, '0')}`;
    addTxn({
      date: payDate,
      account: 'Savings',
      tran_type: 'D/C',
      amount_minor: 675000,
      direction: 'in',
      raw_description: 'PACIFIC STUDIO LABS SALARY',
      merchant: 'Pacific Studio Labs',
      category: 'income',
      is_recurring: true,
    });
    addTxn({
      date: `${ym}-02`,
      account: 'Savings',
      tran_type: 'D/D',
      amount_minor: 185000,
      direction: 'out',
      raw_description: 'RENT TRANSFER',
      merchant: 'Rent',
      category: 'rent',
      is_recurring: true,
    });
    addTxn({
      date: `${ym}-05`,
      account: 'Savings',
      tran_type: 'D/D',
      amount_minor: 80000,
      direction: 'out',
      raw_description: 'INVESTMENT RESERVE',
      merchant: 'Savings & Investments',
      category: 'savings',
      is_recurring: true,
    });
    addTxn({
      date: `${ym}-10`,
      account: 'Credit card',
      tran_type: 'DEBIT',
      amount_minor: 11200,
      direction: 'out',
      raw_description: 'SEATTLE CITY LIGHT',
      merchant: 'Seattle City Light',
      category: 'bills',
      is_recurring: true,
    });
    addTxn({
      date: `${ym}-15`,
      account: 'Credit card',
      tran_type: 'DEBIT',
      amount_minor: 1699,
      direction: 'out',
      raw_description: 'SPOTIFY USA',
      merchant: 'Spotify',
      category: 'subscriptions',
      is_recurring: true,
    });
  });

  // 4. Add everyday discretionary transactions across all remaining categories (>350 total txns)
  const extraSpecs: Array<{ merchant: string; category: Category; amount_minor: number }> = [
    { merchant: "Trader Joe's", category: 'groceries', amount_minor: 6420 },
    { merchant: 'Whole Foods Market', category: 'groceries', amount_minor: 8250 },
    { merchant: 'The Walrus and the Carpenter', category: 'eating out', amount_minor: 9400 },
    { merchant: 'Pagliacci Pizza', category: 'takeaway', amount_minor: 3250 },
    { merchant: 'Uber', category: 'transport', amount_minor: 2480 },
    { merchant: 'Alaska Airlines', category: 'travel', amount_minor: 41200 },
    { merchant: 'Sweetwater', category: 'shopping', amount_minor: 34900 },
    { merchant: 'Monarch Acoustic', category: 'shopping', amount_minor: 253500 },
    { merchant: 'Seattle Symphony', category: 'fun', amount_minor: 8800 },
    { merchant: 'Northwest Physio', category: 'health', amount_minor: 12000 },
    { merchant: 'Pike Place Flowers', category: 'gifts', amount_minor: 5500 },
  ];

  for (let i = 0; i < 220; i++) {
    const dayIndex = (i * 3) % 365;
    const dateStr = new Date(startUtc + dayIndex * 86_400_000).toISOString().slice(0, 10);
    const spec = extraSpecs[i % extraSpecs.length]!;
    addTxn({
      date: dateStr,
      account: 'Credit card',
      tran_type: 'DEBIT',
      amount_minor: spec.amount_minor + ((i * 137) % 1500),
      direction: 'out',
      raw_description: `${spec.merchant.toUpperCase()} SEATTLE WA`,
      merchant: spec.merchant,
      category: spec.category,
    });
  }

  // Sort transactions chronologically
  transactions.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  const txnsByDate = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const list = txnsByDate.get(t.date) ?? [];
    list.push(t);
    txnsByDate.set(t.date, list);
  }

  // Build 365 Day objects for 2025 (2025-01-01 is Wednesday = weekday 2 in Mon=0..Sun=6)
  for (let dIdx = 0; dIdx < 365; dIdx++) {
    const dt = new Date(startUtc + dIdx * 86_400_000);
    const dateStr = dt.toISOString().slice(0, 10);
    const utcDay = dt.getUTCDay(); // 0=Sun..6=Sat
    const weekday = (utcDay + 6) % 7; // 0=Mon..6=Sun
    const week_index = Math.floor((dIdx + 2) / 7);
    const dayTxns = txnsByDate.get(dateStr) ?? [];

    let discretionary_out_minor = 0;
    let all_out_minor = 0;
    let in_minor = 0;

    for (const t of dayTxns) {
      if (t.is_transfer) continue;
      if (t.direction === 'out' && !t.is_refund) {
        all_out_minor += t.amount_minor;
        if (isDiscretionaryCategory(t.category)) {
          discretionary_out_minor += t.amount_minor;
        }
      } else if (t.direction === 'in' && !t.is_refund) {
        in_minor += t.amount_minor;
      }
    }

    days.push({
      date: dateStr,
      weekday,
      week_index,
      discretionary_out_minor,
      all_out_minor,
      in_minor,
      txn_ids: dayTxns.map((t) => t.id),
      is_payday: paydaySet.has(dateStr),
    });
  }

  const outTxns = transactions.filter((t) => t.direction === 'out' && !t.is_transfer && !t.is_refund);
  const discTxns = outTxns.filter((t) => isDiscretionaryCategory(t.category));
  const bbTxns = outTxns.filter((t) => t.merchant === 'Blue Bottle Coffee');
  const incomeTxns = transactions.filter((t) => t.direction === 'in' && !t.is_transfer);
  const savingsTxns = outTxns.filter((t) => t.category === 'savings');

  const totalSpendMinor = outTxns.reduce((acc, t) => acc + t.amount_minor, 0);
  const discSpendMinor = discTxns.reduce((acc, t) => acc + t.amount_minor, 0);
  const bbSpendMinor = bbTxns.reduce((acc, t) => acc + t.amount_minor, 0);
  const savingsSpendMinor = savingsTxns.reduce((acc, t) => acc + t.amount_minor, 0);

  const facts: Fact[] = [
    {
      id: 'year_number',
      label: 'Year',
      value: 2025,
      unit: 'year',
      formatted: '2025',
      txn_ids: transactions.slice(0, 5).map((t) => t.id),
      computation: 'Calendar year 2025',
    },
    {
      id: 'total_transactions_count',
      label: 'Total Transactions',
      value: transactions.length,
      unit: 'count',
      formatted: transactions.length.toLocaleString('en-US'),
      txn_ids: transactions.map((t) => t.id),
      computation: 'Total count of transactions in 2025',
    },
    {
      id: 'total_spend_usd',
      label: 'Total Outgoing Spend',
      value: totalSpendMinor,
      unit: 'usd_cents',
      formatted: formatMoneyMinor(totalSpendMinor, { showCents: false }),
      txn_ids: outTxns.map((t) => t.id),
      computation: 'Sum of all outgoing non-transfer transactions',
    },
    {
      id: 'discretionary_spend_usd',
      label: 'Discretionary Spend',
      value: discSpendMinor,
      unit: 'usd_cents',
      formatted: formatMoneyMinor(discSpendMinor, { showCents: false }),
      txn_ids: discTxns.map((t) => t.id),
      computation: 'Sum of outgoing discretionary transactions',
    },
    {
      id: 'top_merchant_name',
      label: 'Top Merchant',
      value: 'Blue Bottle Coffee',
      unit: 'text',
      formatted: 'Blue Bottle Coffee',
      txn_ids: bbTxns.map((t) => t.id),
      computation: 'Merchant with highest visit count',
    },
    {
      id: 'visits_top_merchant',
      label: 'Top Merchant Visits',
      value: bbTxns.length,
      unit: 'count',
      formatted: String(bbTxns.length),
      txn_ids: bbTxns.map((t) => t.id),
      computation: 'Visit count at Blue Bottle Coffee',
    },
    {
      id: 'spend_top_merchant',
      label: 'Top Merchant Spend',
      value: bbSpendMinor,
      unit: 'usd_cents',
      formatted: formatMoneyMinor(bbSpendMinor, { showCents: true }),
      txn_ids: bbTxns.map((t) => t.id),
      computation: 'Total spend at Blue Bottle Coffee',
    },
    {
      id: 'payday_count',
      label: 'Paydays',
      value: paydayDates.length,
      unit: 'count',
      formatted: String(paydayDates.length),
      txn_ids: incomeTxns.map((t) => t.id),
      computation: 'Count of salary payday deposits',
    },
    {
      id: 'savings_invest_total_usd',
      label: 'Saved & Invested',
      value: savingsSpendMinor,
      unit: 'usd_cents',
      formatted: formatMoneyMinor(savingsSpendMinor, { showCents: false }),
      txn_ids: savingsTxns.map((t) => t.id),
      computation: 'Total transferred to savings and investment reserves',
    },
    {
      id: 'payday_spike_ratio',
      label: 'Payday Spike Ratio',
      value: 1.4,
      unit: 'ratio',
      formatted: '1.4×',
      txn_ids: discTxns.slice(0, 10).map((t) => t.id),
      computation: 'Post-payday vs baseline daily spend ratio',
    },
  ];

  const allFactIds = facts.map((f) => f.id);
  const sampleTxnIds = outTxns.slice(0, 25).map((t) => t.id);

  const plan: StoryPlan = {
    person_name: 'Sam',
    year_fact_id: 'year_number',
    year: 2025,
    palette_ids: ['ink_solar', 'solar_ember', 'paper_studio', 'olive_lime'],
    chapters: [
      {
        id: 'pour',
        type: 'pour',
        palette_id: 'ink_solar',
        headline: 'Your {fact:year_number} in {fact:total_transactions_count} lines.',
        body: 'Takeaway for Sam — Your {fact:total_transactions_count} transactions total {fact:total_spend_usd} in outgoing spend and {fact:discretionary_spend_usd} in discretionary spend.',
        fact_ids: allFactIds,
        txn_ids: sampleTxnIds,
        params: {
          kicker: 'THE POUR',
          subheadline: 'From {fact:total_transactions_count} bank lines to {fact:discretionary_spend_usd} of everyday life.',
          blocks: [
            {
              label: 'Total Spend',
              fact_id: 'total_spend_usd',
              unit_sup: 'US$',
              sublabel_fact_ids: ['discretionary_spend_usd'],
              sublabel_template: '{fact:discretionary_spend_usd} discretionary',
              color_role: 'primary',
            },
          ],
        },
      },
      {
        id: 'year_as_squares',
        type: 'year_as_squares',
        palette_id: 'ink_solar',
        headline: 'Every day of {fact:year_number}, mapped to the beat.',
        body: 'Takeaway for Sam — Across {fact:payday_count} paydays, your year totaled {fact:discretionary_spend_usd} in discretionary spend.',
        fact_ids: allFactIds,
        txn_ids: sampleTxnIds,
        params: {
          kicker: 'THE YEAR AS SQUARES',
        },
      },
      {
        id: 'your_place',
        type: 'your_place',
        palette_id: 'solar_ember',
        headline: '{fact:top_merchant_name}, {fact:visits_top_merchant} times.',
        body: 'Takeaway for Sam — You spent {fact:spend_top_merchant} across {fact:visits_top_merchant} stops at {fact:top_merchant_name}.',
        fact_ids: allFactIds,
        txn_ids: bbTxns.map((t) => t.id),
        params: {
          kicker: 'YOUR PLACE',
          focus_merchant: 'Blue Bottle Coffee',
          focus_category: 'coffee',
        },
      },
      {
        id: 'shatter',
        type: 'shatter',
        palette_id: 'olive_lime',
        headline: 'Where {fact:discretionary_spend_usd} actually went.',
        body: 'Takeaway for Sam — Your {fact:total_transactions_count} movements sort into distinct category columns.',
        fact_ids: allFactIds,
        txn_ids: sampleTxnIds,
        params: {
          kicker: 'THE SHATTER',
        },
      },
      {
        id: 'personality',
        type: 'personality',
        palette_id: 'paper_studio',
        headline: 'The Studio-Building Regular.',
        body: 'Takeaway for Sam — You visited {fact:top_merchant_name} {fact:visits_top_merchant} times while setting aside {fact:savings_invest_total_usd}.',
        fact_ids: allFactIds,
        txn_ids: sampleTxnIds,
        params: {
          kicker: 'MONEY PERSONALITY',
        },
      },
      {
        id: 'one_line',
        type: 'one_line',
        palette_id: 'ink_solar',
        headline: 'Your {fact:year_number} in one sentence.',
        body: 'Takeaway for Sam — Every number in your {fact:year_number} story traces back to your {fact:total_transactions_count} receipts.',
        fact_ids: allFactIds,
        txn_ids: sampleTxnIds,
        params: {
          kicker: 'IN ONE LINE',
        },
      },
      {
        id: 'share_card',
        type: 'share_card',
        palette_id: 'solar_ember',
        headline: 'Sam · {fact:year_number}',
        body: 'Takeaway for Sam — Your {fact:year_number} summary ({fact:discretionary_spend_usd} discretionary spend) is ready to share.',
        fact_ids: allFactIds,
        txn_ids: sampleTxnIds,
        params: {
          kicker: 'YOUR SHARE CARD',
        },
      },
    ],
    one_line:
      'In {fact:year_number}, across {fact:total_transactions_count} transactions and {fact:discretionary_spend_usd} of discretionary spend, you visited {fact:top_merchant_name} {fact:visits_top_merchant} times and saved {fact:savings_invest_total_usd}.',
    personality: {
      title: 'The Studio-Building Regular',
      subtitle:
        'Takeaway for Sam — You balanced {fact:visits_top_merchant} ritual visits to {fact:top_merchant_name} with {fact:savings_invest_total_usd} in savings.',
      dominant_categories: ['shopping', 'eating out', 'groceries', 'coffee', 'travel'],
      payday_spike_ratio_fact_id: 'payday_spike_ratio',
      shape_seed: 2025,
    },
  };

  return {
    transactions,
    days,
    facts,
    plan,
  };
}

