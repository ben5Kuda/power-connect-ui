import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { get, put, formatTime } from '../api';
import { styles, colors } from '../styles';

// Alerts for every role:
//   community member -> updates on their incidents
//   technician       -> new jobs
//   admin            -> new and reopened incidents
export default function AlertsScreen({ t, go, onRead }) {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    get('/notifications').then(setAlerts).catch((e) => setError(e.message));
  }, []);

  // Tapping an alert marks it as read and opens its incident
  async function open(alert) {
    if (!alert.read) {
      await put('/notifications/' + alert.notificationId + '/read');
      onRead();
    }
    go('detail', { incidentId: alert.incidentId });
  }

  return (
    <View>
      <Text style={styles.title}>{t('alerts')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {alerts.length === 0 && <Text style={styles.muted}>{t('noAlerts')}</Text>}

      {alerts.map((alert) => (
        <Pressable key={alert.notificationId} onPress={() => open(alert)}
                   style={[styles.card, !alert.read && { borderLeftWidth: 5, borderLeftColor: colors.accent }]}>
          {/* The status decides the text, so it shows in the user's language */}
          <Text style={{ fontWeight: alert.read ? 'normal' : 'bold' }}>
            {t('alert.' + alert.status)} (#{alert.incidentId})
          </Text>
          <Text style={styles.muted}>{formatTime(alert.createdAt)}</Text>
        </Pressable>
      ))}
    </View>
  );
}
