import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { get } from '../api';
import { styles, colors, statusColors } from '../styles';
import { AreaMap } from './MapScreen';

// ADMIN: smart alerts, totals, the area map, and bars showing how many incidents per status, service and area
export default function ReportsScreen({ t }) {
  const [report, setReport] = useState(null);
  const [mapCounts, setMapCounts] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    get('/reports').then(setReport).catch((e) => setError(e.message));
    get('/map').then(setMapCounts).catch((e) => setError(e.message));
  }, []);

  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!report) return null;   // still loading

  return (
    <View>
      <Text style={styles.title}>{t('reports')}</Text>

      {/* Smart alerts: many open incidents of one service in one area = probably one cause */}
      <View style={[styles.card, report.hotspots.length > 0 && local.alertCard]}>
        <Text style={styles.label}>{t('smartAlerts')}</Text>
        {report.hotspots.length === 0 && <Text style={styles.muted}>{t('noSmartAlerts')}</Text>}
        {report.hotspots.map((h) => (
          <View key={h.area + h.serviceType} style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>
              {h.area}: {h.count} {t('service.' + h.serviceType)} {t('smartAlertCount')}
            </Text>
            <Text>{t('likelyCause.' + h.serviceType)}</Text>
          </View>
        ))}
      </View>

      <View style={local.numbers}>
        <View style={[styles.card, local.numberCard]}>
          <Text style={local.bigNumber}>{report.total}</Text>
          <Text style={styles.muted}>{t('total')}</Text>
        </View>
        <View style={[styles.card, local.numberCard]}>
          <Text style={local.bigNumber}>{report.averageHoursToComplete}</Text>
          <Text style={styles.muted}>{t('averageHours')}</Text>
        </View>
        <View style={[styles.card, local.numberCard]}>
          <Text style={local.bigNumber}>{report.averageRating} ★</Text>
          <Text style={styles.muted}>{t('averageRating')} ({report.ratedCount})</Text>
        </View>
      </View>

      <AreaMap t={t} counts={mapCounts} />

      <Bars title={t('byStatus')} counts={report.byStatus} label={(key) => t('status.' + key)}
            color={(key) => statusColors[key]} />
      <Bars title={t('byService')} counts={report.byServiceType} label={(key) => t('service.' + key)}
            color={() => colors.primary} />
      <Bars title={t('byArea')} counts={report.byArea} label={(key) => key}
            color={() => colors.accent} />
    </View>
  );
}

// One card of bars. "counts" looks like { WATER: 4, ELECTRICITY: 2 }
function Bars({ title, counts, label, color }) {
  const keys = Object.keys(counts);
  const biggest = Math.max(...Object.values(counts), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{title}</Text>
      {keys.map((key) => (
        <View key={key} style={local.barRow}>
          <Text style={local.barLabel}>{label(key)}</Text>
          <View style={local.barTrack}>
            <View style={[local.bar, { width: (counts[key] / biggest) * 100 + '%', backgroundColor: color(key) }]} />
          </View>
          <Text style={local.barCount}>{counts[key]}</Text>
        </View>
      ))}
    </View>
  );
}

const local = StyleSheet.create({
  alertCard: { borderColor: colors.danger, borderWidth: 2, backgroundColor: '#FDECEA' },
  numbers: { flexDirection: 'row', gap: 10 },
  numberCard: { flex: 1, alignItems: 'center' },
  bigNumber: { fontSize: 32, fontWeight: 'bold', color: colors.primary },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 130, color: colors.text },
  barTrack: { flex: 1, height: 14, backgroundColor: colors.background, borderRadius: 7, overflow: 'hidden' },
  bar: { height: 14, borderRadius: 7 },
  barCount: { width: 30, textAlign: 'right', fontWeight: 'bold' },
});
