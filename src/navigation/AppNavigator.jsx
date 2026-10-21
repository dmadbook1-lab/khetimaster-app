import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/main/SplashScreen';
import OnboardingScreen from '../screens/main/OnboardingScreen';
import LanguageScreen from '../screens/main/LanguageScreen';
import LoginScreen from '../screens/login/LoginScreen';
import OtpScreen from '../screens/login/OtpScreen';
import HomeScreen from '../screens/main/HomeScreen';
import SidebarScreen from '../screens/main/SidebarScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import BazaarScreen from '../screens/main/BazaarScreen';
import FarmDetailsScreen from '../screens/main/FarmDetailsScreen';
import MyFarmsScreen from '../screens/myfarm/MyFarmsScreen';
import FarmOverviewScreen from '../screens/myfarm/FarmOverviewScreen';
import SatelliteViewScreen from '../screens/myfarm/SatelliteViewScreen';
import AgriProductsScreen from '../screens/agriproducts/AgriProductsScreen';
import ProductDetailsScreen from '../screens/agriproducts/ProductDetailsScreen';
import CartScreen from '../screens/agriproducts/CartScreen';
import CheckoutScreen from '../screens/agriproducts/CheckoutScreen';
import OrderSuccessScreen from '../screens/agriproducts/OrderSuccessScreen';
import OrderDetailsScreen from '../screens/agriproducts/OrderDetailsScreen';
import ConfirmMachineryBookingScreen from '../screens/Machinery-rentals/ConfirmMachineryBookingScreen';
import MachineryBookingSuccessScreen from '../screens/Machinery-rentals/MachineryBookingSuccessScreen';
import MachineryRentalProfileScreen from '../screens/Machinery-rentals/MachineryRentalProfileScreen';
import MachineryLiveTrackingScreen from '../screens/Machinery-rentals/MachineryLiveTrackingScreen';
import TractorBookingScreen from '../screens/Machinery-rentals/TractorBookingScreen';
import LabourBookingScreen from '../screens/labourbooking/LabourBookingScreen';
import MachineryDetailsScreen from '../screens/Machinery-rentals/MachineryDetailsScreen';
import MachineryBookingScreen from '../screens/Machinery-rentals/MachineryBookingScreen';
import DroneServicesScreen from '../screens/drone/DroneServicesScreen';
import DroneServiceDetailsScreen from '../screens/drone/DroneServiceDetailsScreen';
import BookDroneServiceScreen from '../screens/drone/BookDroneServiceScreen';
import ConfirmDroneBookingScreen from '../screens/drone/ConfirmDroneBookingScreen';
import DroneBookingSuccessScreen from '../screens/drone/DroneBookingSuccessScreen';
import ProvideServiceStep1Screen from '../screens/Machinery-rentals/ProvideServiceStep1Screen';
import ProvideServiceStep2Screen from '../screens/Machinery-rentals/ProvideServiceStep2Screen';
import ProvideServiceStep3Screen from '../screens/Machinery-rentals/ProvideServiceStep3Screen';
import ProvideServiceStep4Screen from '../screens/Machinery-rentals/ProvideServiceStep4Screen';
import MachineryMyBookingsScreen from '../screens/Machinery-rentals/MachineryMyBookingsScreen';
import MachineryRequestsScreen from '../screens/Machinery-rentals/MachineryRequestsScreen';
import ProvideServiceSuccessScreen from '../screens/Machinery-rentals/ProvideServiceSuccessScreen';
import ProfileSetupScreen from '../screens/addfarm/ProfileSetupScreen';
import ProfileFarmScreen from '../screens/addfarm/ProfileFarmScreen';
import AddFarmDetailsScreen from '../screens/addfarm/FarmDetailsScreen';
import FarmMappingScreen from '../screens/addfarm/FarmMappingScreen';
import Mapscreen from '../screens/addfarm/MapYourFarmScreen';
import Farmsuccess from '../screens/addfarm/FarmSuccessScreen';
import WalkAroundScreen from '../screens/addfarm/WalkAroundScreen';
import WalkAroundTrackingScreen from '../screens/addfarm/WalkAroundTrackingScreen';
import ReviewFarmScreen from '../screens/addfarm/ReviewFarmBoundaryScreen';
import SmartFarmScreen from '../screens/addfarm/FarmSmartSuccessScreen';
import AIGuruScreen from '../screens/main/AIGuruScreen';
import AgricultureNewsScreen from '../screens/knowledge/AgricultureNewsScreen';
import ArticleDetailsScreen from '../screens/knowledge/ArticleDetailsScreen';
import DiseaseDetectionScreen from '../screens/disease-detection/DiseaseDetectionScreen';
import UploadCropPhotoScreen from '../screens/disease-detection/UploadCropPhotoScreen';
import AIDetectionScreen from '../screens/disease-detection/AIDetectionScreen';
import AIDiagnosisScreen from '../screens/disease-detection/AIDiagnosisScreen';
import DiseaseInformationScreen from '../screens/disease-detection/DiseaseInformationScreen';
import WeatherScreen from '../screens/weather/WeatherScreen';
import SevenDayForecastScreen from '../screens/weather/SevenDayForecastScreen';
import HourlyForecastScreen from '../screens/weather/HourlyForecastScreen';
import RainfallDetailsScreen from '../screens/weather/RainfallDetailsScreen';
import AIWeatherInsightsScreen from '../screens/weather/AIWeatherInsightsScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import VideosScreen from '../screens/community/VideosScreen';
import QuestionsScreen from '../screens/community/QuestionsScreen';
import ExpertsScreen from '../screens/community/ExpertsScreen';
import DiseaseScreen from '../screens/community/DiseaseScreen';
import AskWithPhotoScreen from '../screens/community/AskWithPhotoScreen';
import AskQuestionScreen from '../screens/community/AskQuestionScreen';
import AskByVoiceScreen from '../screens/community/AskByVoiceScreen';
import AIAnswerScreen from '../screens/community/AIAnswerScreen';
import MandiRatesScreen from '../screens/mandi/MandiRatesScreen';
import TodaysPricesScreen from '../screens/mandi/TodaysPricesScreen';
import NearbyMarketsScreen from '../screens/mandi/NearbyMarketsScreen';
import PriceTrendsScreen from '../screens/mandi/PriceTrendsScreen';
import PriceAlertsScreen from '../screens/mandi/PriceAlertsScreen';
import MarketUpdatesScreen from '../screens/mandi/MarketUpdatesScreen';
import CommodityDetailScreen from '../screens/mandi/CommodityDetailScreen';
import { MANDI_ROUTES } from '../constants/mandiRoutes';
import DistrictWiseRatesScreen from '../screens/mandi/DistrictWiseRatesScreen';
import WorkerDetailsScreen from '../screens/labourbooking/WorkerDetailsScreen';
import LabourBookingDetailsScreen from '../screens/labourbooking/LabourBookingDetailsScreen';
import ConfirmLabourBookingScreen from '../screens/labourbooking/ConfirmLabourBookingScreen';
import LabourBookingSuccessScreen from '../screens/labourbooking/LabourBookingSuccessScreen';
import LabourRequestsScreen from '../screens/labourbooking/LabourRequestsScreen';
import FindWorkStep1Screen from '../screens/labourbooking/FindWorkStep1Screen';
import FindWorkStep2Screen from '../screens/labourbooking/FindWorkStep2Screen';
import FindWorkStep3Screen from '../screens/labourbooking/FindWorkStep3Screen';
import FindWorkStep4Screen from '../screens/labourbooking/FindWorkStep4Screen';
import FindWorkSuccessScreen from '../screens/labourbooking/FindWorkSuccessScreen';
import LabourProfileScreen from '../screens/labourbooking/LabourProfileScreen';
import MyBookingsScreen from '../screens/labourbooking/MyBookingsScreen';
import GovernmentSchemesScreen from '../screens/gov/GovernmentSchemesScreen';
import LatestSchemesScreen from '../screens/gov/LatestSchemesScreen';
import DoctorMainScreen from '../screens/Doctor/DoctorMainScreen';
import DoctorsScreen from '../screens/Doctor/DoctorsScreen';
import DoctorRegistrationScreen from '../screens/Doctor/DoctorRegistrationScreen';
import DoctorRegistrationDetailsScreen from '../screens/Doctor/DoctorRegistrationDetailsScreen';
import DoctorDetailsScreen from '../screens/Doctor/DoctorDetailsScreen';
import DoctorConsultationScreen from '../screens/Doctor/DoctorConsultationScreen';
import DoctorConsultationDetailsScreen from '../screens/Doctor/DoctorConsultationDetailsScreen';
import DoctorRequestsScreen from '../screens/Doctor/DoctorRequestsScreen';
import DoctorRequestDetailsScreen from '../screens/Doctor/DoctorRequestDetailsScreen';
import DoctorEditProfileScreen from '../screens/Doctor/DoctorEditProfileScreen';
import MyDoctorProfileScreen from '../screens/Doctor/MyDoctorProfileScreen';
import MyConsultationsScreen from '../screens/Doctor/MyConsultationsScreen';
import NurseryHomeScreen from '../screens/Nursery/NurseryHomeScreen';
import NurseryPlantDetailsScreen from '../screens/Nursery/NurseryPlantDetailsScreen';
import NurseryCartScreen from '../screens/Nursery/NurseryCartScreen';
import NurseryCheckoutScreen from '../screens/Nursery/NurseryCheckoutScreen';
import NurseryOrdersScreen from '../screens/Nursery/NurseryOrdersScreen';
import NurseryOrderDetailsScreen from '../screens/Nursery/NurseryOrderDetailsScreen';
import SellPlantScreen from '../screens/Nursery/SellPlantScreen';
import MyNurseryListingsScreen from '../screens/Nursery/MyNurseryListingsScreen';
const Stack = createNativeStackNavigator();
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
  },
};
export default function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'ios_from_right',
          animationDuration: 180,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: {
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        {/* Route names: Splash, Onboarding, language, Login, Otp */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        <Stack.Screen name="language" component={LanguageScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />

        {/* Route names: Home, MyFarms, AIGuru, AgricultureNews, ArticleDetails, Bazaar, Profile, LabourProfile */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MyFarms" component={MyFarmsScreen} />

        <Stack.Screen
          name="AIGuru"
          component={AIGuruScreen}
          options={{
            animation: 'slide_from_bottom',
            animationDuration: 280,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />

        <Stack.Screen
          name="AgricultureNews"
          component={AgricultureNewsScreen}
        />
        <Stack.Screen
          name="ArticleDetails"
          component={ArticleDetailsScreen}
        />

        <Stack.Screen name="Bazaar" component={BazaarScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="LabourProfile" component={LabourProfileScreen} />

        {/* Route name: Sidebar */}
        <Stack.Screen
          name="Sidebar"
          component={SidebarScreen}
          options={{
            animation: 'slide_from_left',
            animationDuration: 260,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />

        {/* Route names: FarmOverview, SatelliteView, FarmDetailsScreen, FarmDetails */}
        <Stack.Screen name="FarmOverview" component={FarmOverviewScreen} />
        <Stack.Screen name="SatelliteView" component={SatelliteViewScreen} />
        <Stack.Screen name="FarmDetailsScreen" component={FarmDetailsScreen} />
        <Stack.Screen name="FarmDetails" component={AddFarmDetailsScreen} />

        {/* Route names: AgriProducts, ProductDetails, Cart, Checkout, OrderSuccess, OrderDetails */}
        <Stack.Screen name="AgriProducts" component={AgriProductsScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />

        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccessScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />

        {/* Route names: ProfileSetup, ProfileFarm, FarmMappingScreen, Mapscreen, Farmsuccess, walkaroundscreen, WalkAroundTrackingScreen, ReviewFarmScreen, SmartFarmScreen */}
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="ProfileFarm" component={ProfileFarmScreen} />
        <Stack.Screen name="FarmMappingScreen" component={FarmMappingScreen} />
        <Stack.Screen name="Mapscreen" component={Mapscreen} />
        <Stack.Screen name="Farmsuccess" component={Farmsuccess} />

        {/* walkaround screen */}
        <Stack.Screen name="walkaroundscreen" component={WalkAroundScreen} />
        <Stack.Screen
          name="WalkAroundTrackingScreen"
          component={WalkAroundTrackingScreen}
        />
        <Stack.Screen name="ReviewFarmScreen" component={ReviewFarmScreen} />
        <Stack.Screen name="SmartFarmScreen" component={SmartFarmScreen} />

        {/* Route names: TractorBooking, MachineryRentalProfile, LabourBooking, MachineryDetails, MachineryBooking, ConfirmMachineryBooking, MachineryBookingSuccess, MachineryMyBookings, MachineryRequests, MachineryLiveTracking */}
        <Stack.Screen name="TractorBooking" component={TractorBookingScreen} />
        <Stack.Screen
          name="MachineryRentalProfile"
          component={MachineryRentalProfileScreen}
        />

        <Stack.Screen name="LabourBooking" component={LabourBookingScreen} />
        <Stack.Screen
          name="MachineryDetails"
          component={MachineryDetailsScreen}
        />
        <Stack.Screen
          name="MachineryBooking"
          component={MachineryBookingScreen}
        />
        <Stack.Screen
          name="ConfirmMachineryBooking"
          component={ConfirmMachineryBookingScreen}
        />

        <Stack.Screen
          name="MachineryBookingSuccess"
          component={MachineryBookingSuccessScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="MachineryMyBookings"
          component={MachineryMyBookingsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MachineryRequests"
          component={MachineryRequestsScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="MachineryLiveTracking"
          component={MachineryLiveTrackingScreen}
        />

        {/* Route names: DiseaseDetection, UploadCropPhoto, AIDetection, AIDiagnosis, DiseaseInformation */}
        <Stack.Screen
          name="DiseaseDetection"
          component={DiseaseDetectionScreen}
        />
        <Stack.Screen
          name="UploadCropPhoto"
          component={UploadCropPhotoScreen}
        />

        <Stack.Screen
          name="AIDetection"
          component={AIDetectionScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="AIDiagnosis"
          component={AIDiagnosisScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="DiseaseInformation"
          component={DiseaseInformationScreen}
        />

        {/* Route names: Weather, SevenDayForecast, HourlyForecast, RainfallDetails, AIWeatherInsights */}
        <Stack.Screen name="Weather" component={WeatherScreen} />
        <Stack.Screen
          name="SevenDayForecast"
          component={SevenDayForecastScreen}
        />
        <Stack.Screen name="HourlyForecast" component={HourlyForecastScreen} />
        <Stack.Screen
          name="RainfallDetails"
          component={RainfallDetailsScreen}
        />
        <Stack.Screen
          name="AIWeatherInsights"
          component={AIWeatherInsightsScreen}
        />

        {/* Route names: Community, Videos, Questions, Experts, Disease, AskWithPhoto, AskQuestion, AskByVoice, AIAnswer */}
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="Videos" component={VideosScreen} />
        <Stack.Screen name="Questions" component={QuestionsScreen} />
        <Stack.Screen name="Experts" component={ExpertsScreen} />
        <Stack.Screen name="Disease" component={DiseaseScreen} />

        <Stack.Screen
          name="AskWithPhoto"
          component={AskWithPhotoScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AskQuestion"
          component={AskQuestionScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AskByVoice"
          component={AskByVoiceScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AIAnswer"
          component={AIAnswerScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Route names: MandiHome, TodaysPrices, NearbyMarkets, PriceTrends, PriceAlerts, MarketUpdates, CommodityDetail, DistrictWiseRates */}
        <Stack.Screen
          name={MANDI_ROUTES.HOME}
          component={MandiRatesScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={MANDI_ROUTES.TODAYS_PRICES}
          component={TodaysPricesScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={MANDI_ROUTES.NEARBY_MARKETS}
          component={NearbyMarketsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={MANDI_ROUTES.PRICE_TRENDS}
          component={PriceTrendsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={MANDI_ROUTES.PRICE_ALERTS}
          component={PriceAlertsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={MANDI_ROUTES.MARKET_UPDATES}
          component={MarketUpdatesScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={MANDI_ROUTES.COMMODITY_DETAIL}
          component={CommodityDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={MANDI_ROUTES.DISTRICT_WISE_RATES}
          component={DistrictWiseRatesScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Route names: GovernmentSchemes, LatestSchemes, DoctorMain, Doctors, DoctorRegistration, DoctorRegistrationDetails, DoctorDetails, DoctorConsultation, DoctorConsultationDetails, DoctorRequests, DoctorRequestDetails, DoctorEditProfile, MyDoctorProfile, MyConsultations */}
        <Stack.Screen
          name="GovernmentSchemes"
          component={GovernmentSchemesScreen}
        />
        <Stack.Screen name="LatestSchemes" component={LatestSchemesScreen} />
        <Stack.Screen name="DoctorMain" component={DoctorMainScreen} />
        <Stack.Screen name="Doctors" component={DoctorsScreen} />
        <Stack.Screen
          name="DoctorRegistration"
          component={DoctorRegistrationScreen}
        />
        <Stack.Screen
          name="DoctorRegistrationDetails"
          component={DoctorRegistrationDetailsScreen}
        />
        <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} />
        <Stack.Screen
          name="DoctorConsultation"
          component={DoctorConsultationScreen}
        />
        <Stack.Screen
          name="DoctorConsultationDetails"
          component={DoctorConsultationDetailsScreen}
        />
        <Stack.Screen
          name="DoctorRequests"
          component={DoctorRequestsScreen}
        />
        <Stack.Screen
          name="DoctorRequestDetails"
          component={DoctorRequestDetailsScreen}
        />
        <Stack.Screen
          name="DoctorEditProfile"
          component={DoctorEditProfileScreen}
        />
        <Stack.Screen
          name="MyDoctorProfile"
          component={MyDoctorProfileScreen}
        />
        <Stack.Screen
          name="MyConsultations"
          component={MyConsultationsScreen}
        />

        {/* Route names: NurseryHome, NurseryPlantDetails, NurseryCart, NurseryCheckout, NurseryOrders, MyOrders, NurseryOrderDetails, SellPlant, MyNurseryListings */}
        <Stack.Screen name="NurseryHome" component={NurseryHomeScreen} />
        <Stack.Screen
          name="NurseryPlantDetails"
          component={NurseryPlantDetailsScreen}
        />
        <Stack.Screen name="NurseryCart" component={NurseryCartScreen} />
        <Stack.Screen
          name="NurseryCheckout"
          component={NurseryCheckoutScreen}
        />
        <Stack.Screen name="NurseryOrders" component={NurseryOrdersScreen} />
        <Stack.Screen name="MyOrders" component={NurseryOrdersScreen} />
        <Stack.Screen
          name="NurseryOrderDetails"
          component={NurseryOrderDetailsScreen}
        />
        <Stack.Screen name="SellPlant" component={SellPlantScreen} />
        <Stack.Screen
          name="MyNurseryListings"
          component={MyNurseryListingsScreen}
        />

        {/* Route names: ProvideServiceStep1, ProvideServiceStep2, ProvideServiceStep3, ProvideServiceStep4, ProvideServiceSuccess */}
        <Stack.Screen
          name="ProvideServiceStep1"
          component={ProvideServiceStep1Screen}
        />
        <Stack.Screen
          name="ProvideServiceStep2"
          component={ProvideServiceStep2Screen}
        />
        <Stack.Screen
          name="ProvideServiceStep3"
          component={ProvideServiceStep3Screen}
        />
        <Stack.Screen
          name="ProvideServiceStep4"
          component={ProvideServiceStep4Screen}
        />
        <Stack.Screen
          name="ProvideServiceSuccess"
          component={ProvideServiceSuccessScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* Route names: WorkerDetails, LabourBookingDetails, ConfirmLabourBooking, LabourBookingSuccess, FindWorkStep1, FindWorkStep2, FindWorkStep3, FindWorkStep4, FindWorkSuccess, MyBookings, LabourRequests */}
        <Stack.Screen name="WorkerDetails" component={WorkerDetailsScreen} />
        <Stack.Screen
          name="LabourBookingDetails"
          component={LabourBookingDetailsScreen}
        />
        <Stack.Screen
          name="ConfirmLabourBooking"
          component={ConfirmLabourBookingScreen}
        />
        <Stack.Screen
          name="LabourBookingSuccess"
          component={LabourBookingSuccessScreen}
        />
        <Stack.Screen name="FindWorkStep1" component={FindWorkStep1Screen} />
        <Stack.Screen name="FindWorkStep2" component={FindWorkStep2Screen} />
        <Stack.Screen name="FindWorkStep3" component={FindWorkStep3Screen} />
        <Stack.Screen name="FindWorkStep4" component={FindWorkStep4Screen} />
        <Stack.Screen
          name="FindWorkSuccess"
          component={FindWorkSuccessScreen}
        />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        <Stack.Screen name="LabourRequests" component={LabourRequestsScreen} />

        {/* Route names: DroneServices, DroneServiceDetails, BookDroneService, ConfirmDroneBooking, DroneBookingSuccess */}
        <Stack.Screen name="DroneServices" component={DroneServicesScreen} />
        <Stack.Screen
          name="DroneServiceDetails"
          component={DroneServiceDetailsScreen}
        />
        <Stack.Screen
          name="BookDroneService"
          component={BookDroneServiceScreen}
        />
        <Stack.Screen
          name="ConfirmDroneBooking"
          component={ConfirmDroneBookingScreen}
        />
        <Stack.Screen
          name="DroneBookingSuccess"
          component={DroneBookingSuccessScreen}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}