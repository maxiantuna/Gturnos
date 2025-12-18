
import React, { useState, useEffect } from 'react';
import { ShiftPattern, PredefinedShift } from '../types';
import { ALL_PREDEFINED_SHIFTS_VALUES, SHIFT_COLORS } from '../constants';
import { useLanguage } from '../hooks/useLanguage';

interface ShiftSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pattern: ShiftPattern, startDate: Date, overtimeStartDay: number) => void;
  currentPattern: ShiftPattern | null;
  currentStartDate: Date | null;
  currentOvertimePayPeriodStartDay: number | null;
}

const ShiftSetupModal: React.FC<ShiftSetupModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    currentPattern, 
    currentStartDate,
    currentOvertimePayPeriodStartDay 
}) => {
  const { t, getShiftDisplayName } = useLanguage();
  const [patternArray, setPatternArray] = useState<PredefinedShift[]>([]);
  const [startDateInput, setStartDateInput] = useState('');
  const [overtimeStartDayInput, setOvertimeStartDayInput] = useState<number>(currentOvertimePayPeriodStartDay || 16);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPatternArray(currentPattern || []);
      setStartDateInput(currentStartDate ? currentStartDate.toISOString().split('T')[0] : '');
      setOvertimeStartDayInput(currentOvertimePayPeriodStartDay || 16);
      setError(null);
    }
  }, [isOpen, currentPattern, currentStartDate, currentOvertimePayPeriodStartDay]);

  if (!isOpen) return null;

  const handleAddShift = (shift: PredefinedShift) => {
    setPatternArray([...patternArray, shift]);
    setError(null);
  };

  const handleRemoveShift = (index: number) => {
    setPatternArray(patternArray.filter((_, i) => i !== index));
  };

  const handleClearPattern = () => {
    setPatternArray([]);
  };

  const handleSubmit = () => {
    setError(null);
    if (!startDateInput) {
      setError(t('shiftSetupModal.startDateError'));
      return;
    }
    
    if (patternArray.length === 0) {
        setError(t('shifts.patternEmptyError'));
        return;
    }

    const startDate = new Date(startDateInput);
    startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());

    const finalOvertimeStartDay = Number(overtimeStartDayInput);
    if (isNaN(finalOvertimeStartDay) || finalOvertimeStartDay < 1 || finalOvertimeStartDay > 28) {
        setError(t('shiftSetupModal.overtimePayPeriodStartDayLabel')); 
        return;
    }

    onSave(patternArray, startDate, finalOvertimeStartDay);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md my-8">
        <h2 className="text-2xl font-semibold mb-4 text-slate-700">{t('shiftSetupModal.title')}</h2>
        
        <div className="mb-6">
          <label htmlFor="startDate" className="block text-sm font-medium text-slate-600 mb-2">
            {t('shiftSetupModal.rotationStartDateLabel')}
          </label>
          <input
            type="date"
            id="startDate"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            aria-required="true"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-3">
            {t('shiftSetupModal.rotationPatternLabel')}
          </label>
          
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg min-h-[60px] items-center">
            {patternArray.length === 0 ? (
              <span className="text-slate-400 text-sm italic w-full text-center">
                {t('shifts.patternEmptyError')}
              </span>
            ) : (
              patternArray.map((shift, index) => (
                <button
                  key={`${shift}-${index}`}
                  onClick={() => handleRemoveShift(index)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 hover:scale-105 transition-transform ${SHIFT_COLORS[shift]}`}
                  title="Click para eliminar"
                >
                  {getShiftDisplayName(shift)}
                  <span className="text-current opacity-60">×</span>
                </button>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {ALL_PREDEFINED_SHIFTS_VALUES.map((shift) => (
              <button
                key={shift}
                onClick={() => handleAddShift(shift)}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-sm font-medium transition-all hover:brightness-95 active:scale-95 ${SHIFT_COLORS[shift]}`}
              >
                <span className="text-lg">+</span>
                {getShiftDisplayName(shift)}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleClearPattern}
            className="text-xs text-rose-600 font-medium hover:underline w-full text-right mt-1"
          >
            Limpiar secuencia
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="overtimeStartDay" className="block text-sm font-medium text-slate-600 mb-2">
            {t('shiftSetupModal.overtimePayPeriodStartDayLabel')}
          </label>
          <input
            type="number"
            id="overtimeStartDay"
            value={overtimeStartDayInput}
            onChange={(e) => setOvertimeStartDayInput(parseInt(e.target.value, 10))}
            min="1"
            max="28"
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
           <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {t('shiftSetupModal.overtimePayPeriodStartDayHelpText')}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-100 rounded-lg">
             <p className="text-rose-600 text-sm flex items-center gap-2" role="alert">
                <span className="text-lg">⚠️</span> {error}
             </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium transition-colors"
          >
            {t('buttons.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-100 transition-all"
          >
            {t('buttons.saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftSetupModal;
