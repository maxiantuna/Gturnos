
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 z-[100] overflow-y-auto">
      <div className="bg-white p-4 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200 mt-[20px] border border-slate-100">
        
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-black text-slate-800 tracking-tight">{t('shiftSetupModal.title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {/* FECHA DE INICIO (ARRIBA) */}
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
              {t('shiftSetupModal.rotationStartDateLabel')}
            </label>
            <input
              type="date"
              id="startDate"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-bold text-xs text-slate-700"
            />
          </div>

          {/* PATRÓN DE ROTACIÓN (CENTRO) */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1 ml-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Secuencia de Turnos
              </label>
              {patternArray.length > 0 && (
                <button onClick={handleClearPattern} className="text-[9px] text-rose-500 font-bold hover:underline transition-all">
                  Limpiar todo
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl min-h-[44px] max-h-[90px] overflow-y-auto items-start content-start transition-all">
              {patternArray.length === 0 ? (
                <div className="w-full flex items-center justify-center py-2">
                  <span className="text-slate-400 text-[9px] font-medium italic text-center px-4">
                    Toca los turnos de abajo para armar tu ciclo
                  </span>
                </div>
              ) : (
                patternArray.map((shift, index) => (
                  <button
                    key={`${shift}-${index}`}
                    onClick={() => handleRemoveShift(index)}
                    className={`pl-2 pr-1.5 py-1 rounded-lg text-[9px] font-black border-b flex items-center gap-1.5 hover:brightness-95 active:scale-95 transition-all shadow-sm ${SHIFT_COLORS[shift]}`}
                  >
                    <span>{getShiftIcon(shift)}</span>
                    <span>{getShiftDisplayName(shift)}</span>
                    <span className="bg-black/5 w-4 h-4 flex items-center justify-center rounded-full text-[8px] ml-0.5">✕</span>
                  </button>
                ))
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {ALL_PREDEFINED_SHIFTS_VALUES.map((shift) => (
                <button
                  key={shift}
                  onClick={() => handleAddShift(shift)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border-b-2 font-black transition-all active:scale-95 shadow-sm hover:brightness-95 ${SHIFT_COLORS[shift]}`}
                >
                  <span className="text-base mb-0.5">{getShiftIcon(shift)}</span>
                  <span className="text-[8px] uppercase tracking-tighter truncate w-full text-center leading-none">
                    {getShiftDisplayName(shift)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* DÍA DE PAGO (ABAJO) */}
          <div className="flex flex-col">
            <label htmlFor="overtimeStartDay" className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-black text-xs text-slate-700 text-center"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] font-bold">DÍA</span>
            </div>
          </div>

          {error && (
            <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl animate-in fade-in slide-in-from-top-1">
               <p className="text-rose-600 text-[9px] font-bold text-center leading-tight">
                  ⚠️ {error}
               </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-3 mt-1 border-t border-slate-100">
            <button
              onClick={onClose}
              className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-black text-xs transition-colors"
            >
              {t('buttons.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black text-xs shadow-lg shadow-blue-100 transition-all active:scale-95"
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
