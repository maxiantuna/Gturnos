
import { PredefinedShift, DisplayShift } from './types';

export const ALL_PREDEFINED_SHIFTS_VALUES: PredefinedShift[] = [
  PredefinedShift.Manana,
  PredefinedShift.Tarde,
  PredefinedShift.Noche,
  PredefinedShift.Libre,
];

export const SHIFT_STRING_TO_ENUM_MAP: Record<string, PredefinedShift> = {
  'mañana': PredefinedShift.Manana,
  'manana': PredefinedShift.Manana,
  'tarde': PredefinedShift.Tarde,
  'noche': PredefinedShift.Noche,
  'libre': PredefinedShift.Libre,
  'morning': PredefinedShift.Manana,
  'afternoon': PredefinedShift.Tarde,
  'night': PredefinedShift.Noche,
  'off': PredefinedShift.Libre,
  'free': PredefinedShift.Libre,
};

export const SHIFT_COLORS: Record<DisplayShift, string> = {
  [PredefinedShift.Manana]: 'bg-sky-200 text-sky-800 border-sky-400',
  [PredefinedShift.Tarde]: 'bg-amber-200 text-amber-800 border-amber-400',
  [PredefinedShift.Noche]: 'bg-indigo-300 text-indigo-900 border-indigo-500',
  [PredefinedShift.Libre]: 'bg-emerald-200 text-emerald-800 border-emerald-400',
  'Sin Asignar': 'bg-slate-200 text-slate-600 border-slate-400',
};

export const LOCAL_STORAGE_KEY = 'rotativeShiftSchedulerData_v1';
export const DEFAULT_OVERTIME_PAY_PERIOD_START_DAY = 16;

// Added GOOGLE_CLIENT_ID constant to fix the import error in AuthContext.tsx
export const GOOGLE_CLIENT_ID = '';