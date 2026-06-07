// ============================================================
// OdontoSync — Custom Alert for Cross-Platform Support (Web/Mobile)
// Falls back to window.confirm/alert on Web environment.
// ============================================================

import { Alert as RNAlert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean }
  ) => {
    if (Platform.OS === 'web') {
      const formattedMessage = message ? `${title}\n\n${message}` : title;
      if (buttons && buttons.length > 0) {
        // Find cancel and action buttons
        const cancelBtn = buttons.find(b => b.style === 'cancel');
        const primaryBtn = buttons.find(b => b.style !== 'cancel') || buttons[0];

        if (buttons.length === 1) {
          window.alert(formattedMessage);
          if (buttons[0].onPress) buttons[0].onPress();
        } else {
          const confirmed = window.confirm(formattedMessage);
          if (confirmed) {
            if (primaryBtn.onPress) primaryBtn.onPress();
          } else {
            if (cancelBtn?.onPress) cancelBtn.onPress();
          }
        }
      } else {
        window.alert(formattedMessage);
      }
    } else {
      RNAlert.alert(title, message, buttons, options);
    }
  }
};
