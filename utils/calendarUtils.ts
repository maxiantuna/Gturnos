
import { DayInfo, ShiftPattern, PredefinedShift, DailyOvertime, DisplayShift } from '../types';
import { SHIFT_STRING_TO_ENUM_MAP } from '../constants'; // For parsing

export const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const calculateShiftFromPattern = (
  targetDate: Date,
  rotationStartDate: Date | null,
  pattern: ShiftPattern | null
): DisplayShift => {
  if (!rotationStartDate || !pattern || pattern.length === 0) {
    return 'Sin Asignar';
  }

  const normTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const normStartDate = new Date(rotationStartDate.getFullYear(), rotationStartDate.getMonth(), rotationStartDate.getDate());

  if (normTargetDate.getTime() < normStartDate.getTime()) {
    return 'Sin Asignar';
  }

  const diffTime = Math.abs(normTargetDate.getTime() - normStartDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const patternIndex = diffDays % pattern.length;
  return pattern[patternIndex];
};

export const generateCalendarDays = (
  displayMonthDate: Date,
  rotationStartDate: Date | null,
  rotationPattern: ShiftPattern | null,
  overtimeData: Map<string, DailyOvertime>,
  shiftOverrides: Map<string, PredefinedShift>
): DayInfo[] => {
  const year = displayMonthDate.getFullYear();
  const month = displayMonthDate.getMonth();
  const today = new Date();
  today.setHours(0,0,0,0); 

  const firstDayOfMonth = new Date(year, month, 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay()); 

  const days: DayInfo[] = [];
  for (let i = 0; i < 42; i++) { 
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    currentDate.setHours(0,0,0,0);

    const dateKey = formatDateToYYYYMMDD(currentDate);
    
    const shiftFromPattern = calculateShiftFromPattern(currentDate, rotationStartDate, rotationPattern);
    const overriddenShift = shiftOverrides.get(dateKey);
    const effectiveShift = overriddenShift || shiftFromPattern;
    const isOverridden = !!overriddenShift && overriddenShift !== shiftFromPattern;

    const overtime = overtimeData.get(dateKey);

    days.push({
      date: currentDate,
      shift: effectiveShift,
      originalShiftFromPattern: shiftFromPattern,
      overtime: overtime,
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.getTime() === today.getTime(),
      isOverridden: isOverridden,
    });
  }
  return days;
};

export const parseShiftPatternString = (patternStr: string): ShiftPattern | null => {
  if (!patternStr.trim()) return []; 
  const parts = patternStr.split(',').map(s => s.trim().toLowerCase());
  const parsedPattern: ShiftPattern = [];
  for (const part of parts) {
    if (SHIFT_STRING_TO_ENUM_MAP[part]) { // Use the expanded map from constants
      parsedPattern.push(SHIFT_STRING_TO_ENUM_MAP[part]);
    } else {
      return null; 
    }
  }
  return parsedPattern.length > 0 ? parsedPattern : null;
};
