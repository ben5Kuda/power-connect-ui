import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { get, post, del, formatTime } from '../api';
import { pickPhoto } from '../photos';
import { styles, colors } from '../styles';

// Two extra parts of the incident screen, kept here so IncidentDetailScreen stays short.

// ---------- Photos of the problem (or of the finished work) ----------
export function PhotosSection({ t, incidentId, user }) {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');

  function load() {
    get('/incidents/' + incidentId + '/photos').then(setPhotos).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function add(useCamera) {
    setError('');
    try {
      const image = await pickPhoto(useCamera);
      if (!image) return;                                  // cancelled
      await post('/incidents/' + incidentId + '/photos', { image });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  // Only the person who added a photo, or an admin, can remove it
  async function remove(photo) {
    setError('');
    try {
      await del('/incidents/' + incidentId + '/photos/' + photo.photoId);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('photos')}</Text>
      <View style={styles.chipRow}>
        {photos.map((photo) => (
          <View key={photo.photoId} style={{ width: 260, maxWidth: '100%', marginRight: 10, marginBottom: 10 }}>
            {/* The base64 text from the database works directly as the image "uri" */}
            <Image source={{ uri: photo.image }} style={{ width: '100%', height: 190, borderRadius: 8 }} resizeMode="cover" />
            {(user.role === 'ADMIN' || user.userId === photo.uploadedBy) && (
              <Pressable onPress={() => remove(photo)}>
                <Text style={{ color: colors.danger, marginTop: 4 }}>✕ {t('removePhoto')}</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.chipRow}>
        <Pressable style={styles.chip} onPress={() => add(false)}>
          <Text style={styles.chipText}>🖼️ {t('choosePhoto')}</Text>
        </Pressable>
        {Platform.OS !== 'web' && (
          <Pressable style={styles.chip} onPress={() => add(true)}>
            <Text style={styles.chipText}>📷 {t('takePhoto')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ---------- Messages between the community member, technician, admin and councillor ----------
export function MessagesSection({ t, incidentId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  function load() {
    get('/incidents/' + incidentId + '/messages').then(setMessages).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function send() {
    if (text.trim() === '') return;
    try {
      await post('/incidents/' + incidentId + '/messages', { body: text });
      setText('');
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('messages')}</Text>
      {messages.length === 0 && <Text style={styles.muted}>{t('noMessages')}</Text>}

      {messages.map((m) => {
        const mine = m.senderName === user.fullName;
        return (
          <View key={m.messageId} style={{
            alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%', marginBottom: 8,
            backgroundColor: mine ? colors.primary : colors.background, borderRadius: 10, padding: 10,
          }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: mine ? '#FFFFFF' : colors.muted }}>
              {m.senderName} · {t('role.' + m.senderRole)} · {formatTime(m.createdAt)}
            </Text>
            <Text style={{ color: mine ? '#FFFFFF' : colors.text }}>{m.body}</Text>
          </View>
        );
      })}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput style={[styles.input, { marginTop: 6 }]} placeholder={t('writeMessage')}
                 value={text} onChangeText={setText} onSubmitEditing={send} />
      <Pressable style={styles.button} onPress={send}>
        <Text style={styles.buttonText}>{t('send')}</Text>
      </Pressable>
    </View>
  );
}
