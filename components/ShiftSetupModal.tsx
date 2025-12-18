
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-2 z-[100] overflow-y-auto">
      <div className="bg-white p-3 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 mt-2">
        
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-black text-slate-800 tracking-tight">{t('shiftSetupModal.title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <span className="text-lg">✕</span>
          </button>
        </div>
        
        <div className="space-y-2.5">
          {/* FECHA DE INICIO */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="startDate" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                {t('shiftSetupModal.rotationStartDateLabel')}
              </label>
              <input
                type="date"
                id="startDate"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 transition-all outline-none font-bold text-xs text-slate-700"
              />
            </div>
            <div>
              <label htmlFor="overtimeStartDay" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                Inicio Pago (1-28)
              </label>
              <input
                type="number"
                id="overtimeStartDay"
                value={overtimeStartDayInput}
                onChange={(e) => setOvertimeStartDayInput(parseInt(e.target.value, 10))}
                min="1"
                max="28"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none font-black text-xs text-slate-700"
              />
            </div>
          </div>

          {/* PATRÓN DE ROTACIÓN */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {t('shiftSetupModal.rotationPatternLabel')}
              </label>
              {patternArray.length > 0 && (
                <button onClick={handleClearPattern} className="text-[9px] text-rose-500 font-bold px-1">
                  Borrar todo
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2 p-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl min-h-[40px] items-start content-start">
              {patternArray.length === 0 ? (
                <div className="w-full flex items-center justify-center py-1">
                  <span className="text-slate-400 text-[9px] font-medium italic">
                    Sin turnos añadidos
                  </span>
                </div>
              ) : (
                patternArray.map((shift, index) => (
                  <button
                    key={`${shift}-${index}`}
                    onClick={() => handleRemoveShift(index)}
                    className={`pl-1.5 pr-1 py-0.5 rounded-md text-[9px] font-black border-b flex items-center gap-1 hover:bg-opacity-80 transition-all ${SHIFT_COLORS[shift]}`}
                  >
                    {getShiftIcon(shift)} {getShiftDisplayName(shift)}
                    <span className="bg-black/5 w-3 h-3 flex items-center justify-center rounded-full text-[7px]">✕</span>
                  </button>
                ))
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {ALL_PREDEFINED_SHIFTS_VALUES.map((shift) => (
                <button
                  key={shift}
                  onClick={() => handleAddShift(shift)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border-b-2 font-black transition-all active:scale-95 ${SHIFT_COLORS[shift]}`}
                >
                  <span className="text-sm">{getShiftIcon(shift)}</span>
                  <span className="text-[7px] uppercase tracking-tighter truncate w-full text-center">{getShiftDisplayName(shift)}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-1.5 bg-rose-50 border border-rose-100 rounded-lg">
               <p className="text-rose-600 text-[8px] font-bold text-center">
                  ⚠️ {error}
               </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onClose}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-black text-xs transition-colors"
            >
              {t('buttons.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black text-xs shadow-md shadow-blue-100 transition-all active:scale-95"
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
