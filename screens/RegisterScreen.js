import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { post } from '../api';
import { LUSAKA_AREAS } from '../lists';
import { styles, colors } from '../styles';
import { Chip } from '../components';

// Community members create their own account here (admins and technicians are added by the organisation)
export default function RegisterScreen({ t, language, languageButtons, go, onLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('Matero');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function register() {
    setError('');
    try {
      const reply = await post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        area: area,
        password: password,
        language: language,
      });
      onLogin(reply.token, reply.user);   // logged in straight away
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.primary }} contentContainerStyle={local.page}>
      <Text style={local.appName}>PowerConnect</Text>

      <View style={local.box}>
        <Text style={styles.title}>{t('createAccount')}</Text>
        {languageButtons}

        <Text style={styles.label}>{t('fullName')}</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>{t('email')}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail}
                   autoCapitalize="none" keyboardType="email-address" />

        <Text style={styles.label}>{t('phone')}</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={styles.label}>{t('area')}</Text>
        <View style={styles.chipRow}>
          {LUSAKA_AREAS.map((a) => (
            <Chip key={a} label={a} selected={area === a} onPress={() => setArea(a)} />
          ))}
        </View>

        <Text style={styles.label}>{t('password')}</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={register}>
          <Text style={styles.buttonText}>{t('createAccount')}</Text>
        </Pressable>

        <Pressable onPress={() => go('login')}>
          <Text style={local.link}>{t('haveAccount')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const local = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 48 },
  appName: { color: colors.accent, fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  box: { backgroundColor: colors.background, borderRadius: 12, padding: 16, width: '100%', maxWidth: 420, alignSelf: 'center' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 10, fontWeight: 'bold' },
});
