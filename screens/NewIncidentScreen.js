import { useState } from 'react';
import { Image, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { get, post, formatTime } from '../api';
import { pickPhoto } from '../photos';
import { LUSAKA_AREAS, SERVICE_TYPES, CATEGORIES } from '../lists';
import { styles, colors } from '../styles';
import { Chip, StatusLabel } from '../components';

// Community member: report a new problem (water, electricity or sanitation).
// Before sending, we check if the same problem is already reported in the same area
// (duplicate detection). If it is, the user can follow that incident instead.
export default function NewIncidentScreen({ t, go }) {
  const [serviceType, setServiceType] = useState('ELECTRICITY');
  const [category, setCategory] = useState('Power outage');
  const [area, setArea] = useState('Matero');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);           // base64 text, or null
  const [similar, setSimilar] = useState([]);         // open incidents that look the same
  const [error, setError] = useState('');

  // When the service changes, pick the first problem of that service
  function chooseService(service) {
    setServiceType(service);
    setCategory(CATEGORIES[service][0]);
  }

  async function choosePhoto(useCamera) {
    try {
      const image = await pickPhoto(useCamera);
      if (image) setPhoto(image);
    } catch (e) {
      setError(e.message);
    }
  }

  // Step 1: the user taps "Send". First look for the same problem in the same area.
  async function checkThenSend() {
    setError('');
    try {
      const found = await get('/incidents/similar?area=' + encodeURIComponent(area)
                              + '&category=' + encodeURIComponent(category));
      if (found.length > 0) {
        setSimilar(found);        // show the "Has someone already reported this?" question
      } else {
        await send();
      }
    } catch (e) {
      setError(e.message);
    }
  }

  // Step 2a: it's a new problem - create the incident, then upload the photo
  async function send() {
    try {
      const incident = await post('/incidents', { serviceType, category, area, address, description });
      if (photo) {
        await post('/incidents/' + incident.incidentId + '/photos', { image: photo });
      }
      go('incidents');
    } catch (e) {
      setError(e.message);
    }
  }

  // Step 2b: "Yes, this is my problem" - follow the existing incident instead
  async function follow(incident) {
    try {
      await post('/incidents/' + incident.incidentId + '/follow');
      go('detail', incident);
    } catch (e) {
      setError(e.message);
    }
  }

  // ---------- The "same problem?" question ----------
  if (similar.length > 0) {
    return (
      <View>
        <Text style={styles.title}>{t('sameProblemTitle')}</Text>
        <Text style={{ marginBottom: 12 }}>{t('sameProblemText')}</Text>
        {similar.map((incident) => (
          <View key={incident.incidentId} style={styles.card}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              #{incident.incidentId} · {t('category.' + incident.category)} · {incident.area}
            </Text>
            {incident.address ? <Text>{incident.address}</Text> : null}
            {incident.description ? <Text style={styles.muted}>{incident.description}</Text> : null}
            <Text style={styles.muted}>{formatTime(incident.createdAt)}</Text>
            <StatusLabel status={incident.status} t={t} />
            <Pressable style={styles.button} onPress={() => follow(incident)}>
              <Text style={styles.buttonText}>{t('sameProblemYes')}</Text>
            </Pressable>
          </View>
        ))}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={[styles.button, { backgroundColor: colors.muted }]} onPress={send}>
          <Text style={styles.buttonText}>{t('sameProblemNo')}</Text>
        </Pressable>
      </View>
    );
  }

  // ---------- The form ----------
  return (
    <View>
      <Text style={styles.title}>{t('newIncident')}</Text>

      <Text style={styles.label}>{t('service')}</Text>
      <View style={styles.chipRow}>
        {SERVICE_TYPES.map((s) => (
          <Chip key={s} label={t('service.' + s)} selected={serviceType === s} onPress={() => chooseService(s)} />
        ))}
      </View>

      <Text style={styles.label}>{t('category')}</Text>
      <View style={styles.chipRow}>
        {CATEGORIES[serviceType].map((c) => (
          <Chip key={c} label={t('category.' + c)} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      <Text style={styles.label}>{t('area')}</Text>
      <View style={styles.chipRow}>
        {LUSAKA_AREAS.map((a) => (
          <Chip key={a} label={a} selected={area === a} onPress={() => setArea(a)} />
        ))}
      </View>

      <Text style={styles.label}>{t('address')}</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />

      <Text style={styles.label}>{t('description')}</Text>
      <TextInput style={[styles.input, { height: 90 }]} value={description} onChangeText={setDescription} multiline />

      <Text style={styles.label}>{t('photoOptional')}</Text>
      {photo ? (
        <View>
          <Image source={{ uri: photo }} style={{ width: '100%', height: 200, borderRadius: 8 }} resizeMode="cover" />
          <Pressable onPress={() => setPhoto(null)}>
            <Text style={[styles.muted, { marginVertical: 6 }]}>✕ {t('removePhoto')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.chipRow}>
          <Pressable style={styles.chip} onPress={() => choosePhoto(false)}>
            <Text style={styles.chipText}>🖼️ {t('choosePhoto')}</Text>
          </Pressable>
          {Platform.OS !== 'web' && (
            <Pressable style={styles.chip} onPress={() => choosePhoto(true)}>
              <Text style={styles.chipText}>📷 {t('takePhoto')}</Text>
            </Pressable>
          )}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={checkThenSend}>
        <Text style={styles.buttonText}>{t('submit')}</Text>
      </Pressable>
      <Pressable onPress={() => go('incidents')}>
        <Text style={[styles.muted, { textAlign: 'center', marginTop: 8 }]}>{t('back')}</Text>
      </Pressable>
    </View>
  );
}
