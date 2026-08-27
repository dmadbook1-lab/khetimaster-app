import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MoreHorizontal,
  Wheat,
  MapPin,
  Mic,
  AlertTriangle,
  Star,
  Check,
  X,
  Shield,
  Play,
  Search,
  Image as ImgIcon,
  ThumbsUp,
  BadgeCheck,
} from 'lucide-react-native';

import {COLORS, rf, PAGE_PADDING} from '../../components/community/theme';
import {COMMUNITY_IMAGES} from '../../components/community/communityImages';

const WHY_AI = [
  {ok: true, text: 'Orange-brown pustules on leaf surface'},
  {ok: true, text: 'Yellow chlorotic halos around lesions'},
  {ok: true, text: 'Powdery spore dust on leaf underside'},
  {ok: true, text: 'Rapid spread from lower to upper leaves'},
  {ok: true, text: 'Cool nights (10–15°C) reported this week'},
  {ok: false, text: 'No stem or root damage observed'},
];

const SIMILAR = [
  {
    name: 'Ranjit Singh',
    loc: 'Ludhiana, Punjab',
    text: 'Same issue on my wheat last month. Propiconazole worked within a week. 3 sprays',
    likes: 34,
    avatar: COMMUNITY_IMAGES.community1,
  },
  {
    name: 'Suresh Patel',
    loc: 'Ahmedabad, Gujarat',
    text: 'Used Tilt 250EC fungicide — same active ingredient. Results were visible in 4-5 days.',
    likes: 21,
    avatar: COMMUNITY_IMAGES.community2,
  },
];

const REPLIES = [
  {
    name: 'Baldev Sharma',
    loc: 'Haryana',
    text: 'Bhai, spray karo jaldi. Maine 2 din baad kiya toh nuksan zyada ho gaya. 48 ghante mein kaam karo.',
    likes: 18,
    avatar: COMMUNITY_IMAGES.community3,
  },
  {
    name: 'Priya Reddy',
    loc: 'Telangana',
    text: 'Also make sure to remove heavily infected leaves before spraying so the fungicide works better on the rest.',
    likes: 12,
    avatar: COMMUNITY_IMAGES.community4,
  },
];

const VIDEOS = [
  {
    id: 'v1',
    title: 'Wheat Leaf Rust: Identify & Treat',
    views: '42K views',
    duration: '6:24',
    thumb: COMMUNITY_IMAGES.community5,
  },
  {
    id: 'v2',
    title: 'Fungicide Application Tips',
    views: '29K views',
    duration: '4:12',
    thumb: COMMUNITY_IMAGES.community6,
  },
];

const PRODUCTS = [
  {
    id: 'p1',
    tag: 'Best Match',
    tagColor: COLORS.DARK_GREEN,
    name: 'Tilt 250EC Fungicide',
    brand: 'Syngenta · 250ml',
    price: '420',
    img: COMMUNITY_IMAGES.community7,
  },
  {
    id: 'p2',
    tag: 'Popular',
    tagColor: COLORS.ORANGE,
    name: 'Folicur EW Fungicide',
    brand: 'Bayer · 200ml',
    price: '380',
    img: COMMUNITY_IMAGES.community8,
  },
];

export default function AIAnswerScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation?.goBack()}
          style={styles.topIconBtn}>
          <ArrowLeft size={rf(16)} color={COLORS.DARK} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>AI Answer</Text>
        <TouchableOpacity activeOpacity={0.7} style={styles.topIconBtn}>
          <MoreHorizontal size={rf(18)} color={COLORS.DARK} strokeWidth={2.3} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {/* Your Question */}
        <View style={styles.card}>
          <View style={styles.qHeader}>
            <View style={styles.yourQPill}>
              <Text style={styles.yourQText}>Your Question</Text>
            </View>
            <Text style={styles.timeAgo}>2 hrs ago</Text>
          </View>

          <View style={styles.qBody}>
            <Text style={styles.qText}>
              My wheat crop leaves are turning yellow from the edges and there
              are brown spots forming. What disease is this and how to treat
              it?
            </Text>
            <Image source={COMMUNITY_IMAGES.community4} style={styles.qImg} />
          </View>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <View style={styles.greenDot} />
              <Text style={styles.tagText}>Wheat</Text>
            </View>
            <View style={styles.tag}>
              <MapPin size={rf(10)} color={COLORS.RED} strokeWidth={2.3} />
              <Text style={styles.tagText}>Amritsar, Punjab</Text>
            </View>
            <View style={styles.tag}>
              <Mic size={rf(10)} color={COLORS.MUTED} strokeWidth={2.3} />
              <Text style={styles.tagText}>Voice</Text>
            </View>
          </View>
        </View>

        {/* AI Diagnosis */}
        <View style={styles.diagCard}>
          <View style={styles.diagTopRow}>
            <View style={{flex: 1}}>
              <View style={styles.diagLabelRow}>
                <View style={styles.diagIconBox}>
                  <AlertTriangle
                    size={rf(11)}
                    color="#FFFFFF"
                    strokeWidth={2.5}
                  />
                </View>
                <Text style={styles.diagLabel}>AI AGRONOMIST DIAGNOSIS</Text>
              </View>
              <Text style={styles.diagTitle}>
                Leaf Rust (Puccinia{'\n'}triticina)
              </Text>
            </View>
            <View style={styles.matchPill}>
              <Star size={rf(11)} color={COLORS.ORANGE} fill={COLORS.ORANGE} strokeWidth={2} />
              <Text style={styles.matchText}>92%</Text>
            </View>
          </View>

          <View style={styles.diagStatsRow}>
            <View style={styles.diagStat}>
              <Text style={styles.diagStatLabel}>Confidence</Text>
              <Text style={styles.diagStatValue}>92%</Text>
              <View style={styles.confBar}>
                <View style={[styles.confFill, {width: '92%'}]} />
              </View>
            </View>
            <View style={styles.diagStatDivider} />
            <View style={styles.diagStat}>
              <Text style={styles.diagStatLabel}>Severity</Text>
              <Text style={styles.diagStatValue}>High</Text>
              <View style={styles.severityRow}>
                {[1, 1, 1, 0].map((s, i) => (
                  <View
                    key={i}
                    style={[
                      styles.severityDot,
                      {backgroundColor: s ? '#FFFFFF' : 'rgba(255,255,255,0.35)'},
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={styles.diagStatDivider} />
            <View style={styles.diagStat}>
              <Text style={styles.diagStatLabel}>Urgency</Text>
              <Text style={styles.diagStatValue}>Act Now</Text>
              <View style={styles.urgencyRow}>
                <View style={styles.urgencyDot} />
                <Text style={styles.urgencyText}>Critical</Text>
              </View>
            </View>
          </View>

          <View style={styles.diagFootBox}>
            <Text style={styles.diagFootText}>
              Fungal infection spreading fast in cool, humid conditions. Treat
              within 48–72 hours to prevent 30–40% yield loss.
            </Text>
          </View>
        </View>

        {/* Why AI Thinks This */}
        <View style={styles.card}>
          <View style={styles.sectionHeadRow}>
            <View style={styles.penIconBox}>
              <Text style={{fontSize: rf(11)}}>✏️</Text>
            </View>
            <Text style={styles.sectionHead}>Why AI Thinks This</Text>
          </View>

          {WHY_AI.map((w, i) => (
            <View key={i} style={styles.whyRow}>
              <View
                style={[
                  styles.whyIcon,
                  {backgroundColor: w.ok ? '#EAFBF0' : '#F1F5F9'},
                ]}>
                {w.ok ? (
                  <Check size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={3} />
                ) : (
                  <X size={rf(11)} color={COLORS.MUTED} strokeWidth={2.5} />
                )}
              </View>
              <Text
                style={[styles.whyText, !w.ok && {color: COLORS.MUTED}]}>
                {w.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Recommended Action */}
        <View style={styles.card}>
          <View style={styles.recTopRow}>
            <View style={styles.recTitleWrap}>
              <View style={styles.recIconBox}>
                <Shield size={rf(13)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
              </View>
              <Text style={styles.recTitle}>Recommended Action</Text>
            </View>
            <View style={styles.urgentPill}>
              <Text style={styles.urgentPillText}>URGENT</Text>
            </View>
          </View>

          <Text style={styles.recLabelSmall}>TREATMENT</Text>
          <Text style={styles.recName}>
            Propiconazole 25% EC Fungicide Spray
          </Text>
          <Text style={styles.recDesc}>
            Systemic fungicide — absorbs into plant tissue for lasting
            protection
          </Text>

          <View style={styles.dosageRow}>
            <View style={styles.dosageBox}>
              <Text style={styles.dosageLabel}>DOSAGE</Text>
              <Text style={styles.dosageVal}>1 ml / Litre</Text>
              <Text style={styles.dosageSub}>200–250 L water/acre</Text>
            </View>
            <View style={styles.dosageBox}>
              <Text style={styles.dosageLabel}>TIME TO APPLY</Text>
              <Text style={styles.dosageVal}>Early Morning</Text>
              <Text style={styles.dosageSub}>Within next 48 hours</Text>
            </View>
          </View>

          <View style={styles.repeatBox}>
            <Text style={styles.repeatIcon}>ⓘ</Text>
            <Text style={styles.repeatText}>
              Repeat spray after 10–14 days if infection persists. Avoid
              spraying during rain or strong winds.
            </Text>
          </View>

          <View style={styles.recBtnRow}>
            <TouchableOpacity activeOpacity={0.85} style={styles.viewAdvBtn}>
              <Text style={styles.viewAdvText}>View Advisory</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} style={styles.buyBtn}>
              <Text style={styles.buyBtnText}>Buy Product</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Similar Cases */}
        <View style={styles.sectionSpaceHead}>
          <Text style={styles.sectionTitleH1}>Similar Cases</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {SIMILAR.map((s, i) => (
          <View key={i} style={styles.simCard}>
            <View style={styles.simHead}>
              <Image source={s.avatar} style={styles.avatar} />
              <View style={{flex: 1}}>
                <View style={styles.simNameRow}>
                  <Text style={styles.simName}>{s.name}</Text>
                  <View style={styles.solvedPill}>
                    <Check size={rf(9)} color={COLORS.DARK_GREEN} strokeWidth={3} />
                    <Text style={styles.solvedText}>Solved</Text>
                  </View>
                </View>
                <Text style={styles.simLoc}>{s.loc}</Text>
              </View>
              <View style={styles.likesRow}>
                <ThumbsUp size={rf(11)} color={COLORS.MUTED} strokeWidth={2.3} />
                <Text style={styles.likesText}>{s.likes}</Text>
              </View>
            </View>
            <Text style={styles.simText}>{s.text}</Text>
          </View>
        ))}

        {/* Verified Expert Answer */}
        <View style={styles.expertCard}>
          <View style={styles.expertHeaderRow}>
            <View style={styles.verifiedRow}>
              <BadgeCheck size={rf(13)} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
              <Text style={styles.verifiedText}>Verified Expert Answer</Text>
            </View>
            <View style={styles.expertPill}>
              <Star size={rf(9)} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
              <Text style={styles.expertPillText}>Expert</Text>
            </View>
          </View>

          <View style={styles.expertBodyHead}>
            <Image source={COMMUNITY_IMAGES.community7} style={styles.expertAvatar} />
            <View style={{flex: 1}}>
              <Text style={styles.expertName}>Dr. Amarjeet Kaur</Text>
              <Text style={styles.expertRole}>
                Plant Pathologist · Punjab Agricultural University
              </Text>
            </View>
          </View>

          <Text style={styles.expertPara}>
            This is a classic case of wheat leaf rust, caused by Puccinia
            triticina. The pustules you see are fungal spores that spread
            rapidly under moist, cool conditions.
          </Text>
          <Text style={styles.expertPara}>
            Immediate application of Propiconazole or Tebuconazole-based
            fungicide is essential. Ensure proper coverage of the underside of
            leaves where spore masses accumulate.
          </Text>

          <View style={styles.expertFooter}>
            <ThumbsUp size={rf(11)} color={COLORS.MUTED} strokeWidth={2.3} />
            <Text style={styles.helpfulText}>
              147 farmers found this helpful
            </Text>
          </View>
        </View>

        {/* Community Replies */}
        <View style={styles.sectionSpaceHead}>
          <Text style={styles.sectionTitleH1}>Community Replies</Text>
          <Text style={styles.repliesCount}>24 replies</Text>
        </View>

        {REPLIES.map((r, i) => (
          <View key={i} style={styles.replyCard}>
            <View style={styles.replyHead}>
              <Image source={r.avatar} style={styles.avatarSm} />
              <View style={{flex: 1}}>
                <Text style={styles.replyName}>{r.name}</Text>
                <Text style={styles.replyLoc}>{r.loc}</Text>
              </View>
              <View style={styles.likesRow}>
                <ThumbsUp size={rf(11)} color={COLORS.MUTED} strokeWidth={2.3} />
                <Text style={styles.likesText}>{r.likes}</Text>
              </View>
            </View>
            <Text style={styles.replyText}>{r.text}</Text>
          </View>
        ))}

        {/* Related Videos */}
        <View style={styles.sectionSpaceHead}>
          <Text style={styles.sectionTitleH1}>Related Videos</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vidRow}>
          {VIDEOS.map(v => (
            <TouchableOpacity key={v.id} activeOpacity={0.9} style={styles.vidCard}>
              <View style={styles.vidThumbWrap}>
                <Image source={v.thumb} style={styles.vidThumb} />
                <View style={styles.vidPlayCircle}>
                  <Play size={rf(15)} color={COLORS.DARK_GREEN} fill={COLORS.DARK_GREEN} strokeWidth={2} />
                </View>
                <View style={styles.vidDurationPill}>
                  <Text style={styles.vidDurationText}>{v.duration}</Text>
                </View>
              </View>
              <Text style={styles.vidTitle} numberOfLines={1}>{v.title}</Text>
              <Text style={styles.vidViews}>{v.views}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* From Bazaar */}
        <View style={styles.sectionSpaceHead}>
          <View style={styles.bazaarTitleRow}>
            <Text style={styles.sectionTitleH1}>From Bazaar</Text>
            <View style={styles.shopPill}>
              <Text style={styles.shopPillText}>Shop</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productRow}>
          {PRODUCTS.map(p => (
            <View key={p.id} style={styles.productCard}>
              <View style={styles.productImgWrap}>
                <Image source={p.img} style={styles.productImg} />
                <View
                  style={[
                    styles.productTag,
                    {backgroundColor: p.tagColor},
                  ]}>
                  <Text style={styles.productTagText}>{p.tag}</Text>
                </View>
              </View>
              <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
              <Text style={styles.productBrand}>{p.brand}</Text>
              <View style={styles.productBottomRow}>
                <Text style={styles.productPrice}>₹{p.price}</Text>
                <TouchableOpacity activeOpacity={0.9} style={styles.addBtn}>
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Follow-up Input */}
      <View style={styles.followUpWrap}>
        <View style={styles.followUpBox}>
          <Search size={rf(13)} color={COLORS.MUTED} strokeWidth={2.3} />
          <TextInput
            placeholder="Ask a follow-up question..."
            placeholderTextColor={COLORS.MUTED}
            style={styles.followUpInput}
          />
          <TouchableOpacity activeOpacity={0.7} style={styles.followUpIcon}>
            <Mic size={rf(13)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles.followUpIcon}>
            <ImgIcon size={rf(13)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},

  // Top bar
  topBar: {
    height: 52,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},

  scroll: {
    padding: PAGE_PADDING,
    paddingBottom: 100,
    backgroundColor: COLORS.PAGE_BG,
    gap: 14,
  },

  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },

  // Your Question
  qHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  yourQPill: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAFBF0',
    justifyContent: 'center',
  },
  yourQText: {fontSize: rf(10), fontWeight: '900', color: COLORS.DARK_GREEN},
  timeAgo: {fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},

  qBody: {marginTop: 10, flexDirection: 'row', gap: 10},
  qText: {
    flex: 1,
    fontSize: rf(12),
    lineHeight: rf(17),
    fontWeight: '600',
    color: COLORS.DARK,
  },
  qImg: {width: 62, height: 62, borderRadius: 8, backgroundColor: '#F1F5F9'},

  tagRow: {marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  tag: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {fontSize: rf(10), fontWeight: '700', color: COLORS.DARK},
  greenDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.DARK_GREEN},

  // AI Diagnosis (dark green)
  diagCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: COLORS.DARK_GREEN,
  },
  diagTopRow: {flexDirection: 'row', gap: 10},
  diagLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  diagIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagLabel: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  diagTitle: {
    marginTop: 8,
    fontSize: rf(18),
    lineHeight: rf(22),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  matchPill: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchText: {fontSize: rf(11), fontWeight: '900', color: '#FFFFFF'},

  diagStatsRow: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  diagStat: {flex: 1, gap: 4},
  diagStatDivider: {width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 8},
  diagStatLabel: {fontSize: rf(9.5), fontWeight: '600', color: 'rgba(255,255,255,0.75)'},
  diagStatValue: {fontSize: rf(14), fontWeight: '900', color: '#FFFFFF'},
  confBar: {
    marginTop: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  confFill: {height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2},
  severityRow: {flexDirection: 'row', gap: 3, marginTop: 4},
  severityDot: {width: 12, height: 4, borderRadius: 2},
  urgencyRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4},
  urgencyDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.ORANGE},
  urgencyText: {fontSize: rf(9.5), fontWeight: '700', color: 'rgba(255,255,255,0.85)'},

  diagFootBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  diagFootText: {
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
  },

  // Why AI
  sectionHeadRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12},
  penIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHead: {fontSize: rf(13.5), fontWeight: '900', color: COLORS.DARK},
  whyRow: {marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10},
  whyIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyText: {flex: 1, fontSize: rf(11.5), lineHeight: rf(16), fontWeight: '500', color: COLORS.DARK},

  // Recommended Action
  recTopRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  recTitleWrap: {flexDirection: 'row', alignItems: 'center', gap: 8},
  recIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitle: {fontSize: rf(13.5), fontWeight: '900', color: COLORS.DARK},
  urgentPill: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
  },
  urgentPillText: {fontSize: rf(9), fontWeight: '900', color: COLORS.ORANGE, letterSpacing: 0.5},

  recLabelSmall: {
    marginTop: 14,
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
  },
  recName: {marginTop: 4, fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  recDesc: {
    marginTop: 4,
    fontSize: rf(11),
    lineHeight: rf(15),
    fontWeight: '500',
    color: COLORS.MUTED,
  },

  dosageRow: {marginTop: 12, flexDirection: 'row', gap: 10},
  dosageBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dosageLabel: {fontSize: rf(9), fontWeight: '900', color: COLORS.MUTED, letterSpacing: 0.5},
  dosageVal: {marginTop: 4, fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  dosageSub: {marginTop: 2, fontSize: rf(9.5), fontWeight: '500', color: COLORS.MUTED},

  repeatBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#EAFBF0',
    borderWidth: 1,
    borderColor: '#BBF0CC',
    flexDirection: 'row',
    gap: 6,
  },
  repeatIcon: {fontSize: rf(12), color: COLORS.DARK_GREEN},
  repeatText: {flex: 1, fontSize: rf(10.5), lineHeight: rf(15), fontWeight: '500', color: COLORS.DARK},

  recBtnRow: {marginTop: 12, flexDirection: 'row', gap: 10},
  viewAdvBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAdvText: {fontSize: rf(11.5), fontWeight: '900', color: COLORS.DARK_GREEN},
  buyBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.DARK_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: {fontSize: rf(11.5), fontWeight: '900', color: '#FFFFFF'},

  // Section headers between cards
  sectionSpaceHead: {
    marginTop: 4,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleH1: {fontSize: rf(15), fontWeight: '900', color: COLORS.DARK},
  seeAll: {fontSize: rf(11), fontWeight: '900', color: COLORS.DARK_GREEN},
  repliesCount: {fontSize: rf(11), fontWeight: '700', color: COLORS.MUTED},

  // Similar Cases
  simCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  simHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  avatar: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9'},
  simNameRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  simName: {fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},
  solvedPill: {
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  solvedText: {fontSize: rf(8.5), fontWeight: '900', color: COLORS.DARK_GREEN},
  simLoc: {marginTop: 2, fontSize: rf(9.5), fontWeight: '500', color: COLORS.MUTED},
  likesRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  likesText: {fontSize: rf(11), fontWeight: '700', color: COLORS.MUTED},
  simText: {
    marginTop: 10,
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: COLORS.DARK,
  },

  // Expert Card
  expertCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F0FBF3',
    borderWidth: 1,
    borderColor: '#BBF0CC',
  },
  expertHeaderRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  verifiedRow: {flexDirection: 'row', alignItems: 'center', gap: 5},
  verifiedText: {fontSize: rf(11.5), fontWeight: '900', color: COLORS.DARK},
  expertPill: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  expertPillText: {fontSize: rf(9.5), fontWeight: '900', color: '#FFFFFF'},
  expertBodyHead: {marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10},
  expertAvatar: {width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9'},
  expertName: {fontSize: rf(13), fontWeight: '900', color: COLORS.DARK},
  expertRole: {marginTop: 2, fontSize: rf(10), fontWeight: '600', color: COLORS.MUTED},
  expertPara: {
    marginTop: 12,
    fontSize: rf(11.5),
    lineHeight: rf(16.5),
    fontWeight: '500',
    color: COLORS.DARK,
  },
  expertFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#C9EED6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {fontSize: rf(10.5), fontWeight: '700', color: COLORS.MUTED},

  // Replies
  replyCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  replyHead: {flexDirection: 'row', alignItems: 'center', gap: 10},
  avatarSm: {width: 34, height: 34, borderRadius: 17, backgroundColor: '#F1F5F9'},
  replyName: {fontSize: rf(11.5), fontWeight: '900', color: COLORS.DARK},
  replyLoc: {marginTop: 1, fontSize: rf(9.5), fontWeight: '500', color: COLORS.MUTED},
  replyText: {
    marginTop: 10,
    fontSize: rf(11),
    lineHeight: rf(15.5),
    fontWeight: '500',
    color: COLORS.DARK,
  },

  // Videos
  vidRow: {gap: 10, paddingRight: 8},
  vidCard: {width: 200},
  vidThumbWrap: {position: 'relative', borderRadius: 12, overflow: 'hidden'},
  vidThumb: {width: '100%', height: 120, backgroundColor: '#0F172A'},
  vidPlayCircle: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vidDurationPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
  vidDurationText: {fontSize: rf(9), fontWeight: '800', color: '#FFFFFF'},
  vidTitle: {marginTop: 8, fontSize: rf(11.5), fontWeight: '900', color: COLORS.DARK},
  vidViews: {marginTop: 3, fontSize: rf(10), fontWeight: '500', color: COLORS.MUTED},

  // Bazaar
  bazaarTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  shopPill: {
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  shopPillText: {fontSize: rf(9), fontWeight: '900', color: COLORS.MUTED},

  productRow: {flexDirection: 'row', gap: 10},
  productCard: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  productImgWrap: {position: 'relative', borderRadius: 10, overflow: 'hidden'},
  productImg: {width: '100%', height: 110, backgroundColor: '#F8FAFC'},
  productTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 4,
    justifyContent: 'center',
  },
  productTagText: {fontSize: rf(9), fontWeight: '900', color: '#FFFFFF'},
  productName: {marginTop: 8, fontSize: rf(12), fontWeight: '900', color: COLORS.DARK},
  productBrand: {marginTop: 2, fontSize: rf(9.5), fontWeight: '500', color: COLORS.MUTED},
  productBottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {fontSize: rf(14), fontWeight: '900', color: COLORS.DARK},
  addBtn: {
    height: 28,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.DARK_GREEN,
    justifyContent: 'center',
  },
  addBtnText: {fontSize: rf(10.5), fontWeight: '900', color: '#FFFFFF'},

  // Follow-up Input
  followUpWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: PAGE_PADDING,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  followUpBox: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followUpInput: {
    flex: 1,
    fontSize: rf(12),
    color: COLORS.DARK,
    padding: 0,
  },
  followUpIcon: {padding: 4},
});