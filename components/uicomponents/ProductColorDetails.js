import { View } from "react-native"
import { postData } from "../../services/FetchNodeServices"
import { useEffect, useState } from "react"
import MyButton from "./MyButton"

export default function ProductColorDetails(props) {

    var product = props.product
    const [selectedId, setSelectedId] = useState(product.productdetailsid)
    const [details, setDetails] = useState([])

    const fetchDetails = async (id) => {
        var result = await postData('userinterface/display_productdetails_by_id', { productdetailsid: id })
        setSelectedId(result.data[0].productdetailsid)
        props.setColorProduct(result.data[0])
    }

    const handleChangeProduct = (id) => {
        fetchDetails(id)
    }

    const fetchProductDetails = async () => {
        var result = await postData('userinterface/fetch_product_details_by_productid', { productid: product.productid })
        setDetails(result.data)
    }

    useEffect(function () {
        fetchProductDetails()
    }, [])

    const showDetails = () => {
        return details.map((item) => {
            return (
                <View style={{ color: '#fff', fontSize: '12px', marginTop: '3%' }}>
                    <MyButton onPress={() => handleChangeProduct(item?.productdetailsid)}
                        msg={item.color} w={0.2} h={0.055} fs={16} bg='FFFFFF' txtCol="#fff"
                        brdCol={selectedId == item.productdetailsid ? '#12daa8' : 'gray'}
                    />
                </View>
            )
        })
    }

    return (
        <View style={{ flexDirection: 'row', gap: 15 }}>
            {showDetails()}
        </View>
    )
}