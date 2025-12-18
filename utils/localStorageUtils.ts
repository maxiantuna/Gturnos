
import { StoredData, ShiftPattern, DailyOvertime, PredefinedShift } from '../types';
import { LOCAL_STORAGE_KEY, DEFAULT_OVERTIME_PAY_PERIOD_START_DAY } from '../constants';

export const loadDataFromLocalStorage = (): StoredData => {
  const storedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedDataString) {
    try {
      const parsed = JSON.parse(storedDataString) as StoredData;
      
      if (parsed.shiftOverrides && !Array.isArray(parsed.shiftOverrides)) {
        parsed.shiftOverrides = Object.entries(parsed.shiftOverrides);
      }
      if (parsed.overtimePayPeriodStartDay === undefined || parsed.overtimePayPeriodStartDay === null) {
        parsed.overtimePayPeriodStartDay = DEFAULT_OVERTIME_PAY_PERIOD_START_DAY;
      }
      return parsed;
    } catch (error) {
      console.error("Error parsing data from localStorage:", error);
      return { overtimePayPeriodStartDay: DEFAULT_OVERTIME_PAY_PERIOD_START_DAY };
    }
  }
  return { overtimePayPeriodStartDay: DEFAULT_OVERTIME_PAY_PERIOD_START_DAY };
};

export const saveDataToLocalStorage = (data: {
  rotationPattern: ShiftPattern | null;
  rotationStartDate: Date | null;
  overtimeData: Map<string, DailyOvertime>;
  shiftOverrides: Map<string, PredefinedShift>;
  overtimePayPeriodStartDay: number | null;
}): void => {
  const dataToStore: StoredData = {
    rotationPattern: data.rotationPattern || undefined,
    rotationStartDate: data.rotationStartDate?.toISOString() || undefined,
    overtimeData: Array.from(data.overtimeData.entries()),
    shiftOverrides: Array.from(data.shiftOverrides.entries()),
    overtimePayPeriodStartDay: data.overtimePayPeriodStartDay ?? DEFAULT_OVERTIME_PAY_PERIOD_START_DAY,
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};
