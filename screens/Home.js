import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ScrollView, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from "react-native";
import { getData, postData, serverURL } from "../services/FetchNodeServices";
import SliderComponent from "../components/uicomponents/SliderComponent";
import SearchBar from "../components/uicomponents/SearchBar";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import PlusMinusComponent from "../components/uicomponents/PlusMinusComponent";
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux cart state
  const cart = useSelector(state => state.mycart || {});

  // Local state
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [dealsProducts, setDealsProducts] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);

  const bannerRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const catRes = await getData('userinterface/display_all_category');
        if (catRes && catRes.status) {
          setCategories(catRes.data);
        }

        // Fetch banners
        const bannerRes = await getData('userinterface/fetch_all_banner');
        if (bannerRes && bannerRes.status && bannerRes.data.length > 0) {
          const filesString = bannerRes.data[0].files || "";
          setBanners(filesString.split(',').filter(f => f.trim() !== ""));
        }

        // Fetch trending (Sale status)
        const trendingRes = await postData('userinterface/display_all_products_by_status', { status: 'Sale' });
        if (trendingRes && trendingRes.status) {
          setTrendingProducts(trendingRes.data);
        }

        // Fetch deals (Deals of the Day)
        const dealsRes = await postData('userinterface/display_all_products_by_status', { status: 'Deals of the Day' });
        if (dealsRes && dealsRes.status) {
          setDealsProducts(dealsRes.data);
        }
      } catch (err) {
        console.log("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Auto scroll for Banners
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      let nextIndex = (activeBannerIndex + 1) % banners.length;
      setActiveBannerIndex(nextIndex);
      bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeBannerIndex, banners]);

  // Search Handler
  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.trim().length > 0) {
      const res = await postData('userinterface/product_filter', { text });
      if (res && res.status) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } else {
      setSearchResults(null);
    }
  };

  // Category selection handler
  const handleCategorySelect = async (category) => {
    if (selectedCategoryId === category.categoryid) {
      // Toggle off
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(category.categoryid);
    }
  };

  // Dispatch cart modifications
  const handleCartChange = (item, newQty) => {
    if (newQty === 0) {
      dispatch({ type: "REMOVE_PRODUCT", payload: [item.productdetailsid] });
    } else {
      dispatch({ type: "ADD_PRODUCT", payload: [item.productdetailsid, { ...item, qty: newQty }] });
    }
  };

  // Banner slide card
  const renderBannerItem = ({ item }) => (
    <Image 
      source={{ uri: `${serverURL}/images/${item}` }} 
      style={styles.bannerImage}
      resizeMode="cover"
    />
  );

  // Product card grid/list component
  const ProductCard = ({ item }) => {
    const firstImage = item.picture ? item.picture.split(',')[0] : '';
    const qtyInCart = cart[item.productdetailsid]?.qty || 0;
    const discount = item.price > item.offerprice ? Math.round(((item.price - item.offerprice) / item.price) * 100) : 0;

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('productdetails', { item })}
        activeOpacity={0.85}
      >
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}

        <Image 
          source={{ uri: `${serverURL}/images/${firstImage}` }} 
          style={styles.productImage}
        />

        <View style={styles.productInfo}>
          <Text style={styles.brandText}>{item.brandname}</Text>
          <Text style={styles.productNameText} numberOfLines={2}>
            {item.productname} {item.modelno}
          </Text>

          <View style={styles.ratingRow}>
            <MCI name="star" size={14} color="#12daa8" />
            <Text style={styles.ratingText}>4.5</Text>
            <Text style={styles.colorText}> • {item.color}</Text>
          </View>

          <View style={styles.priceRow}>
            {item.offerprice > 0 ? (
              <>
                <Text style={styles.offerPriceText}>&#8377;{item.offerprice}</Text>
                <Text style={styles.originalPriceText}>&#8377;{item.price}</Text>
              </>
            ) : (
              <Text style={styles.offerPriceText}>&#8377;{item.price}</Text>
            )}
          </View>

          <View style={styles.cartActionContainer} onStartShouldSetResponder={() => true}>
            <PlusMinusComponent 
              qty={qtyInCart}
              onChange={(newQty) => handleCartChange(item, newQty)}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Determine what products to render based on selection and search
  const getFilteredProducts = () => {
    if (searchResults !== null) {
      return searchResults;
    }
    let list = [...trendingProducts, ...dealsProducts];
    // Remove duplicate products
    const seen = new Set();
    list = list.filter(item => {
      const duplicate = seen.has(item.productdetailsid);
      seen.add(item.productdetailsid);
      return !duplicate;
    });

    if (selectedCategoryId) {
      list = list.filter(item => item.categoryid === selectedCategoryId);
    }
    return list;
  };

  const displayedProducts = getFilteredProducts();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#12daa8" />
        <Text style={styles.loaderText}>Loading Gadgets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Search bar */}
      <View style={styles.searchContainer}>
        <SearchBar onChangeText={handleSearch} value={searchText} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {searchText.length === 0 && (
          <>
            {/* Banner Slider */}
            {banners.length > 0 && (
              <View style={styles.bannerContainer}>
                <FlatList
                  ref={bannerRef}
                  data={banners}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderBannerItem}
                  keyExtractor={(item, index) => index.toString()}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / (width - 30));
                    setActiveBannerIndex(index);
                  }}
                />
                {/* Dots Indicator */}
                <View style={styles.dotRow}>
                  {banners.map((_, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.dot, 
                        { backgroundColor: i === activeBannerIndex ? '#12daa8' : '#747d8c', width: i === activeBannerIndex ? 16 : 6 }
                      ]} 
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Categories Slider */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by Categories</Text>
            </View>
            <SliderComponent 
              data={categories} 
              onCategorySelect={handleCategorySelect} 
              selectedCategoryId={selectedCategoryId}
            />

            {/* Deals of the Day (Only show when category filter is off) */}
            {!selectedCategoryId && dealsProducts.length > 0 && (
              <View style={styles.dealsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Deals of the Day</Text>
                  <Text style={styles.seeAllText}>Hot 🔥</Text>
                </View>
                <FlatList
                  data={dealsProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `deal-${item.productdetailsid}`}
                  renderItem={({ item }) => (
                    <View style={{ width: width * 0.45, marginRight: 15 }}>
                      <ProductCard item={item} />
                    </View>
                  )}
                />
              </View>
            )}
          </>
        )}

        {/* Dynamic Products Grid Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchText.length > 0 
              ? `Search Results (${displayedProducts.length})` 
              : selectedCategoryId 
                ? "Category Products" 
                : "Trending Products"}
          </Text>
        </View>

        {displayedProducts.length > 0 ? (
          <FlatList
            data={displayedProducts}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            keyExtractor={(item) => `prod-${item.productdetailsid}`}
            renderItem={({ item }) => <ProductCard item={item} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MCI name="alert-circle-outline" size={48} color="#747d8c" />
            <Text style={styles.emptyText}>No Products Found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0d12',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#0c0d12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
  },
  searchContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0c0d12',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  bannerContainer: {
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: width - 30,
    height: height * 0.2,
    borderRadius: 15,
  },
  dotRow: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  seeAllText: {
    color: '#12daa8',
    fontSize: 14,
    fontWeight: '600',
  },
  dealsSection: {
    marginTop: 10,
    paddingLeft: 15,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  productCard: {
    backgroundColor: '#1e202c',
    width: (width - 45) / 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e3247',
    padding: 10,
    position: 'relative',
    marginBottom: 15,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ff4757',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    marginTop: 10,
    backgroundColor: '#1e202c',
  },
  productInfo: {
    marginTop: 10,
  },
  brandText: {
    color: '#747d8c',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  productNameText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    height: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    color: '#12daa8',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  colorText: {
    color: '#747d8c',
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  offerPriceText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  originalPriceText: {
    color: '#747d8c',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  cartActionContainer: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#747d8c',
    fontSize: 15,
    marginTop: 10,
  },
});