import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { colors } from '../theme/tokens';

/**
 * The shortest path there is from intent to logged expense: one tap on the home
 * screen straight into the numpad, with no app launch screen in between.
 *
 * Widgets render to Android RemoteViews, not to a real React tree — only the
 * components from this library work here, and there is no state, no effects and no
 * database access. Anything it needs to display has to be passed in by the task handler.
 */
export function QuickAddWidget() {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'financetracker:///add' }}
      accessibilityLabel="Log an expense"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent,
        borderRadius: 24,
        paddingHorizontal: 16,
      }}
    >
      <TextWidget
        text="+"
        style={{
          fontSize: 30,
          color: colors.onAccent,
          marginRight: 10,
        }}
      />
      <TextWidget
        text="Log expense"
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.onAccent,
        }}
      />
    </FlexWidget>
  );
}
