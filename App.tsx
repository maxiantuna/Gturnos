
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CalendarView from './components/CalendarView';
import ShiftSetupModal from './components/ShiftSetupModal';
import OvertimeModal from './components/OvertimeModal';
import MonthlySummary from './components/MonthlySummary';
import { ShiftPattern, DailyOvertime, DayInfo, PredefinedShift, ShiftOverrideSetting, REVERT_TO_PATTERN_SHIFT } from './types';
import { generateCalendarDays, formatDateToYYYYMMDD } from './utils/calendarUtils';
import { loadDataFromLocalStorage, saveDataToLocalStorage } from './utils/localStorageUtils';
import { useLanguage } from './hooks/useLanguage';
import { useTheme } from './contexts/ThemeContext';
import { DEFAULT_OVERTIME_PAY_PERIOD_START_DAY } from './constants';

const App: React.FC = () => {
  const { t } = useLanguage(); 
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const [rotationPattern, setRotationPattern] = useState<ShiftPattern | null>(null);
  const [rotationStartDate, setRotationStartDate] = useState<Date | null>(null);
  const [overtimeData, setOvertimeData] = useState<Map<string, DailyOvertime>>(new Map());
  const [shiftOverrides, setShiftOverrides] = useState<Map<string, PredefinedShift>>(new Map());
  const [overtimePayPeriodStartDay, setOvertimePayPeriodStartDay] = useState<number | null>(DEFAULT_OVERTIME_PAY_PERIOD_START_DAY);

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState<DayInfo | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Estado de conexión
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar si el SW ya activó el caché
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsOfflineReady(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10 transition-colors duration-300">
      <div className="container mx-auto px-2 md:px-4 max-w-5xl">
        <header className="flex flex-col pt-6 pb-4 md:py-6">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-lg flex items-center justify-center text-white">
                  <span className="text-lg md:text-xl">🗓️</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">{t('app.name')}</h1>
                  {/* Indicador de Estado de Conexión */}
                  <div className="flex items-center gap-1.5 mt-1">
                    {!isOnline ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                        SIN CONEXIÓN
                      </span>
                    ) : isOfflineReady ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        LISTA OFFLINE
                      </span>
                    ) : null}
                  </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-95"
                aria-label="Toggle Dark Mode"
              >
                <span className="text-lg">{isDarkMode ? '☀️' : '🌙'}</span>
              </button>
              <button
                onClick={() => setIsSetupModalOpen(true)}
                className="w-10 h-10 md:w-auto md:px-4 md:py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-all flex items-center justify-center text-sm font-bold shadow-lg"
                title={t('buttons.configureRotation')}
              >
                <span className="md:mr-2">⚙️</span>
                <span className="hidden md:inline">{t('buttons.configureRotation')}</span>
              </button>
            </div>
          </div>
        </header>

        {(!rotationPattern || !rotationStartDate) && initialLoadComplete && (
          <div className="p-6 md:p-10 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl mb-6 shadow-sm text-center">
            <div className="text-4xl mb-3">👋</div>
            <h2 className="text-lg font-bold mb-1 text-slate-800 dark:text-slate-100">{t('welcomeMessage.title')}</h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{t('welcomeMessage.noSetupText')}</p>
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
