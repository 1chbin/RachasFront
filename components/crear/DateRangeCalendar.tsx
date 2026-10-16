import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig, type DateData } from 'react-native-calendars';
import {
  diasInclusiveCalendario,
  formatearFechaCorta,
  fechasEnRango,
  validarRangoDesafio,
} from '@/lib/fechas';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

LocaleConfig.locales.es = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  monthNamesShort: [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ],
  dayNames: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

type DateRangeCalendarProps = {
  hoyMinimo: string;
  fechaInicio: string;
  fechaFin: string;
  onChange: (range: { fechaInicio: string; fechaFin: string }) => void;
};

const PERIOD_COLOR = lightColors.primary;
const PERIOD_TEXT = lightColors.primaryForeground;

function buildPeriodMarkedDates(inicio: string, fin: string) {
  if (!inicio) return {};

  if (!fin || fin < inicio) {
    return {
      [inicio]: {
        startingDay: true,
        endingDay: true,
        color: PERIOD_COLOR,
        textColor: PERIOD_TEXT,
      },
    };
  }

  const dias = fechasEnRango(inicio, fin);
  const marked: Record<
    string,
    {
      color: string;
      textColor: string;
      startingDay?: boolean;
      endingDay?: boolean;
    }
  > = {};

  dias.forEach((dia, index) => {
    marked[dia] = {
      color: PERIOD_COLOR,
      textColor: PERIOD_TEXT,
      startingDay: index === 0,
      endingDay: index === dias.length - 1,
    };
  });

  return marked;
}

export function DateRangeCalendar({
  hoyMinimo,
  fechaInicio,
  fechaFin,
  onChange,
}: DateRangeCalendarProps) {
  const markedDates = useMemo(
    () => buildPeriodMarkedDates(fechaInicio, fechaFin),
    [fechaInicio, fechaFin],
  );

  const validacion = validarRangoDesafio(fechaInicio, fechaFin, hoyMinimo);

  const pieTexto = useMemo(() => {
    if (!validacion.valido) {
      return validacion.mensaje ?? 'Elegí el rango de fechas';
    }
    const duracion = diasInclusiveCalendario(fechaInicio, fechaFin);
    return `Del ${formatearFechaCorta(fechaInicio)} al ${formatearFechaCorta(fechaFin)} · ${duracion} días`;
  }, [validacion, fechaInicio, fechaFin]);

  const onDayPress = (day: DateData) => {
    const seleccion = day.dateString;
    if (seleccion < hoyMinimo) return;

    const reinicia = !fechaInicio || Boolean(fechaInicio && fechaFin);
    if (reinicia) {
      onChange({ fechaInicio: seleccion, fechaFin: '' });
      return;
    }

    if (seleccion < fechaInicio) {
      onChange({ fechaInicio: seleccion, fechaFin: '' });
      return;
    }

    onChange({ fechaInicio, fechaFin: seleccion });
  };

  return (
    <View style={styles.wrap}>
      <Calendar
        minDate={hoyMinimo}
        markingType="period"
        markedDates={markedDates}
        onDayPress={onDayPress}
        enableSwipeMonths
        theme={{
          backgroundColor: lightColors.surface,
          calendarBackground: lightColors.surface,
          textSectionTitleColor: lightColors.muted,
          selectedDayBackgroundColor: lightColors.primary,
          selectedDayTextColor: lightColors.primaryForeground,
          todayTextColor: lightColors.primary,
          dayTextColor: lightColors.label,
          textDisabledColor: lightColors.separator,
          arrowColor: lightColors.primary,
          monthTextColor: lightColors.label,
          textDayFontFamily: 'Inter_400Regular',
          textMonthFontFamily: 'Inter_600SemiBold',
          textDayHeaderFontFamily: 'Inter_600SemiBold',
        }}
        style={styles.calendar}
      />
      <Text
        style={[styles.hint, !validacion.valido && styles.hintError]}
        accessibilityLiveRegion="polite">
        {pieTexto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.sm,
  },
  calendar: {
    marginHorizontal: -spacing.xs,
  },
  hint: {
    ...typography.footnote,
    fontFamily: 'Inter_600SemiBold',
    color: lightColors.labelSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  hintError: {
    color: lightColors.danger,
  },
});
