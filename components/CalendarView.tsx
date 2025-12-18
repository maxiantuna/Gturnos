
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
  <div className="flex items-center justify-between mb-4">
    <button
      onClick={() => onNavigateMonth(-1)}
      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors text-lg"
      aria-label={t('buttons.previousMonth')}
      title={t('buttons.previousMonth')}
    >
      &#x2190; {/* Left arrow */}
    </button>
    <h2 className="text-xl md:text-2xl font-semibold text-slate-700">
      {t('calendar.headerTitle', { month: monthName, year })}
    </h2>
    <button
      onClick={() => onNavigateMonth(1)}
      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors text-lg"
      aria-label={t('buttons.nextMonth')}
      title={t('buttons.nextMonth')}
    >
      &#x2192; {/* Right arrow */}
    </button>
  </div>
  );
};

const DayCell: React.FC<{dayInfo: DayInfo, onDayClick: (dayInfo: DayInfo) => void}> = ({ dayInfo, onDayClick }) => {
  const { t, getShiftDisplayName } = useLanguage();
  const shiftColorClass = SHIFT_COLORS[dayInfo.shift] || SHIFT_COLORS['Sin Asignar'];
  const displayedShiftName = getShiftDisplayName(dayInfo.shift);
  
  let cellClasses = `p-1.5 md:p-2 border text-center h-28 md:h-32 flex flex-col justify-start items-center cursor-pointer transition-shadow hover:shadow-md relative ${shiftColorClass}`;
  if (!dayInfo.isCurrentMonth) {
    cellClasses += ' opacity-60';
  }
  if (dayInfo.isToday) {
    cellClasses += ' ring-2 ring-blue-500 ring-offset-1';
  }
   if (dayInfo.isOverridden) {
    cellClasses += ' border-dashed border-purple-500';
  }

  const overtimeTooltip = dayInfo.overtime && (dayInfo.overtime.normalHours > 0 || dayInfo.overtime.nightHours > 0) 
    ? t('calendar.overtimeIndicatorTooltip', { normal: dayInfo.overtime.normalHours, night: dayInfo.overtime.nightHours })
    : '';

  return (
    <div className={cellClasses} onClick={() => onDayClick(dayInfo)} role="button" tabIndex={0} 
         aria-label={`${dayInfo.date.getDate()} ${getShiftDisplayName(dayInfo.shift)} ${dayInfo.isOverridden ? t('calendar.overriddenShiftTooltip') : ''} ${overtimeTooltip || ''}`}>
      <span className={`font-medium text-xs md:text-sm ${!dayInfo.isCurrentMonth ? 'text-slate-500' : ''}`}>
        {dayInfo.date.getDate()}
      </span>
      <span className="mt-1 text-xs md:text-sm font-semibold block truncate w-full px-0.5" title={displayedShiftName}>
        {displayedShiftName}
        {dayInfo.isOverridden && <span className="text-purple-600 ml-0.5" title={t('calendar.overriddenShiftTooltip')}>{t('calendar.overriddenShiftIndicator')}</span>}
      </span>
      {(dayInfo.overtime && (dayInfo.overtime.normalHours > 0 || dayInfo.overtime.nightHours > 0)) && (
        <div className="absolute bottom-1 right-1 md:bottom-1.5 md:right-1.5">
           <span className="block text-[10px] md:text-xs bg-rose-500 text-white px-1 md:px-1.5 py-0.5 rounded-full shadow" title={overtimeTooltip}>
            {t('calendar.overtimeIndicator')}
          </span>
        </div>
      )}
    </div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({ days, currentDisplayMonth, onDayClick, onNavigateMonth }) => {
  const { t, getShortWeekdayName } = useLanguage();
  const weekDayNames = [0,1,2,3,4,5,6].map(idx => getShortWeekdayName(idx));
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <CalendarHeader currentDisplayMonth={currentDisplayMonth} onNavigateMonth={onNavigateMonth} />
      <div className="grid grid-cols-7 gap-px border-l border-t border-slate-300 bg-slate-300" role="grid">
        {weekDayNames.map(dayName => (
          <div key={dayName} className="py-2 text-center font-medium text-xs md:text-sm text-slate-600 bg-slate-100 border-b border-r border-slate-300" role="columnheader">
            {dayName}
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
