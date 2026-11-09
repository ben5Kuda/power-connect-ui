import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { get, formatTime } from '../api';
import { styles } from '../styles';
import { StatusLabel } from '../components';

// The list of incidents. The API decides what each role sees:
//   admin = all incidents, technician = their jobs, councillor = their ward,
//   community member = incidents they reported or follow
export default function IncidentsScreen({ t, go, user }) {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');

  // Load the list once, when the screen opens
  useEffect(() => {
    get('/incidents')
      .then(setIncidents)
      .catch((e) => setError(e.message));
  }, []);

  let title = t('myIncidents');
  if (user.role === 'ADMIN') title = t('allIncidents');
  if (user.role === 'TECHNICIAN') title = t('myJobs');
  if (user.role === 'COUNCILLOR') title = t('wardIncidents') + ' - ' + user.area;

  return (
    <View>
      <Text style={styles.title}>{title}</Text>

      {/* Only community members can report a problem */}
      {user.role === 'COMMUNITY' && (
        <Pressable style={styles.button} onPress={() => go('new')}>
          <Text style={styles.buttonText}>+ {t('newIncident')}</Text>
        </Pressable>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {incidents.length === 0 && <Text style={styles.muted}>{t('noIncidents')}</Text>}

      {incidents.map((incident) => (
        <Pressable key={incident.incidentId} style={styles.card} onPress={() => go('detail', incident)}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
            #{incident.incidentId} · {t('service.' + incident.serviceType)} · {t('category.' + incident.category)}
          </Text>
          <Text style={styles.muted}>{incident.area} · {formatTime(incident.createdAt)}</Text>
          <StatusLabel status={incident.status} t={t} />
        </Pressable>
      ))}
    </View>
  );
}
