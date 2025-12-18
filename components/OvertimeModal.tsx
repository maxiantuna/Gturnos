
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
  
  const formattedDateStr = formatDate(selectedDate, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const translatedOriginalShiftPattern = getShiftDisplayName(originalShiftFromPattern);
  const followPatternOptionText = t('overtimeModal.followPatternOption', { originalShift: translatedOriginalShiftPattern });
  const followPatternInfoText = t('overtimeModal.followPatternInfo', { originalShift: translatedOriginalShiftPattern });


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-1 text-slate-700">{t('overtimeModal.title')}</h2>
        <p className="text-sm text-slate-500 mb-4">{formattedDateStr}</p>
        
        <div className="mb-4">
          <label htmlFor="shiftOverride" className="block text-sm font-medium text-slate-600 mb-1">{t('overtimeModal.assignedShiftLabel')}</label>
          <select
            id="shiftOverride"
            value={selectedShiftOverride}
            onChange={(e) => setSelectedShiftOverride(e.target.value as PredefinedShift | typeof REVERT_TO_PATTERN_SHIFT)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-describedby="shift-override-help"
          >
            <option value={REVERT_TO_PATTERN_SHIFT}>{followPatternOptionText}</option>
            {ALL_PREDEFINED_SHIFTS_VALUES.map(shift => (
              <option key={shift} value={shift}>{getShiftDisplayName(shift)}</option>
            ))}
          </select>
           {isShiftOverridden && selectedShiftOverride === REVERT_TO_PATTERN_SHIFT && (
            <p id="shift-override-help" className="text-xs text-slate-500 mt-1">{followPatternInfoText}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="normalHours" className="block text-sm font-medium text-slate-600 mb-1">{t('overtimeModal.normalOvertimeLabel')}</label>
          <input
            type="number"
            id="normalHours"
            value={normalHours}
            onChange={(e) => setNormalHours(parseFloat(e.target.value))}
            min="0"
            step="0.5"
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="nightHours" className="block text-sm font-medium text-slate-600 mb-1">{t('overtimeModal.nightOvertimeLabel')}</label>
          <input
            type="number"
            id="nightHours"
            value={nightHours}
            onChange={(e) => setNightHours(parseFloat(e.target.value))}
            min="0"
            step="0.5"
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
          >
            {t('buttons.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            {t('buttons.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OvertimeModal;
