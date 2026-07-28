import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { QuickAddWidget } from './QuickAddWidget';

const WIDGETS = {
  QuickAdd: QuickAddWidget,
} as const;

/**
 * Android calls this in a headless JS context whenever a widget is added, resized or
 * updated. There is no app running around it — no navigation, no providers, and the
 * database is not open — so this must stay self-contained.
 *
 * Taps are handled natively by the OPEN_URI click action, so WIDGET_CLICK needs no
 * work here.
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const name = props.widgetInfo.widgetName as keyof typeof WIDGETS;
  const Widget = WIDGETS[name];
  if (!Widget) return;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(<Widget />);
      break;
    default:
      break;
  }
}
