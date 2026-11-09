import { useEffect, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { get } from '../api';
import { LUSAKA_AREAS } from '../lists';
import { styles, colors } from '../styles';
import { Chip } from '../components';

// Who to contact: the service hotlines, and the ward councillor for an area
export default function ContactsScreen({ t, user }) {
  const [contacts, setContacts] = useState([]);
  const [area, setArea] = useState(user.area || 'Matero');   // start with the user's own area
  const [error, setError] = useState('');

  useEffect(() => {
    get('/contacts').then(setContacts).catch((e) => setError(e.message));
  }, []);

  // Hotlines have no area; councillors belong to one area
  const hotlines = contacts.filter((c) => c.area === null);
  const councillors = contacts.filter((c) => c.area === area);

  return (
    <View>
      <Text style={styles.title}>{t('contacts')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>{t('hotlines')}</Text>
      {hotlines.map((c) => <ContactCard key={c.contactId} contact={c} t={t} />)}

      <Text style={styles.label}>{t('councillorFor')} {area}</Text>
      <View style={styles.chipRow}>
        {LUSAKA_AREAS.map((a) => (
          <Chip key={a} label={a} selected={area === a} onPress={() => setArea(a)} />
        ))}
      </View>
      {councillors.map((c) => <ContactCard key={c.contactId} contact={c} t={t} />)}

      <Text style={[styles.muted, { marginTop: 8, fontStyle: 'italic' }]}>{t('sampleContacts')}</Text>
    </View>
  );
}

// One contact. Tapping the phone number opens the phone's dialler.
function ContactCard({ contact, t }) {
  return (
    <View style={styles.card}>
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{contact.name}</Text>
      <Text style={styles.muted}>
        {contact.serviceType ? t('service.' + contact.serviceType) + ' · ' : ''}{contact.title}
      </Text>
      <Pressable onPress={() => Linking.openURL('tel:' + contact.phone.replace(/ /g, ''))}>
        <Text style={{ color: colors.primary, fontWeight: 'bold', marginTop: 6 }}>📞 {contact.phone}</Text>
      </Pressable>
      {contact.email ? <Text style={{ marginTop: 2 }}>✉️ {contact.email}</Text> : null}
    </View>
  );
}
