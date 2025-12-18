
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
  [PredefinedShift.Manana]: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]',
  [PredefinedShift.Tarde]: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
  [PredefinedShift.Noche]: 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe]',
  [PredefinedShift.Libre]: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]',
  'Sin Asignar': 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]',
};

export const LOCAL_STORAGE_KEY = 'rotativeShiftSchedulerData_v1';
export const DEFAULT_OVERTIME_PAY_PERIOD_START_DAY = 16;

export const GOOGLE_CLIENT_ID = '';
