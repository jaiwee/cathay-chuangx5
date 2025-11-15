import { create } from "zustand";

interface PlanForm {
  theme?: string;
  event_name?: string;
  event_date?: string;
  event_time?: string;
  event_location?: string;
  origin_country?: string;
  destination_country?: string;
  time_pref?: string;
  group_size?: number;
  entertainment?: boolean;
  merch?: boolean;
  culinary?: boolean;
}

interface PlanFormState {
  form: PlanForm;
  update: (data: Partial<PlanForm>) => void;
  reset: () => void;
}

export const usePlanForm = create<PlanFormState>((set) => ({
  form: {},
  update: (data) =>
    set((state) => ({ form: { ...state.form, ...data } })),
  reset: () => set({ form: {} }),
}));