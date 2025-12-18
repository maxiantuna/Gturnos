
import React, { useState, useEffect } from 'react';
import { DailyOvertime, PredefinedShift, ShiftOverrideSetting, REVERT_TO_PATTERN_SHIFT, DisplayShift } from '../types';
import { ALL_PREDEFINED_SHIFTS_VALUES } from '../constants';
import { useLanguage } from '../hooks/useLanguage';

interface OvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: Date, overtime: DailyOvertime, shiftSetting: ShiftOverrideSetting | undefined) => void;
  selectedDate: Date | null;
  currentOvertime?: DailyOvertime;
  currentDayShift: DisplayShift; 
  isShiftOverridden: boolean;
  originalShiftFromPattern: DisplayShift;
}

const OvertimeModal: React.FC<OvertimeModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    selectedDate, 
    currentOvertime,
    currentDayShift,
    isShiftOverridden,
    originalShiftFromPattern
}) => {
  const { t, formatDate, getShiftDisplayName } = useLanguage();
  const [normalHours, setNormalHours] = useState(0);
  const [nightHours, setNightHours] = useState(0);
  const [selectedShiftOverride, setSelectedShiftOverride] = useState<ShiftOverrideSetting | string>(REVERT_TO_PATTERN_SHIFT);


  useEffect(() => {
    if (isOpen && selectedDate) {
      setNormalHours(currentOvertime?.normalHours || 0);
      setNightHours(currentOvertime?.nightHours || 0);
      
      if (isShiftOverridden && Object.values(PredefinedShift).includes(currentDayShift as PredefinedShift)) {
        setSelectedShiftOverride(currentDayShift as PredefinedShift);
      } else {
        setSelectedShiftOverride(REVERT_TO_PATTERN_SHIFT); 
      }
    }
  }, [isOpen, selectedDate, currentOvertime, currentDayShift, isShiftOverridden]);

  if (!isOpen || !selectedDate) return null;

  const handleSave = () => {
    let shiftToSave: ShiftOverrideSetting | undefined = undefined;
    if (selectedShiftOverride !== REVERT_TO_PATTERN_SHIFT && Object.values(PredefinedShift).includes(selectedShiftOverride as PredefinedShift)) {
        shiftToSave = selectedShiftOverride as PredefinedShift;
    } else if (selectedShiftOverride === REVERT_TO_PATTERN_SHIFT && isShiftOverridden) {
        shiftToSave = REVERT_TO_PATTERN_SHIFT;
    } else if (selectedShiftOverride === REVERT_TO_PATTERN_SHIFT && !isShiftOverridden){
        shiftToSave = undefined; 
    }

    onSave(
        selectedDate, 
        { 
            normalHours: Number(normalHours) || 0, 
            nightHours: Number(nightHours) || 0 
        },
        shiftToSave
    );
    onClose();
  };
  
  const formattedDateStr = formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' });
  const translatedOriginalShiftPattern = getShiftDisplayName(originalShiftFromPattern);
  const followPatternOptionText = t('overtimeModal.followPatternOption', { originalShift: translatedOriginalShiftPattern });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom duration-300">
        
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('overtimeModal.title')}</h2>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{formattedDateStr}</p>
        </div>
        
        <div className="space-y-5">
          {/* SELECCIÓN DE TURNO */}
          <div>
            <label htmlFor="shiftOverride" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              {t('overtimeModal.assignedShiftLabel')}
            </label>
            <select
              id="shiftOverride"
              value={selectedShiftOverride}
              onChange={(e) => setSelectedShiftOverride(e.target.value as PredefinedShift | typeof REVERT_TO_PATTERN_SHIFT)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 appearance-none cursor-pointer"
            >
              <option value={REVERT_TO_PATTERN_SHIFT}>🔄 {followPatternOptionText}</option>
              {ALL_PREDEFINED_SHIFTS_VALUES.map(shift => (
                <option key={shift} value={shift}>{getShiftDisplayName(shift)}</option>
              ))}
            </select>
          </div>

          {/* HORAS EXTRAS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="normalHours" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Normales
              </label>
              <input
                type="number"
                id="normalHours"
                value={normalHours}
                onChange={(e) => setNormalHours(parseFloat(e.target.value))}
                min="0"
                step="0.5"
                className="w-full p-4 bg-sky-50 border border-sky-100 rounded-2xl focus:ring-4 focus:ring-sky-100 focus:border-sky-500 outline-none font-black text-sky-900 text-center"
              />
            </div>

            <div>
              <label htmlFor="nightHours" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Nocturnas
              </label>
              <input
                type="number"
                id="nightHours"
                value={nightHours}
                onChange={(e) => setNightHours(parseFloat(e.target.value))}
                min="0"
                step="0.5"
                className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-black text-indigo-900 text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 font-black text-sm transition-colors"
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-black text-sm shadow-xl shadow-emerald-100 transition-all active:scale-95"
            >
              {t('buttons.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvertimeModal;
