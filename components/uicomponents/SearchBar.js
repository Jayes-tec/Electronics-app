export default function SearchBar({ onChangeText, value }){
    return(
        <View>
            <TextBox icon="search1" w={0.96} msg="Search your products..." onChangeText={onChangeText} value={value}/>
        </View>
    )
}