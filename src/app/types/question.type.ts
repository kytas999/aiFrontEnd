export interface ResearchQuestion {
  id: number;
  question: string;
  stage: string;
  confirmed: boolean;
  loading: boolean;
  error: string | null;
  disabled: boolean;
  manuallyEditing: boolean;
  source?: 'AI' | 'manual' | null;
}