import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, CalendarDays, FileText, Tractor, Check, Upload, Rocket } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const rf = s => Math.max(s-2, Math.min(s*width/390, s+2));

export default function ProvideServiceStep4Screen({ navigation }) {
  const [available, setAvailable] = useState(true);
  return (
    <SafeAreaView style={styles.safe} edges={['top','bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft size={20} color="#111" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Provide Service</Text>
        <View style={styles.stepWrap}>
          <Text style={styles.stepText}>Step 4 of 4</Text>
          <View style={styles.progressRow}>
            <View style={[styles.dot, styles.dotActive]} /><View style={[styles.dot, styles.dotActive]} /><View style={[styles.dot, styles.dotActive]} /><View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.centerWrap}>
          <View style={styles.iconBox}><FileText size={32} color="#1B7A2E" /></View>
          <Text style={styles.title}>Rental Details</Text>
          <Text style={styles.sub}>Fill pricing details and get started.</Text>
        </View>

        <Text style={styles.label}>Set Rent</Text>
        <View style={styles.priceCard}>
          <View style={styles.rowGap}><Clock size={16} color="#6B7280" /><Text style={styles.priceLabel}> Per Hour</Text></View>
          <Text style={styles.priceValue}>₹ 500</Text>
        </View>
        <View style={styles.priceCard}>
          <View style={styles.rowGap}><CalendarDays size={16} color="#6B7280" /><Text style={styles.priceLabel}> Per Day</Text></View>
          <Text style={styles.priceValue}>₹ 3500</Text>
        </View>

        <Text style={[styles.label,{marginTop:16}]}>Available Today?</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity onPress={() => setAvailable(true)} style={[styles.toggleBtn, available && styles.toggleActive]}>
            <View style={[styles.radio, available && styles.radioActive]}>{available && <View style={styles.radioDot} />}</View>
            <Text style={[styles.toggleText, available && styles.toggleTextActive]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAvailable(false)} style={[styles.toggleBtn, !available && styles.toggleActive]}>
            <View style={[styles.radio, !available && styles.radioActive]}>{!available && <View style={styles.radioDot} />}</View>
            <Text style={[styles.toggleText, !available && styles.toggleTextActive]}>No</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label,{marginTop:16}]}>Documents</Text>
        <View style={styles.docCard}>
          <View style={styles.docIcon}><FileText size={18} color="#6B7280" /></View>
          <View style={{flex:1}}>
            <Text style={styles.docTitle}>PAN Card</Text>
            <Text style={styles.docSub}>Take photo or upload</Text>
          </View>
          <TouchableOpacity style={styles.uploadBtn}><Upload size={14} color="#1B7A2E" /><Text style={styles.uploadBtnText}> Upload</Text></TouchableOpacity>
        </View>

        <View style={[styles.docCard, {borderStyle:'solid', backgroundColor:'#F6FBF3'}]}>
          <View style={styles.docIcon}><Tractor size={18} color="#1B7A2E" /></View>
          <View style={{flex:1}}>
            <Text style={styles.docTitle}>Machinery Photo</Text>
            <Text style={[styles.docSub,{color:'#1B7A2E'}]}>Uploaded</Text>
          </View>
          <View style={styles.checkCircle}><Check size={14} color="#fff" strokeWidth={3} /></View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.replace('ProvideServiceSuccess')}>
          <Rocket size={18} color="#fff" />
          <Text style={styles.primaryText}> Start Service</Text>
        </TouchableOpacity>
        <Text style={styles.note}>Your registration will be completed</Text>
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
  title:{fontSize:rf(20), fontWeight:'900', color:'#111', marginTop:14},
  sub:{fontSize:rf(12), color:'#6B7280', marginTop:4},
  label:{fontSize:rf(13), fontWeight:'700', color:'#111', marginBottom:8},
  priceCard:{flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#fff', borderWidth:1, borderColor:'#F1F1F1', borderRadius:14, padding:16, marginTop:8},
  rowGap:{flexDirection:'row', alignItems:'center'},
  priceLabel:{fontSize:rf(13), color:'#111', fontWeight:'600'},
  priceValue:{fontSize:rf(15), fontWeight:'900', color:'#1B7A2E'},
  toggleRow:{flexDirection:'row', gap:12},
  toggleBtn:{flex:1, height:46, borderRadius:24, borderWidth:1, borderColor:'#E5E7EB', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8},
  toggleActive:{backgroundColor:'#1B7A2E', borderColor:'#1B7A2E'},
  radio:{width:18,height:18, borderRadius:9, borderWidth:1.5, borderColor:'#9CA3AF', alignItems:'center', justifyContent:'center'},
  radioActive:{borderColor:'#fff'}, radioDot:{width:8,height:8, borderRadius:4, backgroundColor:'#fff'},
  toggleText:{fontWeight:'700', color:'#6B7280'}, toggleTextActive:{color:'#fff'},
  docCard:{flexDirection:'row', alignItems:'center', gap:12, borderWidth:1, borderColor:'#E5E7EB', borderStyle:'dashed', borderRadius:14, padding:14, marginTop:10},
  docIcon:{width:42,height:42, borderRadius:21, backgroundColor:'#F3F4F6', alignItems:'center', justifyContent:'center'},
  docTitle:{fontSize:rf(13), fontWeight:'800', color:'#111'}, docSub:{fontSize:rf(11), color:'#6B7280'},
  uploadBtn:{backgroundColor:'#EAF6E8', paddingHorizontal:16, paddingVertical:8, borderRadius:20, flexDirection:'row', alignItems:'center'},
  uploadBtnText:{color:'#1B7A2E', fontWeight:'700', fontSize:rf(12)},
  checkCircle:{width:28,height:28, borderRadius:14, backgroundColor:'#1B7A2E', alignItems:'center', justifyContent:'center'},
  primaryBtn:{backgroundColor:'#1B7A2E', height:54, borderRadius:28, alignItems:'center', justifyContent:'center', marginTop:26, flexDirection:'row', gap:8},
  primaryText:{color:'#fff', fontSize:rf(16), fontWeight:'800'},
  note:{textAlign:'center', fontSize:rf(11), color:'#9CA3AF', marginTop:10}
});