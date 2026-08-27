import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, Camera, Tag, Calendar, MapPin, Tractor, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const rf = s => Math.max(s-2, Math.min(s*width/390, s+2));
const BRANDS = ['Mahindra','John Deere','Sonalika','Swaraj','Kubota','Other'];
const YEARS = ['2024','2023','2022','2021','2020','2019'];

export default function ProvideServiceStep3Screen({ navigation, route }) {
  const [photo, setPhoto] = useState(null);
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('2024');
  const [showBrand, setShowBrand] = useState(false);
  const [showYear, setShowYear] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top','bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft size={20} color="#111" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Provide Service</Text>
        <View style={styles.stepWrap}>
          <Text style={styles.stepText}>Step 3 of 4</Text>
          <View style={styles.progressRow}>
            <View style={[styles.dot, styles.dotActive]} /><View style={[styles.dot, styles.dotActive]} /><View style={[styles.dot, styles.dotActive]} /><View style={styles.dot} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.centerWrap}>
          <View style={styles.iconBox}><Tractor size={34} color="#1B7A2E" /></View>
          <Text style={styles.title}>Machinery Details</Text>
          <Text style={styles.sub}>Fill in basic details of your machinery.</Text>
        </View>

        <View style={styles.labelRow}><Camera size={14} color="#6B7280" /><Text style={styles.label}> Machinery Photo</Text></View>
        <TouchableOpacity activeOpacity={0.9} style={[styles.uploadBox, photo && {borderColor:'#1B7A2E'}]} onPress={() => setPhoto(!photo)}>
          {photo ? <Image source={require('../../assets/machinery/tractor-red.png')} style={{width:140,height:90}} resizeMode="contain" /> :
          <>
            <View style={styles.camCircle}><Camera size={20} color="#1B7A2E" /></View>
            <Text style={styles.uploadTitle}>Upload Photo</Text>
            <Text style={styles.uploadSub}>Tap to take or choose photo</Text>
          </>}
        </TouchableOpacity>

        <View style={styles.labelRow}><Tag size={14} color="#6B7280" /><Text style={styles.label}> Select Brand</Text></View>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowBrand(!showBrand)}>
          <Text style={[styles.dropText, !brand && {color:'#9CA3AF'}]}>{brand || 'Mahindra, John Deere, etc...'}</Text>
          <ChevronDown size={18} color="#6B7280" />
        </TouchableOpacity>
        {showBrand && <View style={styles.options}>{BRANDS.map(b => (
          <TouchableOpacity key={b} onPress={() => {setBrand(b); setShowBrand(false)}} style={styles.option}><Text style={styles.optionText}>{b}</Text></TouchableOpacity>
        ))}</View>}

        <View style={[styles.labelRow,{marginTop:14}]}><Calendar size={14} color="#6B7280" /><Text style={styles.label}> Model Year</Text></View>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowYear(!showYear)}>
          <Text style={styles.dropText}>{year}</Text>
          <ChevronDown size={18} color="#6B7280" />
        </TouchableOpacity>
        {showYear && <View style={styles.options}>{YEARS.map(y => (
          <TouchableOpacity key={y} onPress={() => {setYear(y); setShowYear(false)}} style={styles.option}><Text style={styles.optionText}>{y}</Text></TouchableOpacity>
        ))}</View>}

        <View style={[styles.labelRow,{marginTop:14}]}><MapPin size={14} color="#DC2626" /><Text style={styles.label}> Current Location</Text></View>
        <View style={styles.locationCard}>
          <View>
            <Text style={styles.locTitle}>Pune, Maharashtra</Text>
            <Text style={styles.locSub}>Fetched via GPS</Text>
          </View>
          <TouchableOpacity style={styles.updateBtn} onPress={() => Alert.alert('Location', 'GPS updated')}>
            <MapPin size={12} color="#1B7A2E" />
            <Text style={styles.updateText}>Update</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('ProvideServiceStep4', {...route.params, brand, year})}>
          <Text style={styles.primaryText}>Continue</Text>
          <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{height:40}} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe:{flex:1, backgroundColor:'#fff'},
  header:{flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:12, justifyContent:'space-between'},
  backBtn:{width:36,height:36,borderRadius:18, borderWidth:1, borderColor:'#eee', alignItems:'center', justifyContent:'center'},
  headerTitle:{fontSize:rf(18), fontWeight:'800', color:'#111'},
  stepWrap:{alignItems:'flex-end'}, stepText:{fontSize:rf(11), color:'#888', fontWeight:'600'},
  progressRow:{flexDirection:'row', gap:5, marginTop:4}, dot:{width:22,height:6, borderRadius:3, backgroundColor:'#E8E8E8'}, dotActive:{backgroundColor:'#1B7A2E'},
  content:{paddingHorizontal:16, paddingBottom:48},
  centerWrap:{alignItems:'center', marginTop:10},
  iconBox:{width:84,height:84, borderRadius:18, backgroundColor:'#EAF6E8', alignItems:'center', justifyContent:'center'},
  title:{fontSize:rf(22), fontWeight:'900', color:'#111', marginTop:10},
  sub:{fontSize:rf(13), color:'#6B7280', textAlign:'center', marginTop:4},
  labelRow:{flexDirection:'row', alignItems:'center', marginTop:18, marginBottom:8},
  label:{fontSize:rf(13), fontWeight:'700', color:'#111'},
  uploadBox:{height:150, borderWidth:1.5, borderColor:'#1B7A2E', borderStyle:'dashed', borderRadius:16, alignItems:'center', justifyContent:'center', backgroundColor:'#FBFEF9'},
  camCircle:{width:52,height:52, borderRadius:26, backgroundColor:'#EAF6E8', alignItems:'center', justifyContent:'center'},
  uploadTitle:{fontSize:rf(14), fontWeight:'800', color:'#111', marginTop:8},
  uploadSub:{fontSize:rf(11), color:'#9CA3AF', marginTop:2},
  dropdown:{height:52, borderWidth:1, borderColor:'#E5E7EB', borderRadius:12, paddingHorizontal:14, flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#fff'},
  dropText:{fontSize:rf(14), color:'#111', fontWeight:'500'},
  options:{borderWidth:1, borderColor:'#E5E7EB', borderRadius:12, marginTop:6, overflow:'hidden'},
  option:{padding:12, backgroundColor:'#fff', borderBottomWidth:1, borderColor:'#F3F4F6'},
  optionText:{fontSize:rf(14), color:'#111'},
  locationCard:{flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderWidth:1, borderColor:'#E5E7EB', borderRadius:12, padding:14, backgroundColor:'#fff'},
  locTitle:{fontSize:rf(15), fontWeight:'800', color:'#111'},
  locSub:{fontSize:rf(11), color:'#9CA3AF', marginTop:2},
  updateBtn:{backgroundColor:'#EAF6E8', paddingHorizontal:14, paddingVertical:8, borderRadius:20, flexDirection:'row', alignItems:'center', gap:4},
  updateText:{color:'#1B7A2E', fontWeight:'700', fontSize:rf(12)},
  primaryBtn:{backgroundColor:'#1B7A2E', height:54, borderRadius:28, alignItems:'center', justifyContent:'center', marginTop:26, flexDirection:'row', gap:8},
  primaryText:{color:'#fff', fontSize:rf(16), fontWeight:'800'},
});