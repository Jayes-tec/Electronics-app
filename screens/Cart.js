import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { serverURL, postData } from '../services/FetchNodeServices';
import PlusMinusComponent from '../components/uicomponents/PlusMinusComponent';
import MyButton from '../components/uicomponents/MyButton';
import TextBox from '../components/uicomponents/TextBox';
import ADI from 'react-native-vector-icons/AntDesign';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function Cart({ navigation }) {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.mycart || {});
  const cartItems = Object.values(cart);

  // Checkout modal and forms state
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [message, setMessage] = useState('');
  
  // Order success state
  const [orderSuccessVisible, setOrderSuccessVisible] = useState(false);
  const [submittedOrderDetails, setSubmittedOrderDetails] = useState(null);

  // Cart totals
  const calculateTotalMRP = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  const calculateTotalPayable = () => {
    return cartItems.reduce((acc, item) => acc + (item.offerprice > 0 ? item.offerprice : item.price) * item.qty, 0);
  };

  const totalMRP = calculateTotalMRP();
  const totalPayable = calculateTotalPayable();
  const totalSavings = totalMRP - totalPayable;

  // Handle cart quantities
  const handleCartChange = (item, newQty) => {
    if (newQty === 0) {
      dispatch({ type: "REMOVE_PRODUCT", payload: [item.productdetailsid] });
    } else {
      dispatch({ type: "ADD_PRODUCT", payload: [item.productdetailsid, { ...item, qty: newQty }] });
    }
  };

  // Mobile number input check
  const handleMobileChange = async (text) => {
    setMobileNumber(text);
    if (text.length === 10) {
      setLoading(true);
      setMessage('Checking account...');
      try {
        const res = await postData('useraccount/check_account', { mobileno: text });
        if (res && res.status && res.data.length > 0) {
          const user = res.data[0];
          setFullName(user.username || '');
          setEmail(user.emailid || '');
          setAddress(user.address || '');
          setPincode(user.pincode ? user.pincode.toString() : '');
          setUserExists(true);
          setMessage('Welcome back! Account details auto-filled.');
        } else {
          setUserExists(false);
          setMessage('New account detected! Please enter details.');
        }
      } catch (err) {
        console.log("Error checking account:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setUserExists(false);
      setMessage('');
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!mobileNumber || !fullName || !email || !address || !pincode) {
      setMessage('Please fill in all details.');
      return;
    }

    setLoading(true);
    try {
      // 1. Submit/Register User if they are new
      if (!userExists) {
        const registerRes = await postData('useraccount/submit_useraccount', {
          emailid: email,
          mobileno: mobileNumber,
          username: fullName,
          address: address,
          pincode: pincode
        });
        if (!registerRes || !registerRes.status) {
          setMessage('Error creating account. Please try again.');
          setLoading(false);
          return;
        }
      }

      // 2. Submit the order to backend
      const orderRes = await postData('userinterface/order_submit', {
        cart: cartItems.map(item => ({
          productdetailsid: item.productdetailsid,
          qty: item.qty
        })),
        paymentstatus: 'COD - Paid',
        user: {
          mobileno: mobileNumber,
          emailid: email,
          username: fullName,
          address: `${address}, Pincode: ${pincode}`
        }
      });

      if (orderRes && orderRes.status) {
        // Record details for success screen
        setSubmittedOrderDetails({
          name: fullName,
          address: address,
          payable: totalPayable,
          itemsCount: cartItems.reduce((acc, item) => acc + item.qty, 0)
        });

        // Close checkout modal & show success modal
        setCheckoutVisible(false);
        setOrderSuccessVisible(true);

        // 3. Clear Redux Cart
        cartItems.forEach(item => {
          dispatch({ type: "REMOVE_PRODUCT", payload: [item.productdetailsid] });
        });
      } else {
        setMessage('Failed to submit order. Please try again.');
      }
    } catch (err) {
      console.log("Error during checkout:", err);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }) => {
    const firstImage = item.picture ? item.picture.split(',')[0] : '';
    const unitPrice = item.offerprice > 0 ? item.offerprice : item.price;

    return (
      <View style={styles.cartCard}>
        <Image 
          source={{ uri: `${serverURL}/images/${firstImage}` }} 
          style={styles.itemImage}
        />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemBrand}>{item.brandname}</Text>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.productname} {item.modelno}
          </Text>
          <Text style={styles.itemMeta}>Color: {item.color} • Qty: {item.qty}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.itemPrice}>&#8377;{unitPrice * item.qty}</Text>
            {item.offerprice > 0 && (
              <Text style={styles.itemOriginalPrice}>&#8377;{item.price * item.qty}</Text>
            )}
          </View>
        </View>

        <View style={styles.plusMinusWrapper}>
          <PlusMinusComponent 
            qty={item.qty}
            onChange={(qty) => handleCartChange(item, qty)}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ADI name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Shopping Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      {cartItems.length > 0 ? (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.productdetailsid.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={() => (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Price Breakdown</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total MRP</Text>
                  <Text style={styles.summaryValue}>&#8377;{totalMRP}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount Price</Text>
                  <Text style={[styles.summaryValue, { color: '#ff4757' }]}>- &#8377;{totalSavings}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Charges</Text>
                  <Text style={[styles.summaryValue, { color: '#12daa8' }]}>FREE</Text>
                </View>

                <View style={[styles.summaryRow, styles.dividerRow]}>
                  <Text style={styles.totalLabel}>Total Payable Amount</Text>
                  <Text style={styles.totalValue}>&#8377;{totalPayable}</Text>
                </View>

                {totalSavings > 0 && (
                  <View style={styles.savingsTag}>
                    <Text style={styles.savingsText}>🎉 You are saving &#8377;{totalSavings} on this order!</Text>
                  </View>
                )}
              </View>
            )}
          />

          {/* Place Order Bar */}
          <View style={styles.actionFooter}>
            <View>
              <Text style={styles.footerLabel}>Total Amount</Text>
              <Text style={styles.footerPrice}>&#8377;{totalPayable}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutBtn}
              onPress={() => setCheckoutVisible(true)}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <ADI name="arrowright" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCartContainer}>
          <MCI name="shopping-outline" size={80} color="#747d8c" />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>Add items to your cart to begin secure shopping</Text>
          <TouchableOpacity 
            style={styles.browseBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Checkout Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={checkoutVisible}
        onRequestClose={() => setCheckoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Secure Checkout</Text>
              <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                <ADI name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.modalLoader}>
                <ActivityIndicator size="large" color="#12daa8" />
              </View>
            )}

            <ScrollView contentContainerStyle={styles.modalForm}>
              {message.length > 0 && (
                <View style={[styles.msgBox, { backgroundColor: userExists ? 'rgba(18, 218, 168, 0.1)' : 'rgba(255, 71, 87, 0.1)' }]}>
                  <Text style={[styles.msgText, { color: userExists ? '#12daa8' : '#ff4757' }]}>{message}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 10 digit mobile no"
                placeholderTextColor="#747d8c"
                keyboardType="numeric"
                maxLength={10}
                value={mobileNumber}
                onChangeText={handleMobileChange}
              />

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your name"
                placeholderTextColor="#747d8c"
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email ID"
                placeholderTextColor="#747d8c"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.inputLabel}>Shipping Address</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Enter complete address"
                placeholderTextColor="#747d8c"
                multiline={true}
                numberOfLines={3}
                value={address}
                onChangeText={setAddress}
              />

              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 6 digit pincode"
                placeholderTextColor="#747d8c"
                keyboardType="numeric"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
              />

              <TouchableOpacity 
                style={styles.confirmBtn}
                onPress={handlePlaceOrder}
              >
                <Text style={styles.confirmBtnText}>Confirm Order (COD)</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Order Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={orderSuccessVisible}
        onRequestClose={() => setOrderSuccessVisible(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrapper}>
              <ADI name="checkcircle" size={80} color="#12daa8" />
            </View>
            
            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.successSubtitle}>Thank you for your purchase.</Text>
            
            {submittedOrderDetails && (
              <View style={styles.orderReceipt}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Customer:</Text>
                  <Text style={styles.receiptVal}>{submittedOrderDetails.name}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Total Items:</Text>
                  <Text style={styles.receiptVal}>{submittedOrderDetails.itemsCount}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Total Paid:</Text>
                  <Text style={[styles.receiptVal, { color: '#12daa8', fontWeight: 'bold' }]}>&#8377;{submittedOrderDetails.payable}</Text>
                </View>
                <Text style={styles.receiptDeliverText}>Delivering to: {submittedOrderDetails.address}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.receiptCloseBtn}
              onPress={() => {
                setOrderSuccessVisible(false);
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.receiptCloseBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0d12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: height * 0.07,
    backgroundColor: '#1e202c',
    borderBottomWidth: 1,
    borderColor: '#2e3247',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
    paddingBottom: 40,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#1e202c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e3247',
    padding: 12,
    marginBottom: 15,
    position: 'relative',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#1e202c',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
    paddingRight: 60,
  },
  itemBrand: {
    color: '#747d8c',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  itemMeta: {
    color: '#747d8c',
    fontSize: 11,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  itemPrice: {
    color: '#12daa8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemOriginalPrice: {
    color: '#747d8c',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  plusMinusWrapper: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  summaryCard: {
    backgroundColor: '#1e202c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e3247',
    padding: 15,
    marginTop: 10,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#747d8c',
    fontSize: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dividerRow: {
    borderTopWidth: 1,
    borderColor: '#2e3247',
    paddingTop: 15,
    marginTop: 10,
    marginBottom: 0,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#12daa8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  savingsTag: {
    backgroundColor: 'rgba(18, 218, 168, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  savingsText: {
    color: '#12daa8',
    fontSize: 13,
    fontWeight: '600',
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 90,
    backgroundColor: '#1e202c',
    borderTopWidth: 1,
    borderColor: '#2e3247',
  },
  footerLabel: {
    color: '#747d8c',
    fontSize: 12,
  },
  footerPrice: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12daa8',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  checkoutBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyCartTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyCartSubtitle: {
    color: '#747d8c',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 20,
  },
  browseBtn: {
    backgroundColor: '#12daa8',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e202c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.85,
    borderWidth: 1,
    borderColor: '#2e3247',
    position: 'relative',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#2e3247',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 32, 44, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalForm: {
    padding: 20,
    paddingBottom: 40,
  },
  msgBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  msgText: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputLabel: {
    color: '#dcdde1',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#0c0d12',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2e3247',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  confirmBtn: {
    backgroundColor: '#12daa8',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 25,
  },
  confirmBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  successCard: {
    backgroundColor: '#1e202c',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2e3247',
    width: '100%',
    padding: 25,
    alignItems: 'center',
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  successTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  successSubtitle: {
    color: '#747d8c',
    fontSize: 15,
    marginTop: 5,
    marginBottom: 20,
  },
  orderReceipt: {
    backgroundColor: '#0c0d12',
    borderWidth: 1,
    borderColor: '#2e3247',
    borderRadius: 12,
    width: '100%',
    padding: 15,
    marginBottom: 25,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptLabel: {
    color: '#747d8c',
    fontSize: 13,
  },
  receiptVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  receiptDeliverText: {
    color: '#747d8c',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: '#2e3247',
    paddingTop: 8,
  },
  receiptCloseBtn: {
    backgroundColor: '#12daa8',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  receiptCloseBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
});