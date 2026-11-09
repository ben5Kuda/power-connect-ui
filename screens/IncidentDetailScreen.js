import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { get, put, formatTime } from '../api';
import { styles } from '../styles';
import { Chip, StatusLabel } from '../components';
import { MessagesSection, PhotosSection } from './IncidentExtras';

// One incident: its details and timeline, plus what the user's role can do:
//   Admin      -> assign (or re-assign) a technician, close the incident when the work is finished
//   Technician -> update the status of the job
//   Community  -> confirm the work is done, which closes the incident
//   Councillor -> can only look (and write messages)
// Everyone can see and add photos and messages.
export default function IncidentDetailScreen({ t, go, user, incident: startIncident }) {
  const [incident, setIncident] = useState(startIncident);
  const [timeline, setTimeline] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);               // 0 = no stars picked yet
  const [error, setError] = useState('');

  const id = incident.incidentId;
  const status = incident.status;

  function loadTimeline() {
    get('/incidents/' + id + '/updates').then(setTimeline).catch((e) => setError(e.message));
  }

  useEffect(() => {
    // Load the latest version: someone else may have changed it since the list was loaded
    get('/incidents/' + id).then(setIncident).catch((e) => setError(e.message));
    loadTimeline();
    if (user.role === 'ADMIN') {
      get('/technicians').then(setTechnicians).catch((e) => setError(e.message));
    }
  }, []);

  // Send a change to the API, then show the updated incident and timeline
  async function change(path, body) {
    setError('');
    try {
      setIncident(await put('/incidents/' + id + path, body));
      setNote('');
      loadTimeline();
    } catch (e) {
      setError(e.message);
    }
  }

  // Only show technicians who work on this kind of service
  const matchingTechnicians = technicians.filter((tech) => tech.serviceType === incident.serviceType);

  const canAssign = user.role === 'ADMIN' && ['REPORTED', 'ASSIGNED', 'NOT_COMPLETED', 'REOPENED'].includes(status);
  const canUpdate = user.role === 'TECHNICIAN' && ['ASSIGNED', 'DISPATCHED', 'IN_PROGRESS'].includes(status);
  // Only the person who reported it can rate and close it (not people who follow it)
  const canConfirm = user.userId === incident.reportedBy && status === 'COMPLETED';
  const canAdminClose = user.role === 'ADMIN' && (status === 'COMPLETED' || status === 'NOT_COMPLETED');

  // Opened from an alert we only know the number at first: wait until the incident has loaded
  if (!incident.status) {
    return error ? <Text style={styles.error}>{error}</Text> : null;
  }

  return (
    <View>
      <Pressable onPress={() => go('incidents')}>
        <Text style={[styles.muted, { marginBottom: 8 }]}>← {t('back')}</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.title}>#{id} · {t('category.' + incident.category)}</Text>
        <Text style={{ fontWeight: 'bold' }}>{t('service.' + incident.serviceType)}</Text>
        <Text>{incident.area}{incident.address ? ' · ' + incident.address : ''}</Text>
        {incident.description ? <Text style={{ marginTop: 6 }}>{incident.description}</Text> : null}
        <StatusLabel status={status} t={t} />
        {incident.completedAt && (
          <Text style={[styles.muted, { marginTop: 6 }]}>{t('completedOn')}: {formatTime(incident.completedAt)}</Text>
        )}
        {incident.closedAt && (
          <Text style={styles.muted}>{t('closedOn')}: {formatTime(incident.closedAt)}</Text>
        )}
        {incident.rating && (
          <Text style={{ marginTop: 6 }}>{t('yourRating')}: {'★'.repeat(incident.rating)}{'☆'.repeat(5 - incident.rating)}</Text>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* ADMIN: pick a technician for this service */}
      {canAssign && (
        <View style={styles.card}>
          <Text style={styles.label}>{t('assignTo')}</Text>
          {matchingTechnicians.length === 0 && <Text style={styles.muted}>{t('noTechnicians')}</Text>}
          <View style={styles.chipRow}>
            {matchingTechnicians.map((tech) => (
              <Chip key={tech.userId}
                    label={tech.fullName + ' (' + tech.area + ')'}
                    selected={incident.technicianId === tech.userId && status === 'ASSIGNED'}
                    onPress={() => change('/assign', { technicianId: tech.userId })} />
            ))}
          </View>
        </View>
      )}

      {/* TECHNICIAN: move the job along */}
      {canUpdate && (
        <View style={styles.card}>
          <Text style={styles.label}>{t('updateStatus')}</Text>
          <TextInput style={styles.input} placeholder={t('note')} value={note} onChangeText={setNote} />
          <View style={styles.chipRow}>
            {['DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'NOT_COMPLETED'].map((s) => (
              <Chip key={s} label={t('status.' + s)} selected={status === s}
                    onPress={() => change('/status', { status: s, note: note })} />
            ))}
          </View>
        </View>
      )}

      {/* COMMUNITY: is it really fixed? Rate it and close it, or say it is still broken */}
      {canConfirm && (
        <View style={styles.card}>
          <Text style={styles.label}>{t('rateWork')}</Text>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)}>
                <Text style={{ fontSize: 34, color: '#F2A900' }}>{star <= rating ? '★' : '☆'}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.button}
                     onPress={() => change('/close', { note: note, rating: rating > 0 ? rating : null })}>
            <Text style={styles.buttonText}>{t('confirmFixed')}</Text>
          </Pressable>

          <Text style={[styles.muted, { marginTop: 12 }]}>{t('notFixed')}</Text>
          <TextInput style={[styles.input, { marginTop: 8 }]} placeholder={t('whatIsWrong')}
                     value={note} onChangeText={setNote} />
          <Pressable style={[styles.button, { backgroundColor: '#B3261E' }]}
                     onPress={() => change('/reopen', { note: note })}>
            <Text style={styles.buttonText}>{t('stillBroken')}</Text>
          </Pressable>
        </View>
      )}

      {/* ADMIN: close a finished incident */}
      {canAdminClose && (
        <View style={styles.card}>
          <TextInput style={styles.input} placeholder={t('note')} value={note} onChangeText={setNote} />
          <Pressable style={styles.button} onPress={() => change('/close', { note: note })}>
            <Text style={styles.buttonText}>{t('closeIncident')}</Text>
          </Pressable>
        </View>
      )}

      {/* Everyone: photos and messages */}
      <PhotosSection t={t} incidentId={id} user={user} />
      <MessagesSection t={t} incidentId={id} user={user} />

      {/* Everyone: the timeline, with the time of each step */}
      <Text style={styles.label}>{t('timeline')}</Text>
      {timeline.map((step) => (
        <View key={step.updateId} style={styles.card}>
          <Text style={{ fontWeight: 'bold' }}>{t('status.' + step.status)}</Text>
          <Text style={styles.muted}>{formatTime(step.createdAt)}</Text>
          {step.note ? <Text style={{ marginTop: 4 }}>{step.note}</Text> : null}
        </View>
      ))}
    </View>
  );
}
