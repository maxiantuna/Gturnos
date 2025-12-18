
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

  // Iconos visuales para los botones de añadir
  const getShiftIcon = (shift: PredefinedShift) => {
    switch(shift) {
      case PredefinedShift.Manana: return '☀️';
      case PredefinedShift.Tarde: return '⛅';
      case PredefinedShift.Noche: return '🌙';
      case PredefinedShift.Libre: return '🌴';
      default: return '📍';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('shiftSetupModal.title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <span className="text-2xl">✕</span>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* FECHA DE INICIO */}
          <div>
            <label htmlFor="startDate" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              {t('shiftSetupModal.rotationStartDateLabel')}
            </label>
            <input
              type="date"
              id="startDate"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
            />
          </div>

          {/* PATRÓN DE ROTACIÓN */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                {t('shiftSetupModal.rotationPatternLabel')}
              </label>
              {patternArray.length > 0 && (
                <button
                  onClick={handleClearPattern}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl min-h-[80px] items-start content-start">
              {patternArray.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center py-4">
                  <span className="text-slate-400 text-sm font-medium italic">
                    {t('shifts.patternEmptyError')}
                  </span>
                </div>
              ) : (
                patternArray.map((shift, index) => (
                  <button
                    key={`${shift}-${index}`}
                    onClick={() => handleRemoveShift(index)}
                    className={`pl-3 pr-2 py-2 rounded-xl text-xs font-black border-b-2 flex items-center gap-2 hover:scale-95 transition-transform ${SHIFT_COLORS[shift]}`}
                  >
                    {getShiftIcon(shift)} {getShiftDisplayName(shift)}
                    <span className="bg-black/10 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">✕</span>
                  </button>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ALL_PREDEFINED_SHIFTS_VALUES.map((shift) => (
                <button
                  key={shift}
                  onClick={() => handleAddShift(shift)}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-b-4 font-black transition-all active:scale-95 hover:brightness-95 ${SHIFT_COLORS[shift]}`}
                >
                  <span className="text-xl">{getShiftIcon(shift)}</span>
                  <span className="text-xs uppercase tracking-tighter">{getShiftDisplayName(shift)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DÍA DE PAGO */}
          <div>
            <label htmlFor="overtimeStartDay" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              {t('shiftSetupModal.overtimePayPeriodStartDayLabel')}
            </label>
            <input
              type="number"
              id="overtimeStartDay"
              value={overtimeStartDayInput}
              onChange={(e) => setOvertimeStartDayInput(parseInt(e.target.value, 10))}
              min="1"
              max="28"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-black text-slate-700"
            />
            <p className="text-[10px] text-slate-400 mt-2 leading-tight font-medium">
              {t('shiftSetupModal.overtimePayPeriodStartDayHelpText')}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-pulse">
               <p className="text-rose-600 text-xs font-bold flex items-center gap-2">
                  <span className="text-lg">⚠️</span> {error}
               </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 font-black text-sm transition-colors"
            >
              {t('buttons.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-black text-sm shadow-xl shadow-blue-200 transition-all active:scale-95"
            >
              {t('buttons.saveSettings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftSetupModal;
