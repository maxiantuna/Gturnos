
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

  // Payment for 'currentDisplayMonth' (M)
  // Period is from Day D of Month M-2, to Day D-1 of Month M-1.
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
    return formatDate(date, { day: 'numeric', month: 'long' });
  };

  const paymentMonthName = getMonthName(currentDisplayMonth.getMonth());
  const paymentYear = currentDisplayMonth.getFullYear();

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{t('monthlySummary.title')}</h3>
      <p className="text-sm text-slate-600 mb-3">
        {t('monthlySummary.paymentForLabel', { month: paymentMonthName, year: paymentYear })}
      </p>
      <p className="text-xs text-slate-500 mb-3">
        {t('monthlySummary.periodCoveredLabel', { 
          startDate: formatSummaryDisplayDate(periodStartDate), 
          endDate: formatSummaryDisplayDate(periodEndDate) 
        })}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-sky-100 rounded">
          <p className="text-sm text-sky-700">{t('monthlySummary.normalOvertimeLabel')}</p>
          <p className="text-2xl font-bold text-sky-800">{totalNormalHours.toFixed(1)} hs</p>
        </div>
        <div className="p-3 bg-indigo-100 rounded">
          <p className="text-sm text-indigo-700">{t('monthlySummary.nightOvertimeLabel')}</p>
          <p className="text-2xl font-bold text-indigo-800">{totalNightHours.toFixed(1)} hs</p>
        </div>
      </div>
       { (totalNormalHours === 0 && totalNightHours === 0) &&
        <p className="text-sm text-slate-500 mt-3">
          {t('monthlySummary.noOvertimeMessage')}
        </p>
      }
    </div>
  );
};

export default MonthlySummary;
