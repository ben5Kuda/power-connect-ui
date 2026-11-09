import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './styles';

// Two kinds of menu with the same tabs. App.js picks one depending on the screen width:
//   - SideMenu:   wide screens (a computer's web browser)
//   - BottomTabs: phones and narrow browser windows
//
// Each tab looks like: { key: 'alerts', label: 'Alerts', icon: 'notifications-outline' }
// The icon names come from Ionicons: https://icons.expo.fyi

// The little red number on the Alerts icon
function Badge({ count }) {
  if (!count) return null;
  return (
    <View style={local.badge}>
      <Text style={local.badgeText}>{count}</Text>
    </View>
  );
}

// ---------- Side menu, with a ☰ button to make it narrow (icons only) or wide (icons + words) ----------
export function SideMenu({ tabs, current, go, unread }) {
  const [open, setOpen] = useState(true);

  return (
    <View style={[local.side, { width: open ? 220 : 64 }]}>
      <Pressable style={local.sideItem} onPress={() => setOpen(!open)}>
        <Ionicons name="menu" size={24} color={colors.text} />
      </Pressable>

      {tabs.map((tab) => {
        const active = current === tab.key;
        return (
          <Pressable key={tab.key} style={[local.sideItem, active && local.sideItemActive]} onPress={() => go(tab.key)}>
            <View>
              <Ionicons name={tab.icon} size={22} color={active ? colors.primary : colors.muted} />
              {tab.key === 'alerts' && <Badge count={unread} />}
            </View>
            {open && <Text style={[local.sideText, active && local.textActive]}>{tab.label}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- Bottom tabs (phones) ----------
export function BottomTabs({ tabs, current, go, unread }) {
  return (
    <View style={local.bottom}>
      {tabs.map((tab) => {
        const active = current === tab.key;
        return (
          <Pressable key={tab.key} style={local.bottomItem} onPress={() => go(tab.key)}>
            <View>
              <Ionicons name={tab.icon} size={22} color={active ? colors.primary : colors.muted} />
              {tab.key === 'alerts' && <Badge count={unread} />}
            </View>
            <Text style={[local.bottomText, active && local.textActive]} numberOfLines={1}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const local = StyleSheet.create({
  side: { backgroundColor: '#FFFFFF', borderRightWidth: 1, borderRightColor: colors.border, paddingTop: 8 },
  sideItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, gap: 14 },
  sideItemActive: { backgroundColor: '#E6F2EC', borderLeftWidth: 4, borderLeftColor: colors.primary, paddingLeft: 16 },
  sideText: { color: colors.text, fontSize: 15 },

  bottom: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#FFFFFF', paddingBottom: 20 },
  bottomItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  bottomText: { color: colors.muted, fontSize: 11, marginTop: 2 },

  textActive: { color: colors.primary, fontWeight: 'bold' },
  badge: { position: 'absolute', top: -6, right: -10, backgroundColor: colors.danger, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
});
