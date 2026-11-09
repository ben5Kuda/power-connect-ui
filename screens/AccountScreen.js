import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { put } from '../api';
import { styles } from '../styles';

// My account: who I am, and change my password
export default function AccountScreen({ t, user }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function changePassword() {
    setError('');
    setMessage('');
    try {
      await put('/auth/password', { oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setMessage(t('passwordChanged'));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <View>
      <Text style={styles.title}>{t('account')}</Text>

      <View style={styles.card}>
        <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{user.fullName}</Text>
        <Text>{user.userCode} · {t('role.' + user.role)}</Text>
        <Text style={styles.muted}>{user.email}</Text>
        {user.phone ? <Text style={styles.muted}>{user.phone}</Text> : null}
        {user.area ? <Text style={styles.muted}>{user.area}</Text> : null}
        {user.serviceType ? <Text style={styles.muted}>{t('service.' + user.serviceType)}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>{t('changePassword')}</Text>
        <TextInput style={styles.input} placeholder={t('oldPassword')} value={oldPassword}
                   onChangeText={setOldPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder={t('newPassword')} value={newPassword}
                   onChangeText={setNewPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={{ color: 'green', marginBottom: 8 }}>{message}</Text> : null}
        <Pressable style={styles.button} onPress={changePassword}>
          <Text style={styles.buttonText}>{t('save')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
