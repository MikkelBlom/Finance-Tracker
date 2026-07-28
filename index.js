// Custom entry point. expo-router's own entry is imported for its side effect of
// registering the root component; the widget task handler has to be registered in the
// same bundle, because Android runs it headlessly without starting the app.
import 'expo-router/entry';
import { Platform } from 'react-native';

// Widgets are an Android concept and the library has no web build, so both the import
// and the registration are kept off every other platform — otherwise this would break
// the browser preview, which is the main iteration loop.
if (Platform.OS === 'android') {
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { widgetTaskHandler } = require('./widgets/widget-task-handler');
  registerWidgetTaskHandler(widgetTaskHandler);
}
