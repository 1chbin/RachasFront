import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { reportarErrorCliente } from '@/services/api/clientErrors';
import { getAppVersion, getLastRequestId } from '@/services/api/client';
import { lightColors } from '@/theme/light';
import { typography } from '@/theme/typography';

type Props = { children: ReactNode; pantalla?: string };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void reportarErrorCliente({
      mensaje: `${error.message}\n${info.componentStack ?? ''}`.slice(0, 1900),
      pantalla: this.props.pantalla ?? 'root',
      requestId: getLastRequestId(),
    }).catch(() => undefined);
  }

  render() {
    if (this.state.error) {
      const refId = getLastRequestId();
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.body}>
            Reiniciá la app. Versión {getAppVersion()}.
            {refId ? `\n\nReferencia (request): ${refId}` : ''}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: lightColors.background,
  },
  title: {
    ...typography.title2,
    color: lightColors.label,
    marginBottom: 8,
  },
  body: {
    ...typography.body,
    color: lightColors.labelSecondary,
    textAlign: 'center',
  },
});
