import { lightColors } from './light';

const regular = 'Inter_400Regular';
const semibold = 'Inter_600SemiBold';
const bold = 'Inter_700Bold';

export const typography = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontFamily: bold,
    color: lightColors.label,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: semibold,
    color: lightColors.label,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: semibold,
    color: lightColors.label,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: regular,
    color: lightColors.label,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: regular,
    color: lightColors.labelSecondary,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: regular,
    color: lightColors.labelSecondary,
  },
  caption: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: regular,
    color: lightColors.muted,
  },
};
