import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import {
  Camera,
  Video,
  Mic,
  Globe,
  MapPin,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react-native';
import StepHeader from '../StepHeader';
import HeroBanner from '../HeroBanner';
import SectionLabel from '../SectionLabel';
import MediaButton from '../MediaButton';
import ChipGroup from '../ChipGroup';
import DropdownField from '../DropdownField';
import LocationField from '../LocationField';
import VisibilityCard from '../VisibilityCard';
import AIAssistBanner from '../AIAssistBanner';
import FooterBar from '../FooterBar';
import PrimaryButton from '../PrimaryButton';
import { COLORS, rf, PAGE_PADDING } from '../../theme';
const STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];
const CATEGORIES = [
  'Disease',
  'Irrigation',
  'Fertilizer',
  'Crop Care',
  'Machinery',
  'Market',
  'Government',
];
const VISIBILITY = [
  {
    id: 'Public',
    label: 'Public',
    sub: 'Everyone can\nanswer',
    icon: Globe,
  },
  {
    id: 'Nearby Farmers',
    label: 'Nearby\nFarmers',
    sub: 'Farmers near you',
    icon: MapPin,
  },
  {
    id: 'Experts Only',
    label: 'Experts Only',
    sub: 'Certified experts',
    icon: BadgeCheck,
  },
];
export default function Step1AskQuestion({
  step,
  totalSteps,
  formData,
  updateField,
  onBack,
  onContinue,
}) {
  return (
    <View style={styles.flex}>
      <StepHeader
        title="Ask Question"
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <HeroBanner
          title="What do you need help with?"
          subtitle="Describe your farming problem and let the community help you."
        />

        {}
        <SectionLabel>Question Title</SectionLabel>
        <View style={styles.inputBox}>
          <TextInput
            value={formData.title}
            onChangeText={t => updateField('title', t)}
            placeholder="Enter your question..."
            placeholderTextColor={COLORS.MUTED}
            style={styles.input}
          />
        </View>

        {}
        <SectionLabel
          style={{
            marginTop: 18,
          }}
        >
          Description
        </SectionLabel>
        <View style={[styles.inputBox, styles.textarea]}>
          <TextInput
            value={formData.description}
            onChangeText={t => updateField('description', t)}
            placeholder="Describe your farming problem..."
            placeholderTextColor={COLORS.MUTED}
            multiline
            maxLength={1000}
            style={[
              styles.input,
              {
                textAlignVertical: 'top',
                minHeight: 90,
              },
            ]}
          />
          <Text style={styles.counter}>
            {(formData.description || '').length} / 1000
          </Text>
        </View>

        {}
        <View style={styles.mediaHeader}>
          <SectionLabel
            style={{
              marginBottom: 0,
            }}
          >
            Add Media
          </SectionLabel>
          <Text style={styles.mediaSub}>Up to 5 photos</Text>
        </View>
        <View style={styles.mediaRow}>
          <MediaButton label="Add Photos" icon={Camera} />
          <MediaButton label="Add Video" icon={Video} />
          <MediaButton label="Record Voice" icon={Mic} disabled />
        </View>

        {}
        <SectionLabel
          style={{
            marginTop: 18,
          }}
        >
          Crop
        </SectionLabel>
        <DropdownField value={formData.crop} onPress={() => {}} />

        {}
        <SectionLabel
          style={{
            marginTop: 18,
          }}
        >
          Growth Stage
        </SectionLabel>
        <ChipGroup
          options={STAGES}
          value={formData.stage}
          onChange={v => updateField('stage', v)}
        />

        {}
        <SectionLabel
          style={{
            marginTop: 18,
          }}
        >
          Category
        </SectionLabel>
        <ChipGroup
          options={CATEGORIES}
          value={formData.categories}
          onChange={v => updateField('categories', v)}
          multi
        />

        {}
        <SectionLabel
          style={{
            marginTop: 18,
          }}
        >
          Location
        </SectionLabel>
        <LocationField
          location={formData.location}
          sub="Current location · India"
          onChange={() => {}}
        />

        {}
        <SectionLabel
          style={{
            marginTop: 18,
          }}
        >
          Visibility
        </SectionLabel>
        <VisibilityCard
          options={VISIBILITY}
          value={formData.visibility}
          onChange={v => updateField('visibility', v)}
        />

        {}
        <View
          style={{
            marginTop: 18,
          }}
        >
          <AIAssistBanner />
        </View>
      </ScrollView>

      <FooterBar>
        <PrimaryButton
          label="Continue"
          icon={ArrowRight}
          iconRight
          onPress={onContinue}
        />
      </FooterBar>
    </View>
  );
}
const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.PAGE_BG,
  },
  scroll: {
    padding: PAGE_PADDING,
    paddingBottom: 30,
  },
  inputBox: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    justifyContent: 'center',
    minHeight: 48,
  },
  input: {
    fontSize: rf(12),
    color: COLORS.DARK,
    padding: 0,
    paddingVertical: 12,
  },
  textarea: {
    borderRadius: 16,
    paddingBottom: 8,
  },
  counter: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: rf(10),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  mediaHeader: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mediaSub: {
    fontSize: rf(10.5),
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
