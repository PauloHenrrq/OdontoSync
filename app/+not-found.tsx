import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSizes } from '@/src/styles/tokens';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🦷</Text>
        <Text style={styles.title}>Página não encontrada</Text>
        <Text style={styles.subtitle}>Essa rota não existe no OdontoSync.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar ao início</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.headlineSm, color: colors.onSurface, marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurfaceVariant },
  link: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.primaryFixed, borderRadius: 20 },
  linkText: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.primary },
});
