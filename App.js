import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { get, post, put, setToken } from './api';
import { translate, LANGUAGES } from './translations';
import { colors } from './styles';
import { Chip } from './components';
import { SideMenu, BottomTabs } from './Navigation';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import IncidentsScreen from './screens/IncidentsScreen';
import NewIncidentScreen from './screens/NewIncidentScreen';
import IncidentDetailScreen from './screens/IncidentDetailScreen';
import AlertsScreen from './screens/AlertsScreen';
import ReportsScreen from './screens/ReportsScreen';
import ContactsScreen from './screens/ContactsScreen';
import AccountScreen from './screens/AccountScreen';
import ManageScreen from './screens/ManageScreen';
import MapScreen from './screens/MapScreen';
import ChatScreen from './screens/ChatScreen';

// The whole app. It remembers who is logged in, their language and which screen to show.
export default function App() {
  const [user, setUser] = useState(null);                 // null = nobody logged in
  const [language, setLanguage] = useState('en');
  const [screen, setScreen] = useState('login');          // which screen is showing
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [visit, setVisit] = useState(0);                  // goes up every time we change screen
  const [unread, setUnread] = useState(0);                // how many unread alerts
  const [showBanner, setShowBanner] = useState(false);    // the "new alert" banner at the top
  const lastUnread = useRef(0);                           // the count from the last check

  // Wide screen (a computer's browser) -> side menu. Phone or narrow window -> tabs at the bottom.
  // useWindowDimensions() updates by itself when the window is resized.
  const { width } = useWindowDimensions();
  const wideScreen = Platform.OS === 'web' && width >= 768;

  // Check for new alerts every 10 seconds while someone is logged in.
  // This is called "polling": the app keeps asking the server, so no refresh is needed.
  useEffect(() => {
    if (!user) return;
    lastUnread.current = 0;

    async function check() {
      try {
        const count = await get('/notifications/unread');
        if (count > lastUnread.current) {
          setShowBanner(true);                            // more unread than before = something new
        }
        lastUnread.current = count;
        setUnread(count);
      } catch (e) {
        // the server may be restarting - just try again next time
      }
    }

    check();                                              // check straight away...
    const timer = setInterval(check, 10000);              // ...and then every 10 seconds
    return () => clearInterval(timer);                    // stop checking when the user logs out
  }, [user]);

  // t('login') gives the word "login" in the chosen language
  const t = (key) => translate(key, language);

  // Show another screen. "incident" is only needed for the detail screen.
  // Changing "visit" makes the screen start fresh and reload its data, even when
  // you tap the tab you are already on.
  function go(newScreen, incident) {
    if (newScreen === 'alerts') setShowBanner(false);
    setSelectedIncident(incident || null);
    setScreen(newScreen);
    setVisit(visit + 1);
  }

  // Called after logging in or creating an account
  function onLogin(token, loggedInUser) {
    setToken(token);
    setUser(loggedInUser);
    go('incidents');
    put('/auth/language', { language: language });        // save the language they picked
  }

  async function logout() {
    try {
      await post('/auth/logout');
    } catch (e) {
      // ignore: we log out on this phone anyway
    }
    setToken(null);
    setUser(null);
    go('login');
  }

  function changeLanguage(code) {
    setLanguage(code);
    if (user) {
      put('/auth/language', { language: code });
    }
  }

  // The language buttons, shown at the top of every screen
  const languageButtons = (
    <View style={local.languageRow}>
      {LANGUAGES.map((lang) => (
        <Chip key={lang.code} label={lang.name} selected={language === lang.code}
              onPress={() => changeLanguage(lang.code)} />
      ))}
    </View>
  );

  // ---------- Not logged in: login, create account, or the help chat ----------
  if (!user) {
    if (screen === 'register') {
      return <RegisterScreen t={t} language={language} languageButtons={languageButtons} go={go} onLogin={onLogin} />;
    }
    if (screen === 'help') {
      return (
        <View style={local.app}>
          <View style={local.header}>
            <Text style={local.appName}>PowerConnect</Text>
            {languageButtons}
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Pressable onPress={() => go('login')}>
              <Text style={{ color: colors.muted, marginBottom: 8 }}>← {t('back')}</Text>
            </Pressable>
            <ChatScreen t={t} language={language} />
          </ScrollView>
        </View>
      );
    }
    return <LoginScreen t={t} languageButtons={languageButtons} go={go} onLogin={onLogin} />;
  }

  // ---------- Logged in ----------
  // Pick the screen to show in the middle
  let content;
  if (screen === 'new') {
    content = <NewIncidentScreen t={t} go={go} />;
  } else if (screen === 'detail') {
    content = <IncidentDetailScreen t={t} go={go} user={user} incident={selectedIncident} />;
  } else if (screen === 'alerts') {
    content = <AlertsScreen t={t} go={go} onRead={() => setUnread(Math.max(unread - 1, 0))} />;
  } else if (screen === 'reports') {
    content = <ReportsScreen t={t} />;
  } else if (screen === 'account') {
    content = <AccountScreen t={t} user={user} />;
  } else if (screen === 'manage') {
    content = <ManageScreen t={t} />;
  } else if (screen === 'map') {
    content = <MapScreen t={t} user={user} />;
  } else if (screen === 'contacts') {
    content = <ContactsScreen t={t} user={user} />;
  } else if (screen === 'help') {
    content = <ChatScreen t={t} language={language} />;
  } else {
    content = <IncidentsScreen t={t} go={go} user={user} />;
  }

  // The menu items depend on the role. "icon" is an Ionicons name (https://icons.expo.fyi)
  const alertsTab = { key: 'alerts', label: t('alerts'), icon: 'notifications-outline' };
  const contactsTab = { key: 'contacts', label: t('contacts'), icon: 'call-outline' };
  let tabs;
  if (user.role === 'ADMIN') {
    tabs = [
      { key: 'incidents', label: t('allIncidents'), icon: 'list-outline' },
      alertsTab,
      { key: 'reports', label: t('reports'), icon: 'bar-chart-outline' },
      { key: 'manage', label: t('manage'), icon: 'settings-outline' },
    ];
  } else if (user.role === 'COUNCILLOR') {
    tabs = [
      { key: 'incidents', label: t('wardIncidents'), icon: 'list-outline' },
      alertsTab,
      { key: 'map', label: t('map'), icon: 'map-outline' },
    ];
  } else if (user.role === 'TECHNICIAN') {
    tabs = [{ key: 'incidents', label: t('myJobs'), icon: 'construct-outline' }, alertsTab, contactsTab];
  } else {
    tabs = [{ key: 'incidents', label: t('myIncidents'), icon: 'list-outline' }, alertsTab, contactsTab];
  }
  tabs.push({ key: 'help', label: t('chatBot'), icon: 'chatbubbles-outline' });

  return (
    <View style={local.app}>
      <StatusBar style="light" />

      {/* Top bar: who is logged in, language, log out */}
      <View style={[local.header, wideScreen && { paddingTop: 16 }]}>
        <View style={local.headerRow}>
          {/* Tap your name to open "My account" */}
          <Pressable onPress={() => go('account')}>
            <Text style={local.appName}>PowerConnect</Text>
            <Text style={local.userText}>👤 {user.fullName} · {user.userCode}</Text>
          </Pressable>
          <Pressable onPress={logout}>
            <Text style={local.logout}>{t('logout')}</Text>
          </Pressable>
        </View>
        {languageButtons}
      </View>

      {/* New alert banner: tap it to open the alerts */}
      {showBanner && (
        <Pressable style={local.banner} onPress={() => go('alerts')}>
          <Text style={local.bannerText}>🔔 {t('newAlert')}</Text>
        </Pressable>
      )}

      {/* Wide screen: menu on the left of the page. Phone: tabs under the page. */}
      <View style={{ flex: 1, flexDirection: wideScreen ? 'row' : 'column' }}>
        {wideScreen && <SideMenu tabs={tabs} current={screen} go={go} unread={unread} />}

        <ScrollView key={visit} style={local.body} contentContainerStyle={{ padding: 16 }}>
          {content}
        </ScrollView>

        {!wideScreen && <BottomTabs tabs={tabs} current={screen} go={go} unread={unread} />}
      </View>
    </View>
  );
}

// Styles only used in this file
const local = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingTop: 48, paddingHorizontal: 16, paddingBottom: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appName: { color: colors.accent, fontSize: 20, fontWeight: 'bold' },
  userText: { color: '#FFFFFF', marginTop: 2 },
  logout: { color: '#FFFFFF', textDecorationLine: 'underline' },
  languageRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  body: { flex: 1 },
  banner: { backgroundColor: colors.accent, padding: 12, alignItems: 'center' },
  bannerText: { color: colors.text, fontWeight: 'bold' },
});
