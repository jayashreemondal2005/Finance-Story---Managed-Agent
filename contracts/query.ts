import type { Category, Direction, Transaction } from './data.js';

export type QueryMeasure = 'sum' | 'count' | 'average' | 'max' | 'min' | 'list';

export type QueryGroupBy = 'none' | 'month' | 'weekday' | 'merchant' | 'category';

export interface QueryFilters {
  categories: Category[];
  merchants: string[];
  date_from: string | null;
  date_to: string | null;
  weekdays: number[];
  time_from: string | null;
  time_to: string | null;
  amount_min: number | null;
  amount_max: number | null;
  direction: Direction;
}

export interface AskQueryDSL {
  answerable: boolean;
  reason_if_not: string | null;
  suggested_question: string | null;
  interpretation: string;
  filters: QueryFilters;
  measure: QueryMeasure;
  group_by: QueryGroupBy;
  limit?: number | null;
}

export interface GroupedQueryBucket {
  key: string;
  label: string;
  value_minor: number;
  count: number;
  formatted_value: string;
  txn_ids: string[];
}

export interface AskQueryResult {
  question: string;
  query: AskQueryDSL;
  answerable: boolean;
  reason_if_not: string | null;
  suggested_question: string | null;
  value_minor: number;
  formatted_answer: string;
  unit_label: string;
  interpretation: string;
  matching_dates: string[];
  matching_txn_ids: string[];
  receipts: Transaction[];
  breakdown: GroupedQueryBucket[];
  source: 'model' | 'deterministic' | 'builder';
}

