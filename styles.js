import { StyleSheet } from 'react-native';

// Colours used across the app
export const colors = {
  primary: '#0B6E4F',     // green
  accent: '#F2A900',      // power yellow
  background: '#F4F6F5',
  card: '#FFFFFF',
  text: '#1C2B26',
  muted: '#5F6F69',
  border: '#D5DDD9',
  danger: '#B3261E',
};

// One colour per incident status, for the little status label
export const statusColors = {
  REPORTED: '#5F6F69',
  ASSIGNED: '#1565C0',
  DISPATCHED: '#6A1B9A',
  IN_PROGRESS: '#E08E00',
  COMPLETED: '#0B6E4F',
  NOT_COMPLETED: '#B3261E',
  CLOSED: '#37474F',
  REOPENED: '#C2185B',
};

// Styles shared by all the screens
export const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  label: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginTop: 12, marginBottom: 6 },
  muted: { color: colors.muted },
  error: { color: colors.danger, marginVertical: 8 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginVertical: 6,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  // Small round buttons used as choices (area, category, language, technician)
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: '#FFFFFF', borderWidth: 2 },
  chipText: { color: colors.primary },
  chipTextSelected: { color: '#FFFFFF' },

  statusLabel: {
    alignSelf: 'flex-start',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
});
