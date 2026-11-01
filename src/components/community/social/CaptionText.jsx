import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, rf } from '../theme';
import { splitCaption } from '../../../utils/communityFormat';

/*
 * "name caption… more" with tappable #hashtags.
 * dark renders white text for the reels player.
 *
 * An invisible full-length copy is measured to know whether the visible
 * one was cut off (onTextLayout on a clamped Text is unreliable on iOS).
 */
export default function CaptionText({
  name,
  caption,
  numberOfLines = 2,
  dark = false,
  onNamePress,
  onHashtagPress,
  style,
}) {
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  if (!caption && !name) {
    return null;
  }

  const parts = splitCaption(caption);

  const renderBody = interactive => (
    <>
      {name ? (
        <Text
          style={[styles.name, dark && styles.light]}
          onPress={interactive ? onNamePress : undefined}
        >
          {name}{' '}
        </Text>
      ) : null}
      {parts.map((part, index) =>
        part.isTag ? (
          <Text
            key={index}
            style={[styles.tag, dark && styles.tagDark]}
            onPress={
              interactive
                ? () => onHashtagPress?.(part.text.slice(1))
                : undefined
            }
          >
            {part.text}
          </Text>
        ) : (
          <Text key={index}>{part.text}</Text>
        ),
      )}
    </>
  );

  return (
    <View style={style}>
      <Text
        style={[styles.caption, dark && styles.light, styles.measure]}
        onTextLayout={event =>
          setTruncated(event.nativeEvent.lines.length > numberOfLines)
        }
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {renderBody(false)}
      </Text>

      <Text
        numberOfLines={expanded ? undefined : numberOfLines}
        onPress={truncated && !expanded ? () => setExpanded(true) : undefined}
        style={[styles.caption, dark && styles.light]}
      >
        {renderBody(true)}
      </Text>

      {truncated && !expanded ? (
        <Text
          style={[styles.more, dark && styles.moreDark]}
          onPress={() => setExpanded(true)}
        >
          more
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caption: {
    fontSize: rf(13.5),
    lineHeight: rf(19),
    color: COLORS.DARK,
  },
  measure: {
    position: 'absolute',
    left: 0,
    right: 0,
    opacity: 0,
  },
  light: {
    color: '#FFFFFF',
  },
  name: {
    fontWeight: '800',
    color: COLORS.DARK,
  },
  tag: {
    color: COLORS.DARK_GREEN,
    fontWeight: '700',
  },
  tagDark: {
    color: '#BBF7D0',
  },
  more: {
    marginTop: 1,
    fontSize: rf(13),
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  moreDark: {
    color: 'rgba(255,255,255,0.75)',
  },
});
