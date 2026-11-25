import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Check, MapPin, Sprout, User} from 'lucide-react-native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import MarketHero, {TopInset} from '../../components/market/MarketHero';
import {MarketButton} from '../../components/market/MarketBits';
import {MARKET_COLORS as C} from '../../components/market/theme';
import FeedbackModal, {useFeedbackModal} from '../../components/common/FeedbackModal';
import {
  Field,
  FormCard,
  FormInput,
  SectionHeading,
  SelectChips,
} from '../../components/labour/FormBits';
import {SOIL_ROUTES} from '../../constants/soilRoutes';
import {createSoilTestApi} from '../../api/soilTestApi';
import {selectFarmFields} from '../../redux/slices/farmFieldSlice';

const digits = (s, max) => String(s || '').replace(/\D/g, '').slice(0, max);

export default function BookSoilTestScreen({navigation}) {
  const {t} = useTranslation();
  const user = useSelector(state => state.auth.user);
  const farms = useSelector(selectFarmFields);
  const feedback = useFeedbackModal();

  const [first, ...rest] = String(user?.fullName || '').trim().split(/\s+/);
  const [form, setForm] = useState({
    firstName: first || '',
    lastName: rest.join(' '),
    mobileNo: digits(user?.phoneNumber, 10).slice(-10),
    emailId: user?.email || '',
    address: [user?.village, user?.taluka].filter(Boolean).join(', '),
    city: user?.district || '',
    state: user?.state || '',
    pincode: '',
    farmSize: '',
    farmSizeUnit: 'Acres',
    previousCrop: '',
    nextCrop: '',
    farmField: null,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, value) => {
    setForm(prev => ({...prev, [key]: value}));
    setErrors(prev => ({...prev, [key]: undefined}));
  };

  const farmOptions = useMemo(
    () => farms.map(f => ({id: f._id, label: f.fieldName || f.cropName || '—', farm: f})),
    [farms],
  );

  const pickFarm = label => {
    const opt = farmOptions.find(o => o.label === label);
    if (!opt) {
      return;
    }
    const {farm} = opt;
    setForm(prev => ({
      ...prev,
      farmField: opt.id,
      farmSize: farm.acre ? String(farm.acre) : prev.farmSize,
      farmSizeUnit: farm.acre ? 'Acres' : prev.farmSizeUnit,
      previousCrop: farm.cropName || prev.previousCrop,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 1;
    if (!form.lastName.trim()) e.lastName = 1;
    if (!/^[0-9]{10}$/.test(form.mobileNo)) e.mobileNo = 1;
    if (form.emailId.trim() && !/^\S+@\S+\.\S+$/.test(form.emailId.trim())) e.emailId = 1;
    if (!form.address.trim()) e.address = 1;
    if (!form.city.trim()) e.city = 1;
    if (!form.state.trim()) e.state = 1;
    const pin = Number(form.pincode);
    if (!Number.isInteger(pin) || pin < 100000 || pin > 999999) e.pincode = 1;
    const size = parseFloat(form.farmSize);
    if (!(size > 0)) e.farmSize = 1;
    if (!form.previousCrop.trim()) e.previousCrop = 1;
    if (!form.nextCrop.trim()) e.nextCrop = 1;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      feedback.error(t('soilTest.bookFailed'), t('soilTest.fixFields'));
      return;
    }
    setSaving(true);
    try {
      const size = Math.round(parseFloat(form.farmSize) * 100) / 100;
      const res = await createSoilTestApi({
        ...form,
        farmSize: size,
        emailId: form.emailId.trim(),
        pincode: Number(form.pincode),
      });
      const test = res.data;
      setSaving(false);
      feedback.success(
        t('soilTest.bookedTitle'),
        test.sampleId
          ? t('soilTest.bookedMsg', {id: test.sampleId})
          : t('soilTest.bookedMsgNoId'),
        {
          primaryLabel: t('soilTest.viewTest'),
          onPrimary: () =>
            navigation.replace(SOIL_ROUTES.DETAILS, {id: test._id}),
        },
      );
    } catch (error) {
      setSaving(false);
      const data = error.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      }
      feedback.error(
        t('soilTest.bookFailed'),
        data?.message || error.message,
      );
    }
  };

  const input = (key, label, props = {}) => (
    <Field label={label}>
      <FormInput
        value={String(form[key] ?? '')}
        onChangeText={v => set(key, props.numeric ? digits(v, props.max) : v)}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        style={errors[key] ? styles.inputError : undefined}
      />
    </Field>
  );

  return (
    <View style={styles.container}>
      <TopInset />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <MarketHero
            compact
            gradient="forest"
            onBack={() => navigation.goBack()}
            title={t('soilTest.bookTitle')}
          />

          <View style={styles.body}>
            <FormCard>
              <SectionHeading
                icon={<User size={18} color={C.green} />}
                title={t('soilTest.secFarmer')}
              />
              {input('firstName', t('soilTest.firstName'))}
              {input('lastName', t('soilTest.lastName'))}
              {input('mobileNo', t('soilTest.mobile'), {
                numeric: true,
                max: 10,
                keyboardType: 'number-pad',
              })}
              {input('emailId', t('soilTest.email'), {
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              })}
            </FormCard>

            <FormCard>
              <SectionHeading
                icon={<MapPin size={18} color={C.green} />}
                title={t('soilTest.secAddress')}
              />
              {input('address', t('soilTest.address'))}
              {input('city', t('soilTest.city'))}
              {input('state', t('soilTest.state'))}
              {input('pincode', t('soilTest.pincode'), {
                numeric: true,
                max: 6,
                keyboardType: 'number-pad',
              })}
            </FormCard>

            <FormCard>
              <SectionHeading
                icon={<Sprout size={18} color={C.green} />}
                title={t('soilTest.secFarm')}
              />
              {farmOptions.length > 0 && (
                <Field label={t('soilTest.pickFarm')}>
                  <SelectChips
                    options={farmOptions.map(o => o.label)}
                    value={farmOptions.find(o => o.id === form.farmField)?.label}
                    onChange={pickFarm}
                    labels={Object.fromEntries(farmOptions.map(o => [o.label, o.label]))}
                  />
                </Field>
              )}
              <Field label={t('soilTest.farmSize')}>
                <FormInput
                  value={form.farmSize}
                  onChangeText={v => set('farmSize', v.replace(/[^0-9.]/g, '').slice(0, 8))}
                  keyboardType="decimal-pad"
                  style={errors.farmSize ? styles.inputError : undefined}
                />
              </Field>
              <SelectChips
                options={['Acres', 'Hectares']}
                value={form.farmSizeUnit}
                onChange={v => set('farmSizeUnit', v)}
                labels={{Acres: t('soilTest.acres'), Hectares: t('soilTest.hectares')}}
              />
              {input('previousCrop', t('soilTest.previousCrop'))}
              {input('nextCrop', t('soilTest.nextCrop'))}
            </FormCard>

            <MarketButton
              label={t('soilTest.submit')}
              icon={saving ? null : <Check size={18} color={C.white} />}
              loading={saving}
              onPress={submit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <FeedbackModal {...feedback.modalProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  flex: {flex: 1},
  scroll: {paddingBottom: 40},
  body: {paddingHorizontal: 16, paddingTop: 16, gap: 16},
  inputError: {borderColor: C.red, backgroundColor: C.lightRed},
});
