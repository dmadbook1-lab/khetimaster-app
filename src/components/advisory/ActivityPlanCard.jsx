import { useTranslation } from 'react-i18next';
import React, {useMemo, useState} from 'react';

import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

import {Check, ChevronDown, ClipboardList} from 'lucide-react-native';

import {
  ACTIVITY_UI,
  COLORS,
  FALLBACK_ACTIVITY_UI,
  PROGRESS_STEPS,
  describeProduct,
  splitActivityDetails,
} from './advisoryTheme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PROGRESS_ORDER = PROGRESS_STEPS.map(step => step.key);

/*
|--------------------------------------------------------------------------
| PROGRESS STEPPER
|--------------------------------------------------------------------------
*/

function ProgressStepper({value, color, saving, onChange}) {
  const reached = PROGRESS_ORDER.indexOf(value);

  return (
    <View style={styles.stepper}>
      {PROGRESS_STEPS.map((step, index) => {
        const active = index <= reached;

        return (
          <TouchableOpacity
            key={step.key}
            activeOpacity={0.8}
            disabled={saving}
            onPress={() => onChange(step.key)}
            style={[
              styles.stepButton,
              active && {backgroundColor: color, borderColor: color},
              saving && styles.stepSaving,
            ]}>
            {active && index === reached ? (
              <Check size={11} color="#FFFFFF" strokeWidth={3} />
            ) : null}

            <Text style={[styles.stepText, active && styles.stepTextActive]}>
              {step.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| ACTIVITY ROW
|--------------------------------------------------------------------------
*/

function ActivityRow({activity, expanded, onToggle, saving, onProgress, isLast}) {
  const {t} = useTranslation();
  const ui = ACTIVITY_UI[activity.type] || {
    ...FALLBACK_ACTIVITY_UI,
    tag: activity.type,
  };
  const Icon = ui.icon;
  const done = activity.progress === 'completed';

  const {products, rows} = useMemo(
    () => splitActivityDetails(activity.details),
    [activity.details],
  );

  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onToggle}
        style={styles.rowHead}>
        <View style={[styles.rowIcon, {backgroundColor: ui.soft}]}>
          <Icon size={19} color={ui.color} strokeWidth={2.2} />

          {done ? (
            <View style={[styles.doneBadge, {backgroundColor: ui.color}]}>
              <Check size={8} color="#FFFFFF" strokeWidth={3.5} />
            </View>
          ) : null}
        </View>

        <View style={styles.rowText}>
          <View style={styles.rowTitleLine}>
            <Text
              style={[styles.rowTitle, done && styles.rowTitleDone]}
              numberOfLines={1}>
              {activity.title}
            </Text>

            <View style={[styles.tag, {backgroundColor: ui.soft}]}>
              <Text style={[styles.tagText, {color: ui.color}]}>{ui.tag}</Text>
            </View>
          </View>

          <Text style={styles.rowMessage} numberOfLines={expanded ? undefined : 2}>
            {activity.message}
          </Text>
        </View>

        <ChevronDown
          size={16}
          color={COLORS.muted}
          style={{transform: [{rotate: expanded ? '180deg' : '0deg'}]}}
        />
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.expanded}>
          {products.length ? (
            <View style={styles.products}>
              {products.map((product, index) => (
                <View
                  key={`${product?.name || index}`}
                  style={[styles.product, {borderLeftColor: ui.color}]}>
                  <Text style={styles.productName}>
                    {describeProduct(product)}
                  </Text>

                  {product?.purpose || product?.method ? (
                    <Text style={styles.productMeta}>
                      {[product.purpose, product.method].filter(Boolean).join(' · ')}
                    </Text>
                  ) : null}

                  {product?.totalKgFarm != null ? (
                    <Text style={[styles.productTotal, {color: ui.color}]}>
                      {product.totalKgFarm} kg for whole farm
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {rows.map(row => (
            <View key={row.key} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{row.label}</Text>

              {row.values.length === 1 ? (
                <Text style={styles.detailValue}>{row.values[0]}</Text>
              ) : (
                row.values.map((value, index) => (
                  <View key={index} style={styles.bulletLine}>
                    <View style={[styles.bullet, {backgroundColor: ui.color}]} />

                    <Text style={styles.detailValue}>{value}</Text>
                  </View>
                ))
              )}
            </View>
          ))}

          <Text style={styles.trackLabel}>{t('advisory.track_task')}</Text>

          <ProgressStepper
            value={activity.progress}
            color={ui.color}
            saving={saving}
            onChange={onProgress}
          />
        </View>
      ) : null}
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| CARD
|--------------------------------------------------------------------------
*/

export default function ActivityPlanCard({
  activities = [],
  progressSaving = {},
  onProgress,
}) {
  const { t } = useTranslation();
  const [expandedType, setExpandedType] = useState(null);

  const completed = activities.filter(a => a.progress === 'completed').length;
  const percent = activities.length
    ? Math.round((completed / activities.length) * 100)
    : 0;

  if (!activities.length) {
    return null;
  }

  const toggle = type => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedType(current => (current === type ? null : type));
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <ClipboardList size={18} color={COLORS.green} strokeWidth={2.3} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>{t('advisory.field_plan')}</Text>

          <Text style={styles.subtitle}>
            {t('advisory.tasks_done', {done: completed, total: activities.length})}
          </Text>
        </View>

        <View style={styles.progressPill}>
          <Text style={styles.progressPillText}>{percent}%</Text>
        </View>
      </View>

      <View style={styles.planTrack}>
        <View style={[styles.planFill, {width: `${percent}%`}]} />
      </View>

      {activities.map((activity, index) => (
        <ActivityRow
          key={`${activity.type}-${index}`}
          activity={activity}
          expanded={expandedType === activity.type}
          onToggle={() => toggle(activity.type)}
          saving={Boolean(progressSaving[activity.type])}
          onProgress={progress => onProgress?.(activity.type, progress)}
          isLast={index === activities.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: COLORS.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    backgroundColor: COLORS.forest,
  },

  progressPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  planTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.track,
    marginTop: 14,
    marginBottom: 4,
    overflow: 'hidden',
  },

  planFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },

  row: {
    paddingVertical: 12,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F1',
  },

  rowHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  doneBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  rowText: {
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },

  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowTitle: {
    flexShrink: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
  },

  rowTitleDone: {
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },

  tag: {
    marginLeft: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  tagText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  rowMessage: {
    color: '#4A5650',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 4,
  },

  expanded: {
    marginTop: 10,
    marginLeft: 51,
  },

  products: {
    marginBottom: 6,
  },

  product: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F7F9F8',
    borderLeftWidth: 3,
    marginBottom: 6,
  },

  productName: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
  },

  productMeta: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  productTotal: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
  },

  detailRow: {
    marginBottom: 8,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 2,
  },

  detailValue: {
    flex: 1,
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  bulletLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
  },

  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 7,
  },

  trackLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 4,
    marginBottom: 6,
  },

  stepper: {
    flexDirection: 'row',
  },

  stepButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginRight: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },

  stepSaving: {
    opacity: 0.6,
  },

  stepText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 3,
  },

  stepTextActive: {
    color: '#FFFFFF',
  },
});
