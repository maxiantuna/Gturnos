
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
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="container mx-auto px-2 md:px-4 max-w-5xl">
        <header className="flex justify-between items-center pt-6 pb-4 md:py-6">
          <div className="flex items-center gap-2">
              <div className="bg-blue-600 w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-lg flex items-center justify-center text-white">
                <span className="text-lg md:text-xl">🗓️</span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-none">{t('app.name')}</h1>
          </div>
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="w-10 h-10 md:w-auto md:px-4 md:py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center text-sm font-bold shadow-lg"
            title={t('buttons.configureRotation')}
          >
            <span className="md:mr-2">⚙️</span>
            <span className="hidden md:inline">{t('buttons.configureRotation')}</span>
          </button>
        </header>

        {(!rotationPattern || !rotationStartDate) && initialLoadComplete && (
          <div className="p-6 md:p-10 bg-white border border-blue-100 rounded-2xl mb-6 shadow-sm text-center">
            <div className="text-4xl mb-3">👋</div>
            <h2 className="text-lg font-bold mb-1 text-slate-800">{t('welcomeMessage.title')}</h2>
            <p className="mb-6 text-sm text-slate-500">{t('welcomeMessage.noSetupText')}</p>
            <button 
              onClick={() => setIsSetupModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
            >
              {t('buttons.configureRotation')}
            </button>
          </div>
        )}

        <div className="space-y-4 md:space-y-6">
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
