import { ReactElement, ReactNode } from 'react';
import { RefreshControlProps, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { lightColors } from '@/theme/light';
import { spacing } from '@/theme/spacing';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  title?: string;
  showLogo?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function Screen({
  children,
  scroll = true,
  title,
  showLogo = true,
  refreshControl,
}: ScreenProps) {
  const header = title ? (
    <ScreenHeader title={title} showLogo={showLogo} />
  ) : null;

  if (scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}>
          {header}
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={[styles.content, styles.contentFlex]}>
        {header}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  contentFlex: {
    flex: 1,
  },
});
