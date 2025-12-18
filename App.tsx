
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CalendarView from './components/CalendarView';
import ShiftSetupModal from './components/ShiftSetupModal';
import OvertimeModal from './components/OvertimeModal';
import MonthlySummary from './components/MonthlySummary';
import { ShiftPattern, DailyOvertime, DayInfo, PredefinedShift, ShiftOverrideSetting, REVERT_TO_PATTERN_SHIFT } from './types';
import { generateCalendarDays, formatDateToYYYYMMDD } from './utils/calendarUtils';
import { loadDataFromLocalStorage, saveDataToLocalStorage } from './utils/localStorageUtils';
import { useLanguage } from './hooks/useLanguage';
import { DEFAULT_OVERTIME_PAY_PERIOD_START_DAY } from './constants';

const App: React.FC = () => {
  const { t } = useLanguage(); 

  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const [rotationPattern, setRotationPattern] = useState<ShiftPattern | null>(null);
  const [rotationStartDate, setRotationStartDate] = useState<Date | null>(null);
  const [overtimeData, setOvertimeData] = useState<Map<string, DailyOvertime>>(new Map());
  const [shiftOverrides, setShiftOverrides] = useState<Map<string, PredefinedShift>>(new Map());
  const [overtimePayPeriodStartDay, setOvertimePayPeriodStartDay] = useState<number | null>(DEFAULT_OVERTIME_PAY_PERIOD_START_DAY);

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState<DayInfo | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const loadedData = loadDataFromLocalStorage();
    if (loadedData.rotationPattern) setRotationPattern(loadedData.rotationPattern);
    if (loadedData.rotationStartDate) {
      const startDate = new Date(loadedData.rotationStartDate);
      startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
      setRotationStartDate(startDate);
    }
    setOvertimeData(new Map(loadedData.overtimeData || []));
    setShiftOverrides(new Map(loadedData.shiftOverrides || []));
    setOvertimePayPeriodStartDay(loadedData.overtimePayPeriodStartDay ?? DEFAULT_OVERTIME_PAY_PERIOD_START_DAY);
    setInitialLoadComplete(true);
  }, []);

  useEffect(() => {
    if (initialLoadComplete) { 
      saveDataToLocalStorage({ 
        rotationPattern, 
        rotationStartDate, 
        overtimeData, 
        shiftOverrides, 
        overtimePayPeriodStartDay 
      });
    }
  }, [rotationPattern, rotationStartDate, overtimeData, shiftOverrides, overtimePayPeriodStartDay, initialLoadComplete]);

  const handleSaveSetup = useCallback((pattern: ShiftPattern, startDate: Date, newOvertimeStartDay: number) => {
    setRotationPattern(pattern);
    setRotationStartDate(startDate);
    setOvertimePayPeriodStartDay(newOvertimeStartDay);
  }, []);

  const handleSaveDayDetails = useCallback((date: Date, overtime: DailyOvertime, shiftSetting?: ShiftOverrideSetting) => {
    const dateKey = formatDateToYYYYMMDD(date);
    
    setOvertimeData(prevData => {
      const newData = new Map(prevData);
      if (overtime.normalHours === 0 && overtime.nightHours === 0) {
        newData.delete(dateKey); 
      } else {
        newData.set(dateKey, overtime);
      }
      return newData;
    });

    setShiftOverrides(prevOverrides => {
      const newOverrides = new Map(prevOverrides);
      if (shiftSetting === REVERT_TO_PATTERN_SHIFT) {
        newOverrides.delete(dateKey);
      } else if (shiftSetting && Object.values(PredefinedShift).includes(shiftSetting as PredefinedShift)) {
        newOverrides.set(dateKey, shiftSetting as PredefinedShift);
      }
      return newOverrides;
    });
  }, []);

  const handleMonthNavigate = useCallback((offset: number) => {
    setCurrentDisplayMonth(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  }, []);

  const handleDayClick = useCallback((dayInfo: DayInfo) => {
    setSelectedDayDetails(dayInfo);
  }, []);

  const calendarDays: DayInfo[] = useMemo(() => {
    return generateCalendarDays(currentDisplayMonth, rotationStartDate, rotationPattern, overtimeData, shiftOverrides);
  }, [currentDisplayMonth, rotationStartDate, rotationPattern, overtimeData, shiftOverrides]);

  return (
    <div className="h-full bg-slate-50 overflow-hidden flex flex-col">
      <div className="container mx-auto px-2 md:px-4 max-w-5xl flex flex-col h-full py-1 md:py-4">
        <header className="flex justify-between items-center py-2 shrink-0">
          <div className="flex items-center gap-2">
              <div className="bg-blue-600 w-7 h-7 md:w-9 md:h-9 rounded-lg shadow-md flex items-center justify-center text-white">
                <span className="text-sm md:text-lg">🗓️</span>
              </div>
              <h1 className="text-base md:text-xl font-black text-slate-800 tracking-tight leading-none">{t('app.name')}</h1>
          </div>
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="w-8 h-8 md:w-auto md:px-3 md:py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all flex items-center justify-center text-sm font-bold shadow-md"
            title={t('buttons.configureRotation')}
          >
            <span className="md:mr-1">⚙️</span>
            <span className="hidden md:inline text-xs">{t('buttons.configureRotation')}</span>
          </button>
        </header>

        {(!rotationPattern || !rotationStartDate) && initialLoadComplete && (
          <div className="p-4 bg-white border border-blue-100 rounded-xl mb-2 shadow-sm text-center shrink-0">
            <h2 className="text-sm font-bold text-slate-800">{t('welcomeMessage.title')}</h2>
            <p className="text-[10px] text-slate-500 mb-2">{t('welcomeMessage.noSetupText')}</p>
            <button 
              onClick={() => setIsSetupModalOpen(true)}
              className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md"
            >
              {t('buttons.configureRotation')}
            </button>
          </div>
        )}

        <div className="flex-grow overflow-hidden flex flex-col space-y-2">
          <CalendarView
            days={calendarDays}
            currentDisplayMonth={currentDisplayMonth}
            onDayClick={handleDayClick}
            onNavigateMonth={handleMonthNavigate}
          />
          
          <MonthlySummary 
            overtimeData={overtimeData} 
            currentDisplayMonth={currentDisplayMonth} 
            overtimePayPeriodStartDay={overtimePayPeriodStartDay}
          />
        </div>

        <ShiftSetupModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
          onSave={handleSaveSetup}
          currentPattern={rotationPattern}
          currentStartDate={rotationStartDate}
          currentOvertimePayPeriodStartDay={overtimePayPeriodStartDay}
        />
        
        {selectedDayDetails && (
          <OvertimeModal
            isOpen={!!selectedDayDetails}
            onClose={() => setSelectedDayDetails(null)}
            onSave={handleSaveDayDetails}
            selectedDate={selectedDayDetails.date}
            currentOvertime={overtimeData.get(formatDateToYYYYMMDD(selectedDayDetails.date))}
            currentDayShift={selectedDayDetails.shift}
            isShiftOverridden={selectedDayDetails.isOverridden}
            originalShiftFromPattern={selectedDayDetails.originalShiftFromPattern || 'Sin Asignar'}
          />
        )}
      </div>
    </div>
  );
};

export default App;
