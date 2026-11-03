import type { BusinessMetadata, Category, Day, Fact, Transaction } from './data.js';

export type ChosenChapterType =
  | 'your_place'
  | 'streak'
  | 'getaway'
  | 'heartbeat'
  | 'big_one'
  | 'shatter'
  | 'personality';

export type BespokeChapterType = 'bespoke';

export type ChapterType =
  | 'pour'
  | 'year_as_squares'
  | ChosenChapterType
  | BespokeChapterType
  | 'one_line'
  | 'share_card';

export interface PaletteBlockColor {
  bg: string;
  fg: string;
}

export interface PaletteTheme {
  id: string;
  name: string;
  bg: string;
  fg: string;
  accent: string;
  secondary: string;
  muted: string;
  blocks: {
    primary: PaletteBlockColor;
    secondary: PaletteBlockColor;
    tertiary: PaletteBlockColor;
    quaternary?: PaletteBlockColor;
  };
}

export interface ChapterMetricBlock {
  label: string;
  fact_id: string;
  unit_sup?: string;
  sublabel_fact_ids?: string[];
  sublabel_template?: string;
  color_role?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
}

export interface ChapterParams {
  chapter_number?: string;
  kicker?: string;
  subheadline?: string;
  badge?: string;
  focus_merchant?: string;
  focus_category?: Category;
  highlight_dates?: string[];
  blocks?: ChapterMetricBlock[];
  extra?: Record<string, unknown>;
}

export interface Chapter {
  id: string;
  type: ChapterType;
  bespoke_module?: string;
  palette_id: string;
  headline: string;
  body: string;
  fact_ids: string[];
  txn_ids: string[];
  params: ChapterParams;
}

export interface PersonalityProfile {
  title: string;
  subtitle: string;
  dominant_categories: Category[];
  payday_spike_ratio_fact_id: string;
  shape_seed: number;
}

export interface StoryPlan {
  person_name: string;
  year_fact_id: string;
  year: number;
  palette_ids: string[];
  chapters: Chapter[];
  one_line: string;
  personality: PersonalityProfile;
  business_meta?: BusinessMetadata;
  category_labels?: Record<string, string>;
  sample_questions?: string[];
}

export interface MotionEvent {
  type: string;
  timestamp: number;
  beat: number;
  chapter_id?: string;
  value: Record<string, unknown> | string | number | boolean | null;
}

export interface TimelineController {
  seek(seconds: number): void;
  play(rate?: number): void;
  pause(): void;
  isPlaying(): boolean;
  getPlaybackRate(): number;
  currentTime(): number;
  duration(): number;
  progress(): number;
  logEvent(type: string, value?: MotionEvent['value']): void;
  getEvents(): readonly MotionEvent[];
  clearEvents(): void;
  isReducedMotion(): boolean;
  setReducedMotion(enabled: boolean): void;
}

export interface ChapterContext {
  chapter: Chapter;
  plan: StoryPlan;
  palette: PaletteTheme;
  facts: ReadonlyMap<string, Fact>;
  days: readonly Day[];
  transactions: readonly Transaction[];
  allTransactions: readonly Transaction[];
  resolveCopy: (template: string) => string;
  getFact: (factId: string) => Fact;
  openReceipts: (title: string, txnIds: string[]) => void;
  openExplore: (initialCategory?: Category) => void;
  openAsk: (prefillQuestion?: string) => void;
  exportShareCard: (size?: '1080x1350' | '1080x1920') => Promise<string>;
  viewport: 'desktop' | 'phone';
  reducedMotion: boolean;
}

export interface ChapterModule {
  mount(container: HTMLElement, ctx: ChapterContext): void;
  play(timeline: TimelineController): void;
  explore(): void;
  unmount(): void;
}

