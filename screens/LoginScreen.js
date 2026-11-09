import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { post } from '../api';
import { styles, colors } from '../styles';

// First screen: pick a language, then log in with email and password
export default function LoginScreen({ t, languageButtons, go, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function login() {
    setError('');
    try {
      const reply = await post('/auth/login', { email: email.trim(), password: password });
      onLogin(reply.token, reply.user);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.primary }} contentContainerStyle={local.page}>
      <Text style={local.appName}>PowerConnect</Text>
      <Text style={local.tagline}>{t('tagline')}</Text>

      <View style={local.box}>
        <Text style={styles.label}>{t('chooseLanguage')}</Text>
        {languageButtons}

        <Text style={styles.label}>{t('email')}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail}
                   autoCapitalize="none" keyboardType="email-address" />

        <Text style={styles.label}>{t('password')}</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>{t('login')}</Text>
        </Pressable>

        <Pressable onPress={() => go('register')}>
          <Text style={local.link}>{t('noAccount')}</Text>
        </Pressable>
      </View>

      {/* Help is available before logging in too */}
      <Pressable style={local.helpButton} onPress={() => go('help')}>
        <Text style={local.helpText}>{t('helpChat')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const local = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  appName: { color: colors.accent, fontSize: 34, fontWeight: 'bold', textAlign: 'center' },
  tagline: { color: '#FFFFFF', textAlign: 'center', marginTop: 6, marginBottom: 24 },
  box: { backgroundColor: colors.background, borderRadius: 12, padding: 16, width: '100%', maxWidth: 420, alignSelf: 'center' },
  link: { color: colors.primary, textAlign: 'center', marginTop: 10, fontWeight: 'bold' },
  helpButton: { alignSelf: 'center', marginTop: 20, backgroundColor: colors.accent, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 },
  helpText: { color: colors.text, fontWeight: 'bold' },
});
