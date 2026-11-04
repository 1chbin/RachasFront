import { useDevBackReachability } from '@/hooks/useDevBackReachability';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { connectionReachabilityHint } from '@/lib/serverConfig';
import { lightColors } from '@/theme/light';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function DevBackReachabilityBanner() {
  const { checked, ok, healthUrl, message } = useDevBackReachability();
  const [dismissed, setDismissed] = useState(false);

  if (!__DEV__ || !checked || ok || dismissed) {
    return null;
  }

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.title}>Back no alcanzable (solo dev)</Text>
      <Text style={styles.body} numberOfLines={6}>
        {message}
      </Text>
      <Text style={styles.url} selectable>
        GET {healthUrl}
      </Text>
      <Text style={styles.hint}>
        {connectionReachabilityHint(getApiBaseUrl())}
      </Text>
      <Pressable onPress={() => setDismissed(true)} style={styles.dismiss}>
        <Text style={styles.dismissText}>Ocultar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#5c2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#8b3a3a',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    color: '#f5d0d0',
    fontSize: 13,
    marginBottom: 6,
  },
  url: {
    color: lightColors.primary,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  hint: {
    color: '#e8c4c4',
    fontSize: 12,
  },
  dismiss: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dismissText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
