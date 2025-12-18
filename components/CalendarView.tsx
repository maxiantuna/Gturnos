
import React from 'react';
import { DayInfo, DisplayShift } from '../types';
import { SHIFT_COLORS } from '../constants';
import { useLanguage } from '../hooks/useLanguage';

interface CalendarViewProps {
  days: DayInfo[];
  currentDisplayMonth: Date;
  onDayClick: (dayInfo: DayInfo) => void; 
  onNavigateMonth: (offset: number) => void;
}

const CalendarHeader: React.FC<{currentDisplayMonth: Date, onNavigateMonth: (offset: number) => void}> = ({ currentDisplayMonth, onNavigateMonth }) => {
  const { t, getMonthName } = useLanguage();
  const monthName = getMonthName(currentDisplayMonth.getMonth());
  const year = currentDisplayMonth.getFullYear();

  return (
  <div className="flex items-center justify-between mb-4 px-1">
    <button
      onClick={() => onNavigateMonth(-1)}
      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm active:scale-95"
      aria-label={t('buttons.previousMonth')}
    >
      <span className="text-xl">←</span>
    </button>
    <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
      {monthName} <span className="text-slate-400 dark:text-slate-500 font-medium">{year}</span>
    </h2>
    <button
      onClick={() => onNavigateMonth(1)}
      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm active:scale-95"
      aria-label={t('buttons.nextMonth')}
    >
      <span className="text-xl">→</span>
    </button>
  </div>
  );
};

const DayCell: React.FC<{dayInfo: DayInfo, onDayClick: (dayInfo: DayInfo) => void}> = ({ dayInfo, onDayClick }) => {
  const { t, getShiftDisplayName } = useLanguage();
  const shiftColorClass = SHIFT_COLORS[dayInfo.shift] || SHIFT_COLORS['Sin Asignar'];
  const displayedShiftName = getShiftDisplayName(dayInfo.shift);
  
  let cellClasses = `relative p-1 border-r border-b dark:border-slate-700 text-center h-20 md:h-28 flex flex-col justify-between items-center cursor-pointer transition-colors overflow-hidden ${shiftColorClass}`;
  
  // En modo oscuro, suavizamos los fondos muy claros de las celdas asignadas
  if (dayInfo.shift !== 'Sin Asignar') {
    cellClasses += ' dark:brightness-[0.8] dark:contrast-[1.1]';
  }

  if (!dayInfo.isCurrentMonth) {
    cellClasses += ' opacity-40 grayscale-[0.5] dark:opacity-20';
  }
  if (dayInfo.isToday) {
    cellClasses += ' ring-inset ring-2 ring-blue-500 z-10';
  }
  if (dayInfo.isOverridden) {
    cellClasses += ' border-l-4 border-l-blue-600';
  }

  const overtimeTooltip = dayInfo.overtime && (dayInfo.overtime.normalHours > 0 || dayInfo.overtime.nightHours > 0) 
    ? t('calendar.overtimeIndicatorTooltip', { normal: dayInfo.overtime.normalHours, night: dayInfo.overtime.nightHours })
    : '';

  return (
    <div className={cellClasses} onClick={() => onDayClick(dayInfo)} role="button">
      <div className="w-full flex justify-between items-start">
        <span className={`text-[10px] md:text-xs font-bold ${dayInfo.isToday ? 'bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-md' : 'text-slate-500 dark:text-slate-400'}`}>
          {dayInfo.date.getDate()}
        </span>
        {dayInfo.isOverridden && (
          <span className="text-blue-700 dark:text-blue-400 text-[10px] font-black" title={t('calendar.overriddenShiftTooltip')}>
            {t('calendar.overriddenShiftIndicator')}
          </span>
        )}
      </div>

      <span className="text-[9px] md:text-xs font-bold uppercase tracking-tighter leading-tight mb-auto mt-1 break-words w-full line-clamp-2 dark:drop-shadow-sm">
        {displayedShiftName}
      </span>

      {(dayInfo.overtime && (dayInfo.overtime.normalHours > 0 || dayInfo.overtime.nightHours > 0)) && (
        <div className="w-full flex justify-center pb-0.5">
           <span className="text-[8px] md:text-[10px] bg-rose-600 text-white px-1 rounded-sm font-bold shadow-sm">
            {t('calendar.overtimeIndicator')}
          </span>
        </div>
      )}
    </div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({ days, currentDisplayMonth, onDayClick, onNavigateMonth }) => {
  const { t, getShortWeekdayName } = useLanguage();
  
  const getMobileDayName = (idx: number) => {
    const name = getShortWeekdayName(idx);
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <CalendarHeader currentDisplayMonth={currentDisplayMonth} onNavigateMonth={onNavigateMonth} />
      </div>
      
      <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-700" role="grid">
        {[0,1,2,3,4,5,6].map(idx => (
          <div key={idx} className="py-2 text-center bg-slate-50 dark:bg-slate-900/50 border-r border-b border-slate-200 dark:border-slate-700" role="columnheader">
            <span className="hidden md:block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {getShortWeekdayName(idx)}
            </span>
            <span className="block md:hidden text-xs font-black text-slate-400 dark:text-slate-500">
              {getMobileDayName(idx)}
            </span>
          </div>
        ))}
        {days.map((dayInfo) => (
          <DayCell key={dayInfo.date.toISOString()} dayInfo={dayInfo} onDayClick={onDayClick} />
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
