
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
  <div className="flex items-center justify-between mb-1 px-1 py-0.5">
    <button
      onClick={() => onNavigateMonth(-1)}
      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
      aria-label={t('buttons.previousMonth')}
    >
      <span className="text-lg">←</span>
    </button>
    <h2 className="text-base md:text-lg font-bold text-slate-800 capitalize">
      {monthName} <span className="text-slate-400 font-medium">{year}</span>
    </h2>
    <button
      onClick={() => onNavigateMonth(1)}
      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
      aria-label={t('buttons.nextMonth')}
    >
      <span className="text-lg">→</span>
    </button>
  </div>
  );
};

const DayCell: React.FC<{dayInfo: DayInfo, onDayClick: (dayInfo: DayInfo) => void}> = ({ dayInfo, onDayClick }) => {
  const { t, getShiftDisplayName } = useLanguage();
  const shiftColorClass = SHIFT_COLORS[dayInfo.shift] || SHIFT_COLORS['Sin Asignar'];
  const displayedShiftName = getShiftDisplayName(dayInfo.shift);
  
  let cellClasses = `relative p-0.5 border-r border-b text-center h-[12vh] min-h-[50px] md:h-24 flex flex-col justify-between items-center cursor-pointer transition-colors overflow-hidden ${shiftColorClass}`;
  
  if (!dayInfo.isCurrentMonth) {
    cellClasses += ' opacity-30 grayscale-[0.8]';
  }
  if (dayInfo.isToday) {
    cellClasses += ' ring-inset ring-2 ring-blue-500 z-10';
  }
  if (dayInfo.isOverridden) {
    cellClasses += ' border-l-2 border-l-blue-600';
  }

  return (
    <div className={cellClasses} onClick={() => onDayClick(dayInfo)} role="button">
      <div className="w-full flex justify-between items-start">
        <span className={`text-[9px] md:text-xs font-bold leading-none ${dayInfo.isToday ? 'bg-blue-600 text-white w-4 h-4 flex items-center justify-center rounded-full' : 'text-slate-500'}`}>
          {dayInfo.date.getDate()}
        </span>
        {dayInfo.isOverridden && (
          <span className="text-blue-700 text-[8px] font-black" title={t('calendar.overriddenShiftTooltip')}>
            ●
          </span>
        )}
      </div>

      <span className="text-[8px] md:text-xs font-bold uppercase tracking-tighter leading-[0.85] mb-auto mt-0.5 break-words w-full line-clamp-2 px-0.5">
        {displayedShiftName}
      </span>

      {(dayInfo.overtime && (dayInfo.overtime.normalHours > 0 || dayInfo.overtime.nightHours > 0)) && (
        <div className="w-full flex justify-center pb-0.5">
           <span className="text-[7px] md:text-[9px] bg-rose-600 text-white px-0.5 rounded-[2px] font-black shadow-sm">
            {dayInfo.overtime.normalHours + dayInfo.overtime.nightHours}h
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-grow shrink">
      <div className="bg-slate-50 border-b border-slate-200 shrink-0">
        <CalendarHeader currentDisplayMonth={currentDisplayMonth} onNavigateMonth={onNavigateMonth} />
      </div>
      
      <div className="grid grid-cols-7 border-t border-l border-slate-100 flex-grow" role="grid">
        {[0,1,2,3,4,5,6].map(idx => (
          <div key={idx} className="py-1 text-center bg-slate-50 border-r border-b border-slate-200 shrink-0" role="columnheader">
            <span className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {getShortWeekdayName(idx)}
            </span>
            <span className="block md:hidden text-[10px] font-black text-slate-400">
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
