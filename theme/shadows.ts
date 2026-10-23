import { Platform, ViewStyle } from 'react-native';

export const cardShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  android: {
    elevation: 3,
  },
  default: {},
}) as ViewStyle;

export const softShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: {
    elevation: 2,
  },
  default: {},
}) as ViewStyle;
