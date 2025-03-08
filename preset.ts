import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyHospitalTheme = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        highlight: {
          background: '#7848F4', // Highlight background matches primary color
          focusBackground: '#7848F4',
          color: '#FFFFFF',
          focusColor: '#FFFFFF',
        },

        primary: {
          50: '#EDE7FF', // Lightest shade
          100: '#D2C3FF',
          200: '#B69EFF',
          300: '#9A7AFF',
          400: '#7E55FF',
          500: '#7848F4', // Main primary color
          600: '#6A3CE0',
          700: '#5C30CC',
          800: '#4E24B8',
          900: '#4018A4',
          950: '#320C90', // Darkest shade
        },
      },
      dark: {
        highlight: {
          background: '#7848F4', // Highlight background matches primary color for dark mode
          focusBackground: '#FFFFFF',
          color: '#FFFFFF',
          focusColor: '#FFFFFF',
        },

        primary: {
          50: '#EDE7FF',
          100: '#D2C3FF',
          200: '#B69EFF',
          300: '#9A7AFF',
          400: '#7E55FF',
          500: '#7848F4', // Default primary color in dark mode
          600: '#6A3CE0',
          700: '#5C30CC',
          800: '#4E24B8',
          900: '#4018A4',
          950: '#320C90',
        },
      },
    },
  },
});
