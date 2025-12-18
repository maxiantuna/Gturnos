
export const en = {
  "app": {
    "name": "Rotative Shift Manager",
    "loading": "Loading data...",
    "footerCopyright": "Rotative Shift Management © {year}"
  },
  "buttons": {
    "configureRotation": "Configure Rotation",
    "saveSettings": "Save Settings",
    "cancel": "Cancel",
    "saveChanges": "Save Changes",
    "previousMonth": "Previous month",
    "nextMonth": "Next month",
    "settings": "Settings"
  },
  "calendar": {
    "headerTitle": "{month} {year}",
    "overriddenShiftIndicator": "*",
    "overriddenShiftTooltip": "Shift manually modified",
    "overtimeIndicator": "OT+",
    "overtimeIndicatorTooltip": "Overtime: {normal}N, {night}Nch"
  },
  "shifts": {
    "Mañana": "Morning",
    "Tarde": "Afternoon",
    "Noche": "Night",
    "Libre": "Off",
    "SinAsignar": "Unassigned",
    "patternPlaceholder": "Ex: Morning, Afternoon, Night, Off",
    "patternInfo": "Enter shifts separated by comma. Valid values: {validShifts}.",
    "patternInvalidError": "Invalid pattern. Use values like: {validShifts}. Separated by commas.",
    "patternEmptyError": "Rotation pattern cannot be empty. Enter at least one shift."
  },
  "months": {
    "january": "January", "february": "February", "march": "March", "april": "April",
    "may": "May", "june": "June", "july": "July", "august": "August",
    "september": "September", "october": "October", "november": "November", "december": "December"
  },
  "weekdays": {
    "short": { "sun": "Sun", "mon": "Mon", "tue": "Tue", "wed": "Wed", "thu": "Thu", "fri": "Fri", "sat": "Sat" }
  },
  "shiftSetupModal": {
    "title": "Configure Shift Rotation",
    "rotationStartDateLabel": "Rotation Start Date",
    "rotationPatternLabel": "Rotation Pattern",
    "overtimePayPeriodStartDayLabel": "Overtime Pay Period Start Day (1-28)",
    "overtimePayPeriodStartDayHelpText": "Day when your pay period starts for overtime. Ex: 16 means 16th to 15th of next month (applied two months prior for summary).",
    "startDateError": "Please select a start date."
  },
  "overtimeModal": {
    "title": "Day Details",
    "assignedShiftLabel": "Assigned Shift",
    "followPatternOption": "Follow Pattern (Pattern: {originalShift})",
    "followPatternInfo": "Select \"Follow Pattern\" to revert to the calculated shift ({originalShift}).",
    "normalOvertimeLabel": "Normal Overtime Hours",
    "nightOvertimeLabel": "Night Overtime Hours"
  },
  "monthlySummary": {
    "title": "Payment Period Summary",
    "paymentForLabel": "Corresponds to payment for: {month} {year}",
    "periodCoveredLabel": "Overtime calculated from {startDate} to {endDate}.",
    "normalOvertimeLabel": "Normal Overtime Hours:",
    "nightOvertimeLabel": "Night Overtime Hours:",
    "noOvertimeMessage": "No overtime hours recorded for this pay period."
  },
  "welcomeMessage": {
    "title": "Welcome!",
    "noSetupText": "It seems you haven't set up your shift rotation yet.",
    "cta": "Configure your rotation here to get started"
  },
  "language": {
    "label": "Language",
    "english": "🇬🇧 English",
    "spanish": "🇪🇸 Spanish"
  }
};

export const es = {
  "app": {
    "name": "Gestor de Turnos Rotativos",
    "loading": "Cargando datos...",
    "footerCopyright": "Gestión de Turnos Rotativos © {year}"
  },
  "buttons": {
    "configureRotation": "Configurar Rotación",
    "saveSettings": "Guardar Configuración",
    "cancel": "Cancelar",
    "saveChanges": "Guardar Cambios",
    "previousMonth": "Mes anterior",
    "nextMonth": "Mes siguiente",
    "settings": "Configuración"
  },
  "calendar": {
    "headerTitle": "{month} {year}",
    "overriddenShiftIndicator": "*",
    "overriddenShiftTooltip": "Turno modificado manualmente",
    "overtimeIndicator": "HE+",
    "overtimeIndicatorTooltip": "Extras: {normal}N, {night}Nch"
  },
  "shifts": {
    "Mañana": "Mañana",
    "Tarde": "Tarde",
    "Noche": "Noche",
    "Libre": "Libre",
    "SinAsignar": "Sin Asignar",
    "patternPlaceholder": "Ej: Mañana, Tarde, Noche, Libre",
    "patternInfo": "Ingrese los turnos separados por coma. Valores válidos: {validShifts}.",
    "patternInvalidError": "Patrón inválido. Use valores como: {validShifts}. Separados por comas.",
    "patternEmptyError": "El patrón de rotación no puede estar vacío. Ingrese al menos un turno."
  },
  "months": {
    "january": "Enero", "february": "Febrero", "march": "Marzo", "april": "Abril",
    "may": "Mayo", "june": "Junio", "july": "Julio", "august": "Agosto",
    "september": "Septiembre", "october": "Octubre", "november": "Noviembre", "december": "Diciembre"
  },
  "weekdays": {
    "short": { "sun": "Dom", "mon": "Lun", "tue": "Mar", "wed": "Mié", "thu": "Jue", "fri": "Vie", "sat": "Sáb" }
  },
  "shiftSetupModal": {
    "title": "Configurar Rotación de Turnos",
    "rotationStartDateLabel": "Fecha de Inicio de Rotación",
    "rotationPatternLabel": "Patrón de Rotación",
    "overtimePayPeriodStartDayLabel": "Día de Inicio del Periodo de Pago de Extras (1-28)",
    "overtimePayPeriodStartDayHelpText": "Día del mes (1-28) en que comienza su período de pago para horas extras. Ej: 16 significa del 16 al 15 del mes siguiente (aplicado dos meses antes para el resumen).",
    "startDateError": "Por favor, seleccione una fecha de inicio."
  },
  "overtimeModal": {
    "title": "Detalles del Día",
    "assignedShiftLabel": "Turno Asignado",
    "followPatternOption": "Seguir Patrón (Patrón: {originalShift})",
    "followPatternInfo": "Seleccionar \"Seguir Patrón\" para volver al turno calculado por el patrón ({originalShift}).",
    "normalOvertimeLabel": "Horas Extras Normales",
    "nightOvertimeLabel": "Horas Extras Nocturnas"
  },
  "monthlySummary": {
    "title": "Resumen del Periodo de Pago",
    "paymentForLabel": "Corresponde al pago de: {month} {year}",
    "periodCoveredLabel": "Horas extras calculadas del {startDate} al {endDate}.",
    "normalOvertimeLabel": "Horas Extras Normales:",
    "nightOvertimeLabel": "Horas Extras Nocturnas:",
    "noOvertimeMessage": "No hay horas extras registradas para este periodo de pago."
  },
  "welcomeMessage": {
    "title": "¡Bienvenido!",
    "noSetupText": "Parece que aún no has configurado tu rotación de turnos.",
    "cta": "Configura tu rotación aquí para empezar"
  },
  "language": {
    "label": "Idioma",
    "english": "🇬🇧 Inglés",
    "spanish": "🇪🇸 Español"
  }
};
