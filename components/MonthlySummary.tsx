
import React from 'react';
import { DailyOvertime } from '../types';
import { DEFAULT_OVERTIME_PAY_PERIOD_START_DAY } from '../constants';
import { useLanguage } from '../hooks/useLanguage';

interface MonthlySummaryProps {
  overtimeData: Map<string, DailyOvertime>;
  currentDisplayMonth: Date; 
  overtimePayPeriodStartDay: number | null;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ overtimeData, currentDisplayMonth, overtimePayPeriodStartDay }) => {
  const { t, formatDate, getMonthName } = useLanguage();
  let totalNormalHours = 0;
  let totalNightHours = 0;

  const startDay = overtimePayPeriodStartDay ?? DEFAULT_OVERTIME_PAY_PERIOD_START_DAY;

  const periodEndDate = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth() - 1, startDay - 1);
  periodEndDate.setHours(23, 59, 59, 999); 

  const periodStartDate = new Date(currentDisplayMonth.getFullYear(), currentDisplayMonth.getMonth() - 2, startDay);
  periodStartDate.setHours(0, 0, 0, 0);

  overtimeData.forEach((overtime, dateKey) => {
    const entryDate = new Date(dateKey + 'T00:00:00Z'); 
    
    if (entryDate >= periodStartDate && entryDate <= periodEndDate) {
      totalNormalHours += overtime.normalHours || 0;
      totalNightHours += overtime.nightHours || 0;
    }
  });
  
  const formatSummaryDisplayDate = (date: Date): string => {
    return formatDate(date, { day: 'numeric', month: 'short' });
  };

  const paymentMonthName = getMonthName(currentDisplayMonth.getMonth());

  return (
    <div className="px-3 py-2 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none">{t('monthlySummary.title')}</h3>
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
            {paymentMonthName}
          </p>
        </div>
        <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-full">
          {formatSummaryDisplayDate(periodStartDate)} - {formatSummaryDisplayDate(periodEndDate)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between p-2 bg-sky-50 border border-sky-100 rounded-lg">
          <span className="text-[9px] font-bold text-sky-600 uppercase tracking-tight">Normal</span>
          <p className="text-sm font-black text-sky-900">{totalNormalHours.toFixed(1)}<span className="text-[9px] ml-0.5 font-bold">h</span></p>
        </div>
        <div className="flex items-center justify-between p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
          <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-tight">Noche</span>
          <p className="text-sm font-black text-indigo-900">{totalNightHours.toFixed(1)}<span className="text-[9px] ml-0.5 font-bold">h</span></p>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
