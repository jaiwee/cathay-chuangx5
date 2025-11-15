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
  hasEntertainment: boolean; // Default to false
  hasMerch: boolean;         // Default to false
  hasCulinary: boolean;      // Default to false
}

interface PlanFormState {
  form: PlanForm;
  update: (data: Partial<PlanForm>) => void;
  reset: () => void;
}

export const usePlanForm = create<PlanFormState>((set) => ({
  form: {
    theme: "",
    event_name: "",
    event_date: "",
    event_time: "",
    event_location: "",
    origin_country: "",
    destination_country: "",
    time_pref: "",
    group_size: 0,
    hasEntertainment: false, // Default value
    hasMerch: false,         // Default value
    hasCulinary: false,      // Default value
  },
  update: (data) =>
    set((state) => ({ form: { ...state.form, ...data } })),
  reset: () =>
    set({
      form: {
        theme: "",
        event_name: "",
        event_date: "",
        event_time: "",
        event_location: "",
        origin_country: "",
        destination_country: "",
        time_pref: "",
        group_size: 0,
        hasEntertainment: false,
        hasMerch: false,
        hasCulinary: false,
      },
    }),
}));