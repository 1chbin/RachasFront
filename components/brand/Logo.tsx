import { Image, StyleSheet, View } from 'react-native';

type LogoProps = {
  size?: number;
};

export function Logo({ size = 140 }: LogoProps) {
  return (
    <View style={styles.wrap} accessibilityLabel="Rachas">
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
