import { Pressable, Text } from 'react-native';
import { styles, statusColors } from './styles';

// A small round button for picking one option (a language, an area, a technician...)
export function Chip({ label, selected, onPress }) {
  return (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={selected ? styles.chipTextSelected : styles.chipText}>{label}</Text>
    </Pressable>
  );
}

// The coloured label showing an incident's status, e.g. "Work in progress"
export function StatusLabel({ status, t }) {
  return (
    <Text style={[styles.statusLabel, { backgroundColor: statusColors[status] }]}>
      {t('status.' + status)}
    </Text>
  );
}
