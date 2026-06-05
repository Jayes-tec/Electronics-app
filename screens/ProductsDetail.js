import { View, Text, Image, Dimensions, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { serverURL } from "../services/FetchNodeServices";
import ADI from 'react-native-vector-icons/AntDesign';
import EI from 'react-native-vector-icons/Entypo';
import { useEffect, useState } from "react";
import RenderHtml from 'react-native-render-html';
import MyButton from "../components/uicomponents/MyButton";
import PlusMinusComponent from "../components/uicomponents/PlusMinusComponent";
import ProductColorDetails from "../components/uicomponents/ProductColorDetails";
import { useSelector, useDispatch } from 'react-redux';

var { width, height } = Dimensions.get('window');

export default function ProductDetails({ route, navigation }) {
    const dispatch = useDispatch();
    const cart = useSelector(state => state.mycart || {});

    const { item } = route.params;

    const [heart, setHeart] = useState(false);
    const [colorProduct, setColorProduct] = useState(item);

    const qtyInCart = cart[colorProduct?.productdetailsid]?.qty || 0;

    const allImage = colorProduct?.picture ? colorProduct.picture.split(',') : [];
    const [image, setImage] = useState();

    const handleCartChange = (newQty) => {
        if (newQty === 0) {
            dispatch({ type: "REMOVE_PRODUCT", payload: [colorProduct.productdetailsid] });
        } else {
            dispatch({ type: "ADD_PRODUCT", payload: [colorProduct.productdetailsid, { ...colorProduct, qty: newQty }] });
        }
    };

    const TopIcons = () => {
        return (
            <View style={{ flexDirection: 'row', marginLeft: 'auto', marginTop: 20, paddingRight: 15 }}>
                <TouchableOpacity onPress={() => setHeart(!heart)}>
                    <ADI
                        style={{ color: '#fff', paddingRight: 15 }}
                        name={heart ? 'heart' : 'hearto'}
                        size={24}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('cart')}>
                    <ADI
                        style={{ color: '#fff' }}
                        name="shoppingcart"
                        size={24}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    const MainImage = () => {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image style={{ backgroundColor: '#1e202c', borderRadius: 10, marginTop: 20, width: width * 0.8, height: height * 0.35, resizeMode: 'contain' }} source={{ uri: `${serverURL}/images/${image}` }} />
            </View>
        );
    }

    useEffect(() => {
        if (allImage.length > 0) {
            setImage(allImage[0]);
        }
    }, [colorProduct]);

    const AllImage = ({ img }) => {
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', margin: 5, height: 120 }}>
                <TouchableOpacity onPress={() => setImage(img)}>
                    <View style={{ backgroundColor: '#1e202c', borderWidth: 1, borderColor: image === img ? '#12daa8' : '#2e3247', margin: 5, alignItems: 'center', justifyContent: 'center', height: height * 0.11, width: width * 0.24, borderRadius: 10 }}>
                        <Image style={{ width: '90%', height: '90%', borderRadius: 10, resizeMode: 'contain' }} source={{ uri: `${serverURL}/images/${img}` }} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    const ProductDescription = () => {
        const discount = colorProduct.price > colorProduct.offerprice ? Math.round(((colorProduct.price - colorProduct.offerprice) / colorProduct.price) * 100) : 0;
        
        return (
            <View style={{ paddingHorizontal: 15 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22, marginTop: 20 }}>
                    {colorProduct.brandname} {colorProduct.productname} {colorProduct.modelno}
                </Text>

                <View style={{ flexDirection: 'row', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
                    {discount > 0 && (
                        <Text style={{ borderRadius: 20, color: '#ff4757', backgroundColor: 'rgba(255, 71, 87, 0.1)', paddingVertical: 6, paddingHorizontal: 16, fontWeight: 'bold', fontSize: 13 }}>
                            {discount}% OFF Special Discount
                        </Text>
                    )}
                    <Text style={{ borderRadius: 20, color: '#12daa8', backgroundColor: 'rgba(18, 218, 168, 0.1)', paddingVertical: 6, paddingHorizontal: 16, fontWeight: 'bold', fontSize: 13 }}>
                        No Cost EMI available
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                    <Text style={{ color: '#12daa8', fontWeight: 'bold', fontSize: 15 }}> 4.5 </Text>
                    <EI
                        style={{ color: '#12daa8' }}
                        name="star"
                        size={18}
                    />
                    <Text style={{ marginLeft: 6, textDecorationLine: 'underline', color: '#12daa8', fontSize: 14 }}>59 Ratings & Reviews</Text>
                </View>

                <View style={{ paddingTop: 15 }}>
                    {colorProduct.offerprice > 0 ?
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={{ color: '#12daa8', fontSize: 24, fontWeight: 'bold' }}>&#8377;{colorProduct.offerprice}</Text>
                            <Text style={{ textDecorationLine: 'line-through', fontSize: 16, fontWeight: 'normal', color: '#747d8c', marginLeft: 10 }}>&#8377;{colorProduct.price}</Text>
                        </View>
                        :
                        <Text style={{ color: '#12daa8', fontSize: 24, fontWeight: 'bold' }}>
                            &#8377;{colorProduct.price}
                        </Text>
                    }
                    <Text style={{ fontSize: 12, color: '#747d8c', marginTop: 3 }}>(Inclusive of all taxes)</Text>
                </View>

                <View style={{ marginVertical: 15 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 10 }}>Color Options</Text>
                    <ProductColorDetails colorProduct={colorProduct} setColorProduct={setColorProduct} product={item} />
                </View>

                <View style={{ marginTop: 10 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Specifications & Details</Text>

                    <View style={{ marginTop: 6, borderBottomWidth: 1.5, borderColor: '#2e3247' }} />

                    <View style={{ borderRadius: 10, marginTop: 15, borderWidth: 1.5, borderColor: '#2e3247', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#1e202c' }}>
                        <RenderHtml tagsStyles={{ body: { color: '#dcdde1', fontSize: 14, lineHeight: 22 } }}
                            contentWidth={width - 60}
                            source={{ html: colorProduct.description }}
                        />
                    </View>
                </View>

                <View style={{ marginVertical: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <PlusMinusComponent 
                        qty={qtyInCart}
                        onChange={handleCartChange}
                    />
                    <MyButton 
                        bg='#12daa8' 
                        msg='Buy Now' 
                        w={0.45} 
                        h={0.08} 
                        txtCol='#000' 
                        brdCol='#12daa8' 
                        onPress={() => {
                            if (qtyInCart === 0) {
                                dispatch({ type: "ADD_PRODUCT", payload: [colorProduct.productdetailsid, { ...colorProduct, qty: 1 }] });
                            }
                            navigation.navigate('cart');
                        }}
                    />
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#0c0d12' }}>
            <View style={{ flex: 1, backgroundColor: '#0c0d12', paddingBottom: 30 }}>
                {TopIcons()}
                {MainImage()}
                <View style={{ marginVertical: 10 }}>
                    <FlatList
                        data={allImage}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 10 }}
                        renderItem={({ item }) => <AllImage img={item} />}
                        keyExtractor={(img, index) => index.toString()}
                    />
                </View>
                {ProductDescription()}
            </View>
        </ScrollView>
    );
}
