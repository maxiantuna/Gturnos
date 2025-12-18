
export enum PredefinedShift {
  Manana = 'Mañana',
  Tarde = 'Tarde',
  Noche = 'Noche',
  Libre = 'Libre',
}

// Added User interface to fix the import error in AuthContext.tsx
export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export type DisplayShift = PredefinedShift | 'Sin Asignar';

export type ShiftPattern = PredefinedShift[];

export interface DailyOvertime {
  normalHours: number;
  nightHours: number;
}

export interface DayInfo {
  date: Date;
  shift: DisplayShift;
  originalShiftFromPattern?: DisplayShift;
  overtime?: DailyOvertime;
  isCurrentMonth: boolean;
  isToday: boolean;
  isOverridden: boolean;
}

export const REVERT_TO_PATTERN_SHIFT = 'REVERT_TO_PATTERN_SHIFT_TYPE';
export type ShiftOverrideSetting = PredefinedShift | typeof REVERT_TO_PATTERN_SHIFT;

export interface StoredData {
  rotationPattern?: ShiftPattern;
  rotationStartDate?: string;
  overtimeData?: Array<[string, DailyOvertime]>;
  shiftOverrides?: Array<[string, PredefinedShift]>;
  overtimePayPeriodStartDay?: number;
}