
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
  const paymentYear = currentDisplayMonth.getFullYear();

  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col mb-4">
        <h3 className="text-base font-bold text-slate-800">{t('monthlySummary.title')}</h3>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">
          {t('monthlySummary.paymentForLabel', { month: paymentMonthName, year: paymentYear })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl">
          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-tight mb-1">{t('monthlySummary.normalOvertimeLabel')}</p>
          <p className="text-xl font-black text-sky-900">{totalNormalHours.toFixed(1)}<span className="text-sm ml-0.5">hs</span></p>
        </div>
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight mb-1">{t('monthlySummary.nightOvertimeLabel')}</p>
          <p className="text-xl font-black text-indigo-900">{totalNightHours.toFixed(1)}<span className="text-sm ml-0.5">hs</span></p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">
          Período: {formatSummaryDisplayDate(periodStartDate)} - {formatSummaryDisplayDate(periodEndDate)}
        </span>
        { (totalNormalHours === 0 && totalNightHours === 0) && (
          <span className="text-[10px] text-slate-300 italic">{t('monthlySummary.noOvertimeMessage')}</span>
        )}
      </div>
    </div>
  );
};

export default MonthlySummary;
