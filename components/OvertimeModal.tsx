
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
  
  const formattedDateStr = formatDate(selectedDate, { weekday: 'short', day: 'numeric', month: 'short' });
  const translatedOriginalShiftPattern = getShiftDisplayName(originalShiftFromPattern);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-2 z-[100] overflow-y-auto">
      <div className="bg-white p-3 rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 mt-2">
        
        <div className="mb-2 flex justify-between items-start">
          <div>
            <h2 className="text-base font-black text-slate-800 tracking-tight leading-none">{t('overtimeModal.title')}</h2>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">{formattedDateStr}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <span className="text-lg">✕</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {/* SELECCIÓN DE TURNO */}
          <div>
            <label htmlFor="shiftOverride" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              {t('overtimeModal.assignedShiftLabel')}
            </label>
            <select
              id="shiftOverride"
              value={selectedShiftOverride}
              onChange={(e) => setSelectedShiftOverride(e.target.value as PredefinedShift | typeof REVERT_TO_PATTERN_SHIFT)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 transition-all outline-none font-bold text-xs text-slate-700 appearance-none cursor-pointer"
            >
              <option value={REVERT_TO_PATTERN_SHIFT}>🔄 {translatedOriginalShiftPattern}</option>
              {ALL_PREDEFINED_SHIFTS_VALUES.map(shift => (
                <option key={shift} value={shift}>{getShiftDisplayName(shift)}</option>
              ))}
            </select>
          </div>

          {/* HORAS EXTRAS */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="normalHours" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                Normales
              </label>
              <input
                type="number"
                id="normalHours"
                value={normalHours}
                onChange={(e) => setNormalHours(parseFloat(e.target.value))}
                min="0"
                step="0.5"
                className="w-full p-2 bg-sky-50 border border-sky-100 rounded-lg outline-none font-black text-sky-900 text-center text-xs"
              />
            </div>

            <div>
              <label htmlFor="nightHours" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                Nocturnas
              </label>
              <input
                type="number"
                id="nightHours"
                value={nightHours}
                onChange={(e) => setNightHours(parseFloat(e.target.value))}
                min="0"
                step="0.5"
                className="w-full p-2 bg-indigo-50 border border-indigo-100 rounded-lg outline-none font-black text-indigo-900 text-center text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-xs transition-colors"
            >
              {t('buttons.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="p-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-50 transition-all active:scale-95"
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
