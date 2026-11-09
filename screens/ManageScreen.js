import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { get, post, put, del } from '../api';
import { LUSAKA_AREAS, SERVICE_TYPES } from '../lists';
import { styles, colors } from '../styles';
import { Chip } from '../components';

// ADMIN: manage users (add technicians/admins/councillors, reset passwords) and contacts
export default function ManageScreen({ t }) {
  const [part, setPart] = useState('users');   // which part is showing: 'users' or 'contacts'

  return (
    <View>
      <Text style={styles.title}>{t('manage')}</Text>
      <View style={styles.chipRow}>
        <Chip label={t('users')} selected={part === 'users'} onPress={() => setPart('users')} />
        <Chip label={t('contacts')} selected={part === 'contacts'} onPress={() => setPart('contacts')} />
      </View>
      {part === 'users' ? <Users t={t} /> : <Contacts t={t} />}
    </View>
  );
}

// ---------- Users ----------
function Users({ t }) {
  const [users, setUsers] = useState([]);
  const [resetFor, setResetFor] = useState(null);       // the user whose password we are resetting
  const [resetPassword, setResetPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // The "add a user" form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('TECHNICIAN');
  const [area, setArea] = useState('Matero');
  const [serviceType, setServiceType] = useState('ELECTRICITY');
  const [password, setPassword] = useState('');

  function load() {
    get('/users').then(setUsers).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function addUser() {
    setError('');
    setMessage('');
    try {
      const user = await post('/users', { fullName, email, phone, role, area, serviceType, password });
      setMessage(t('saved') + ': ' + user.userCode + ' ' + user.fullName);
      setFullName(''); setEmail(''); setPhone(''); setPassword('');
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function saveNewPassword() {
    setError('');
    try {
      await put('/users/' + resetFor.userId + '/password', { newPassword: resetPassword });
      setMessage(t('saved') + ': ' + resetFor.fullName);
      setResetFor(null);
      setResetPassword('');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <View>
      {message ? <Text style={{ color: 'green', marginVertical: 6 }}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.label}>{t('addUser')}</Text>
        <TextInput style={styles.input} placeholder={t('fullName')} value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder={t('email')} value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder={t('phone')} value={phone} onChangeText={setPhone} />
        <Text style={styles.label}>{t('role')}</Text>
        <View style={styles.chipRow}>
          {['TECHNICIAN', 'ADMIN', 'COUNCILLOR'].map((r) => (
            <Chip key={r} label={t('role.' + r)} selected={role === r} onPress={() => setRole(r)} />
          ))}
        </View>
        {role === 'TECHNICIAN' && (
          <View>
            <Text style={styles.label}>{t('service')}</Text>
            <View style={styles.chipRow}>
              {SERVICE_TYPES.map((s) => (
                <Chip key={s} label={t('service.' + s)} selected={serviceType === s} onPress={() => setServiceType(s)} />
              ))}
            </View>
          </View>
        )}
        {role !== 'ADMIN' && (
          <View>
            <Text style={styles.label}>{t('area')}</Text>
            <View style={styles.chipRow}>
              {LUSAKA_AREAS.map((a) => (
                <Chip key={a} label={a} selected={area === a} onPress={() => setArea(a)} />
              ))}
            </View>
          </View>
        )}
        <TextInput style={styles.input} placeholder={t('password')} value={password} onChangeText={setPassword} />
        <Pressable style={styles.button} onPress={addUser}>
          <Text style={styles.buttonText}>{t('addUser')}</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>{t('users')} ({users.length})</Text>
      {users.map((user) => (
        <View key={user.userId} style={styles.card}>
          <Text style={{ fontWeight: 'bold' }}>{user.fullName} · {user.userCode}</Text>
          <Text style={styles.muted}>
            {t('role.' + user.role)}
            {user.serviceType ? ' · ' + t('service.' + user.serviceType) : ''}
            {user.area ? ' · ' + user.area : ''}
          </Text>
          <Text style={styles.muted}>{user.email}</Text>

          {resetFor && resetFor.userId === user.userId ? (
            <View style={{ marginTop: 8 }}>
              <TextInput style={styles.input} placeholder={t('newPassword')} value={resetPassword} onChangeText={setResetPassword} />
              <View style={styles.chipRow}>
                <Chip label={t('save')} selected={true} onPress={saveNewPassword} />
                <Chip label={t('cancel')} selected={false} onPress={() => setResetFor(null)} />
              </View>
            </View>
          ) : (
            <Pressable onPress={() => { setResetFor(user); setResetPassword(''); }}>
              <Text style={{ color: colors.primary, marginTop: 6 }}>🔑 {t('resetPassword')}</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

// ---------- Contacts (hotlines and councillors) ----------
function Contacts({ t }) {
  const [contacts, setContacts] = useState([]);
  const [editing, setEditing] = useState(null);     // null = adding a new contact, otherwise the contact id
  const [error, setError] = useState('');

  // The form
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState(null);             // null = a hotline (no area)
  const [serviceType, setServiceType] = useState(null);

  function load() {
    get('/contacts').then(setContacts).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function clearForm() {
    setEditing(null);
    setName(''); setTitle(''); setPhone(''); setEmail(''); setArea(null); setServiceType(null);
  }

  function startEdit(contact) {
    setEditing(contact.contactId);
    setName(contact.name); setTitle(contact.title); setPhone(contact.phone);
    setEmail(contact.email || ''); setArea(contact.area); setServiceType(contact.serviceType);
  }

  async function save() {
    setError('');
    const contact = { name, title, phone, email, area, serviceType };
    try {
      if (editing) {
        await put('/contacts/' + editing, contact);
      } else {
        await post('/contacts', contact);
      }
      clearForm();
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(contact) {
    try {
      await del('/contacts/' + contact.contactId);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.label}>{editing ? t('edit') + ' #' + editing : t('addContact')}</Text>
        <TextInput style={styles.input} placeholder={t('name')} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder={t('titleField')} value={title} onChangeText={setTitle} />
        <TextInput style={styles.input} placeholder={t('phone')} value={phone} onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder={t('email')} value={email} onChangeText={setEmail} autoCapitalize="none" />
        <Text style={styles.label}>{t('service')}</Text>
        <View style={styles.chipRow}>
          <Chip label="-" selected={serviceType === null} onPress={() => setServiceType(null)} />
          {SERVICE_TYPES.map((s) => (
            <Chip key={s} label={t('service.' + s)} selected={serviceType === s} onPress={() => setServiceType(s)} />
          ))}
        </View>
        <Text style={styles.label}>{t('area')}</Text>
        <View style={styles.chipRow}>
          <Chip label={t('hotlines')} selected={area === null} onPress={() => setArea(null)} />
          {LUSAKA_AREAS.map((a) => (
            <Chip key={a} label={a} selected={area === a} onPress={() => setArea(a)} />
          ))}
        </View>
        <Pressable style={styles.button} onPress={save}>
          <Text style={styles.buttonText}>{t('save')}</Text>
        </Pressable>
        {editing && (
          <Pressable onPress={clearForm}>
            <Text style={[styles.muted, { textAlign: 'center' }]}>{t('cancel')}</Text>
          </Pressable>
        )}
      </View>

      {contacts.map((contact) => (
        <View key={contact.contactId} style={styles.card}>
          <Text style={{ fontWeight: 'bold' }}>{contact.name}</Text>
          <Text style={styles.muted}>{contact.title}{contact.area ? ' · ' + contact.area : ''}</Text>
          <Text>{contact.phone}{contact.email ? ' · ' + contact.email : ''}</Text>
          <View style={[styles.chipRow, { marginTop: 6 }]}>
            <Chip label={t('edit')} selected={false} onPress={() => startEdit(contact)} />
            <Chip label={t('deleteText')} selected={false} onPress={() => remove(contact)} />
          </View>
        </View>
      ))}
    </View>
  );
}
