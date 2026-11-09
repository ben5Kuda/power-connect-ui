import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { get } from '../api';
import { styles, colors } from '../styles';

// Rough positions of the Lusaka areas on our drawing, as percentages (0 = left/top, 100 = right/bottom).
// NOT a real map - just enough to see where the problems are.
const POSITIONS = {
  Matero: { x: 18, y: 22 },
  Garden: { x: 40, y: 15 },
  Northmead: { x: 52, y: 32 },
  Chelston: { x: 84, y: 20 },
  Kanyama: { x: 14, y: 55 },
  Kalingalinga: { x: 66, y: 48 },
  Mtendere: { x: 88, y: 46 },
  Kabulonga: { x: 78, y: 62 },
  Woodlands: { x: 62, y: 70 },
  Kabwata: { x: 46, y: 64 },
  Chawama: { x: 28, y: 80 },
  Chilenje: { x: 54, y: 86 },
};

// A drawing of Lusaka with a circle for each area. Bigger and redder = more open incidents.
// "counts" looks like { Matero: 3, Kabulonga: 1 }
export function AreaMap({ t, counts, highlight }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('mapTitle')}</Text>
      <View style={local.map}>
        <Text style={local.cityCentre}>✦ CBD</Text>
        {Object.keys(POSITIONS).map((area) => {
          const count = counts[area] || 0;
          const size = Math.min(26 + count * 10, 70);
          let color = '#B0BEC5';                 // grey: nothing open
          if (count >= 1) color = colors.accent; // yellow: some
          if (count >= 3) color = colors.danger; // red: many
          return (
            <View key={area} style={[local.spot, { left: POSITIONS[area].x + '%', top: POSITIONS[area].y + '%' }]}>
              <View style={[local.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
                            area === highlight && local.highlight]}>
                <Text style={local.count}>{count}</Text>
              </View>
              <Text style={local.areaName}>{area}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.muted, { fontStyle: 'italic', marginTop: 6 }]}>{t('mapNote')}</Text>
    </View>
  );
}

// COUNCILLOR: the map screen (their own ward is outlined)
export default function MapScreen({ t, user }) {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    get('/map').then(setCounts).catch((e) => setError(e.message));
  }, []);

  return (
    <View>
      <Text style={styles.title}>{t('map')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {counts && <AreaMap t={t} counts={counts} highlight={user.area} />}
    </View>
  );
}

const local = StyleSheet.create({
  map: { height: 340, backgroundColor: '#E8F0EC', borderRadius: 10, overflow: 'hidden' },
  cityCentre: { position: 'absolute', left: '42%', top: '44%', color: colors.muted, fontWeight: 'bold' },
  spot: { position: 'absolute', alignItems: 'center', width: 90, marginLeft: -45, marginTop: -20 },
  circle: { alignItems: 'center', justifyContent: 'center', opacity: 0.9 },
  highlight: { borderWidth: 3, borderColor: colors.primary },
  count: { color: '#FFFFFF', fontWeight: 'bold' },
  areaName: { fontSize: 11, color: colors.text, marginTop: 2 },
});
