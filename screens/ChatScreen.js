import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { post } from '../api';
import { styles, colors } from '../styles';
import { Chip } from '../components';

const HELPLINE = '+260 211 000 000';
const EMAIL = 'help@powerconnect.co.zm';

// Quick questions the user can tap instead of typing.
// "label" is shown in the user's language, "question" is what is sent to the bot.
const QUICK_QUESTIONS = [
  { label: 'quick.report', question: 'How do I report an incident?' },
  { label: 'quick.cable', question: 'There is a fallen cable' },
  { label: 'quick.pipe', question: 'A pipe has burst' },
  { label: 'quick.sewer', question: 'The sewer is blocked' },
  { label: 'quick.power', question: 'There is no power' },
  { label: 'quick.status', question: 'How do I track the status?' },
  { label: 'quick.contact', question: 'How do I contact you?' },
];

// Chat bot: the user asks a question, the FAQ bot on the server replies
export default function ChatScreen({ t, language }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');

  // "shown" is what appears in the user's bubble, "asked" is what is sent to the bot
  async function ask(shown, asked) {
    if (asked.trim() === '') return;
    setQuestion('');
    let answer;
    try {
      const reply = await post('/chat', { message: asked, language: language });
      answer = reply.reply;
    } catch (e) {
      answer = e.message;
    }
    setMessages([...messages, { from: 'me', text: shown }, { from: 'bot', text: answer }]);
  }

  return (
    <View>
      <Text style={styles.title}>{t('chatBot')}</Text>

      {/* Helpline and email are always visible */}
      <View style={local.helpline}>
        <Text style={{ fontWeight: 'bold' }}>📞 {HELPLINE}</Text>
        <Text style={{ fontWeight: 'bold' }}>✉️ {EMAIL}</Text>
      </View>

      {/* The welcome message, always in the current language */}
      <View style={[local.bubble, local.bot]}>
        <Text>{t('chatWelcome')}</Text>
      </View>

      {messages.map((message, index) => (
        <View key={index} style={[local.bubble, message.from === 'me' ? local.mine : local.bot]}>
          <Text style={{ color: message.from === 'me' ? '#FFFFFF' : colors.text }}>{message.text}</Text>
        </View>
      ))}

      <Text style={styles.label}>{t('quickQuestions')}</Text>
      <View style={styles.chipRow}>
        {QUICK_QUESTIONS.map((q) => (
          <Chip key={q.label} label={t(q.label)} selected={false} onPress={() => ask(t(q.label), q.question)} />
        ))}
      </View>

      <TextInput style={[styles.input, { marginTop: 10 }]} placeholder={t('chatPlaceholder')}
                 value={question} onChangeText={setQuestion} onSubmitEditing={() => ask(question, question)} />
      <Pressable style={styles.button} onPress={() => ask(question, question)}>
        <Text style={styles.buttonText}>{t('send')}</Text>
      </Pressable>
    </View>
  );
}

const local = StyleSheet.create({
  helpline: { backgroundColor: '#FFF4D6', borderRadius: 10, padding: 12, marginBottom: 12 },
  bubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '85%' },
  mine: { backgroundColor: colors.primary, alignSelf: 'flex-end' },
  bot: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.border },
});
