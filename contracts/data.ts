import type { StoryPlan } from './story.js';

export const CATEGORIES = [
  'groceries',
  'eating out',
  'takeaway',
  'coffee',
  'transport',
  'travel',
  'shopping',
  'fun',
  'subscriptions',
  'bills',
  'rent',
  'health',
  'gifts',
  'fees',
  'savings',
  'transfers',
  'income',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DISCRETIONARY_CATEGORIES: readonly Category[] = [
  'groceries',
  'eating out',
  'takeaway',
  'coffee',
  'transport',
  'travel',
  'shopping',
  'fun',
  'subscriptions',
  'health',
  'gifts',
] as const;

const DISCRETIONARY_SET: ReadonlySet<string> = new Set<string>(DISCRETIONARY_CATEGORIES);

export function isDiscretionaryCategory(category: Category | string): boolean {
  return DISCRETIONARY_SET.has(category);
}

export const DEFAULT_B2B_CATEGORY_LABELS: Readonly<Record<Category, string>> = {
  groceries: 'Workplace & Office Ops',
  'eating out': 'Client & Team Hospitality',
  takeaway: 'On-Demand Catering',
  coffee: 'Daily Perks & Team Fuel',
  transport: 'Logistics, Fleet & Ground',
  travel: 'Global Ops & Executive Travel',
  shopping: 'CapEx, Hardware & Equipment',
  fun: 'Events, Summits & Offsites',
  subscriptions: 'Cloud & SaaS Stack',
  bills: 'Utilities & Telecom',
  rent: 'Facilities & Real Estate',
  health: 'Benefits & Workforce Wellness',
  gifts: 'Client & Partner Gifting',
  fees: 'Banking, Legal & Advisory Fees',
  savings: 'Treasury & Capital Reserves',
  transfers: 'Intercompany & Internal Transfers',
  income: 'Revenue & Gross Inflows',
};

export function getCategoryDisplayLabel(
  category: Category | string,
  customLabels?: Readonly<Record<string, string>>,
  isB2B = false
): string {
  const custom = customLabels?.[category];
  if (custom && custom.trim().length > 0) {
    return custom.trim();
  }
  if (isB2B && category in DEFAULT_B2B_CATEGORY_LABELS) {
    return DEFAULT_B2B_CATEGORY_LABELS[category as Category];
  }
  if (!category) return '';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function formatMoneyMinor(
  amountMinor: number,
  options?: { showCents?: boolean; prefix?: string }
): string {
  const prefix = options?.prefix ?? '$';
  const sign = amountMinor < 0 ? '-' : '';
  const absMinor = Math.round(Math.abs(amountMinor));
  const dollars = Math.floor(absMinor / 100);
  const cents = absMinor % 100;
  const showCents = options?.showCents ?? cents !== 0;
  const formattedDollars = dollars.toLocaleString('en-US');
  if (showCents) {
    return `${sign}${prefix}${formattedDollars}.${String(cents).padStart(2, '0')}`;
  }
  return `${sign}${prefix}${formattedDollars}`;
}

export type Direction = 'out' | 'in';

export interface RawSourceRow {
  id: string;
  date: string;
  posted_date: string;
  account: string;
  tran_type: string;
  description: string;
  amount: string;
  currency: string;
}

export interface TransactionFx {
  foreign_amount_minor: number;
  foreign_currency: string;
  rate: number;
}

export interface Transaction {
  id: string;
  date: string;
  posted_date: string;
  account: string;
  tran_type: string;
  amount_minor: number;
  currency: string;
  direction: Direction;
  raw_description: string;
  merchant: string;
  merchant_confidence: number;
  category: Category;
  category_label?: string;
  category_confidence: number;
  is_recurring: boolean;
  is_transfer: boolean;
  is_refund: boolean;
  fx?: TransactionFx;
  source_row: RawSourceRow;
}

export interface Day {
  date: string;
  weekday: number;
  week_index: number;
  discretionary_out_minor: number;
  all_out_minor: number;
  in_minor: number;
  txn_ids: string[];
  is_payday: boolean;
}

export interface Fact {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  formatted: string;
  txn_ids: string[];
  computation: string;
}

export type BusinessArchetype =
  | 'saas_arr'
  | 'ecommerce_gmv'
  | 'enterprise_pnl'
  | 'agency_services'
  | 'ops_supply_chain'
  | 'general_ledger'
  | 'consumer_personal';

export interface BusinessMetadata {
  entity_name: string;
  fiscal_period_label: string;
  archetype: BusinessArchetype;
  archetype_label: string;
  currency_code: string;
  currency_symbol: string;
  milestone_label: string;
  milestone_singular: string;
  outflow_label: string;
  inflow_label: string;
  counterparty_label: string;
  source_files?: string[];
  agent_audit_notes?: string[];
  generated_by?: 'deterministic' | 'gemini_enriched' | 'managed_agent';
}

export interface RawIngestFile {
  name: string;
  mimeType?: string;
  content: string;
  encoding?: 'utf8' | 'base64';
}

export interface DriveFileEntry {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  downloadUrl?: string;
}

export interface DriveFolderListing {
  folderId: string;
  folderName: string;
  files: DriveFileEntry[];
  source: 'drive_api' | 'embedded_html' | 'sheets_export' | 'direct_file';
}

export interface GeminiEntityMapping {
  raw_description: string;
  merchant: string;
  category: Category;
  category_label?: string;
  is_recurring?: boolean;
}

export interface GeminiNarrativeOverride {
  entity_name?: string;
  fiscal_period_label?: string;
  archetype?: BusinessArchetype;
  archetype_label?: string;
  currency_code?: string;
  currency_symbol?: string;
  milestone_label?: string;
  milestone_singular?: string;
  outflow_label?: string;
  inflow_label?: string;
  counterparty_label?: string;
  selected_chapters?: string[];
  one_line?: string;
  personality_title?: string;
  personality_subtitle?: string;
  chapter_copy?: Record<
    string,
    {
      kicker?: string;
      headline?: string;
      body?: string;
    }
  >;
  category_labels?: Record<string, string>;
  sample_questions?: string[];
  agent_audit_notes?: string[];
  generated_by?: 'deterministic' | 'gemini_enriched' | 'managed_agent';
}

export interface IngestEnrichRequest {
  files?: RawIngestFile[];
  raw_rows?: RawSourceRow[];
  unclassified_descriptions?: string[];
  facts_summary?: Array<{
    id: string;
    label: string;
    formatted: string;
    computation?: string;
  }>;
  chapter_ids?: string[];
  entity_name_hint?: string;
  deep_agent_audit?: boolean;
}

export interface DatasetBundle {
  transactions: Transaction[];
  days: Day[];
  facts: Fact[];
  plan: StoryPlan;
}

export interface IngestEnrichResponse {
  extracted_rows?: RawSourceRow[];
  entity_mappings?: GeminiEntityMapping[];
  narrative?: GeminiNarrativeOverride;
  bundle?: DatasetBundle;
  agent_steps?: string[];
  interaction_id?: string;
  source: 'deterministic' | 'gemini_enriched' | 'managed_agent';
  model_used?: string;
}

export interface IngestProgressStep {
  phase: 'parse' | 'profile' | 'tier1_facts' | 'tier2_gemini' | 'tier3_agent' | 'verify' | 'ready';
  label: string;
  detail?: string;
  progress_pct: number;
}

