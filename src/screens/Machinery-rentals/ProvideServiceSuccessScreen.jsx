import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Phone, Tractor, PartyPopper } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const rf = s => Math.max(s-2, Math.min(s*width/390, s+2));

export default function ProvideServiceSuccessScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top','bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image source={require('../../assets/machinery/provide-hero-success.png')} style={styles.hero} resizeMode="cover" />
          <View style={styles.checkBadge}><Check size={22} color="#fff" strokeWidth={3.5} /></View>
        </View>

        <View style={styles.partyWrap}><PartyPopper size={22} color="#F59E0B" /></View>
        <Text style={styles.title}>Service Started!</Text>
        <Text style={styles.sub}>Your machinery is now{'\n'}visible to nearby farmers.</Text>

        <View style={styles.infoCard}>
          <View style={styles.phoneIcon}><Phone size={20} color="#1B7A2E" /></View>
          <View>
            <Text style={styles.infoTitle}>On Booking</Text>
            <Text style={styles.infoSub}>You will get phone & app{'\n'}notification.</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.smallCard, {backgroundColor:'#1B7A2E'}]}>
            <View style={styles.activeRow}><View style={styles.whiteDot} /><Text style={styles.activeText}> Active</Text></View>
            <Text style={styles.liveText}>Service{'\n'}Live</Text>
          </View>
          <TouchableOpacity activeOpacity={0.9} style={styles.smallCard} onPress={() => navigation.navigate('TractorBooking')}>
            <View style={styles.tractorCircle}><Tractor size={18} color="#1B7A2E" /></View>
            <Text style={styles.cardTitle}>My Machinery</Text>
            <Text style={styles.cardLink}>View Listing →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.primaryText}>Go to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TractorBooking')} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>My Machinery</Text>
        </TouchableOpacity>
        <View style={{height:50}} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe:{flex:1, backgroundColor:'#fff'},
  content:{paddingHorizontal:16, paddingBottom:48, paddingTop:10},
  heroWrap:{alignItems:'center'},
  hero:{width:'100%', height:280, borderRadius:20, backgroundColor:'#EAF1DC'},
  checkBadge:{width:52,height:52, borderRadius:26, backgroundColor:'#1B7A2E', alignItems:'center', justifyContent:'center', marginTop:-26, borderWidth:4, borderColor:'#fff', elevation:6, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:8},
  partyWrap:{alignItems:'center', marginTop:12},
  title:{textAlign:'center', fontSize:rf(24), fontWeight:'900', color:'#111', marginTop:6},
  sub:{textAlign:'center', fontSize:rf(13), color:'#6B7280', marginTop:8, lineHeight:18},
  infoCard:{flexDirection:'row', gap:12, backgroundColor:'#fff', borderWidth:1, borderColor:'#F1F1F1', borderRadius:16, padding:16, marginTop:20, alignItems:'center'},
  phoneIcon:{width:48,height:48, borderRadius:24, backgroundColor:'#EAF6E8', alignItems:'center', justifyContent:'center'},
  infoTitle:{fontSize:rf(14), fontWeight:'800', color:'#111'},
  infoSub:{fontSize:rf(12), color:'#6B7280', marginTop:2, lineHeight:16},
  row:{flexDirection:'row', gap:12, marginTop:14},
  smallCard:{flex:1, borderRadius:16, padding:16, borderWidth:1, borderColor:'#F1F1F1', backgroundColor:'#fff', minHeight:110},
  activeRow:{flexDirection:'row', alignItems:'center'},
  whiteDot:{width:8,height:8, borderRadius:4, backgroundColor:'#fff'},
  activeText:{color:'#fff', fontSize:rf(12), fontWeight:'700'},
  liveText:{color:'#fff', fontSize:rf(18), fontWeight:'900', marginTop:10, lineHeight:22},
  tractorCircle:{width:36,height:36, borderRadius:18, backgroundColor:'#EAF6E8', alignItems:'center', justifyContent:'center'},
  cardTitle:{fontSize:rf(13), fontWeight:'800', color:'#111', marginTop:8},
  cardLink:{fontSize:rf(12), color:'#1B7A2E', fontWeight:'700', marginTop:4},
  primaryBtn:{backgroundColor:'#1B7A2E', height:54, borderRadius:28, alignItems:'center', justifyContent:'center', marginTop:22},
  primaryText:{color:'#fff', fontSize:rf(16), fontWeight:'800'},
  secondaryBtn:{alignItems:'center', marginTop:14, paddingVertical:8},
  secondaryText:{color:'#1B7A2E', fontWeight:'700', textDecorationLine:'underline'}
});