
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
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-700">
        
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{t('shiftSetupModal.title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>
        
        <div className="space-y-5">
          {/* FECHA DE INICIO */}
          <div className="flex flex-col items-center">
            <div className="w-[90%]">
              <label htmlFor="startDate" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">
                {t('shiftSetupModal.rotationStartDateLabel')}
              </label>
              <input
                type="date"
                id="startDate"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 dark:focus:ring-blue-900/20 transition-all outline-none font-bold text-sm text-slate-700 dark:text-slate-200 shadow-sm"
              />
            </div>
          </div>

          {/* PATRÓN DE ROTACIÓN */}
          <div className="flex flex-col items-center">
            <div className="w-[90%] flex justify-between items-center mb-1.5 ml-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Secuencia de Turnos
              </label>
              {patternArray.length > 0 && (
                <button onClick={handleClearPattern} className="text-[10px] text-rose-500 dark:text-rose-400 font-bold hover:underline transition-all">
                  Limpiar todo
                </button>
              )}
            </div>
            
            <div className="w-[90%] flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl min-h-[50px] max-h-[100px] overflow-y-auto items-start content-start transition-all shadow-inner">
              {patternArray.length === 0 ? (
                <div className="w-full flex items-center justify-center py-2">
                  <span className="text-slate-400 dark:text-slate-600 text-[10px] font-medium italic text-center opacity-70">
                    Toca los turnos para armar tu ciclo
                  </span>
                </div>
              ) : (
                patternArray.map((shift, index) => (
                  <button
                    key={`${shift}-${index}`}
                    onClick={() => handleRemoveShift(index)}
                    className={`pl-2.5 pr-1.5 py-1.5 rounded-xl text-[10px] font-black border-b-2 flex items-center gap-2 hover:brightness-95 active:scale-95 transition-all shadow-sm dark:brightness-90 ${SHIFT_COLORS[shift]}`}
                  >
                    <span>{getShiftIcon(shift)}</span>
                    <span>{getShiftDisplayName(shift)}</span>
                    <span className="bg-black/10 w-4 h-4 flex items-center justify-center rounded-full text-[8px] ml-1">✕</span>
                  </button>
                ))
              )}
            </div>

            <div className="w-[90%] grid grid-cols-4 gap-2">
              {ALL_PREDEFINED_SHIFTS_VALUES.map((shift) => (
                <button
                  key={shift}
                  onClick={() => handleAddShift(shift)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border-b-4 font-black transition-all active:scale-95 shadow-md hover:brightness-95 dark:brightness-90 ${SHIFT_COLORS[shift]}`}
                >
                  <span className="text-xl mb-1">{getShiftIcon(shift)}</span>
                  <span className="text-[9px] uppercase tracking-tighter truncate w-full text-center leading-none">
                    {getShiftDisplayName(shift)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* DÍA DE PAGO */}
          <div className="flex flex-col items-center">
            <div className="w-[90%]">
              <label htmlFor="overtimeStartDay" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1 block">
                Día Inicio del Período de Pago
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="overtimeStartDay"
                  value={overtimeStartDayInput}
                  onChange={(e) => setOvertimeStartDayInput(parseInt(e.target.value, 10))}
                  min="1"
                  max="28"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 dark:focus:ring-blue-900/20 outline-none font-black text-sm text-slate-700 dark:text-slate-200 text-center shadow-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-[10px] font-black">DÍA</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-auto w-[90%] p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-2xl animate-in fade-in slide-in-from-top-2">
               <p className="text-rose-600 dark:text-rose-400 text-[10px] font-bold text-center leading-tight">
                  ⚠️ {error}
               </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 mt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={onClose}
              className="p-3.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 font-black text-xs transition-colors"
            >
              {t('buttons.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-black text-xs shadow-xl shadow-blue-100 dark:shadow-blue-900/20 transition-all active:scale-95"
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
