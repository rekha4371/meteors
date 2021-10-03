import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    Alert,
    FlatList,
    Image,
    ImageBackground,
    Dimensions
} from "react-native";
import axios from "axios";
/* axios--it gives data directly in JSON format u dont have to convert it.....which we had done in angry bird game fetching worltime api*/

export default class MeteorScreen extends Component {
    /* 
    For every class we need to create constructor and inside you need to specify the states
    >>meteors:{} ----there are 2 types of array 
    (1) Every element is in form of index numbers [0,1,2,3....4]
    (2) if u have  a {} its called a dictionary in this every element as a key  not as index 0,1,2... which is again  a diff element which is
    called as unique identifier number
    For refering every meteors you will start a loop by which it is identified 
    for example---in the data of API links,id etc are called as keys
*/
   
    constructor(props) {
        super(props);
        this.state = {
            meteors: {},
        };
    }
 componentDidMount() {
        this.getMeteors()
    }
/* Whn u fetch API their are lots of data inorder to make the code understandable we use pretifier tool, their are plenty of data in this API
we are only concerned about near_earth_objects.........Go to Asterioad -Neow's in this will retrieve a list and we are concerned of Neo-Feed(it 
    retrieves a list of asteriods based on closest approach date to earth)  
    START DATE---it will select ur current date or u can specify a range from this day to this or by default it takes nxt 7 days*/

    getMeteors = () => {
        axios
            .get("https://api.nasa.gov/neo/rest/v1/feed?api_key=nAkq24DJ2dHxzqXyzfdreTvczCVOnwJuFLFq4bDZ")
            .then(response => {
                this.setState({ meteors: response.data.near_earth_objects })
            })
            .catch(error => {
                Alert.alert(error.message)
            })
    }
/* .get is  a method to get the data and .then is what to do after getting the data .....data will get stored in the response and then u will 
set a state for meteors to response 
if not getting data from API .catch function will alert*/

    renderItem = ({ item }) => {
        let meteor = item
        let bg_img, speed, size;
        if (meteor.threat_score <= 30) {
            bg_img = require("../assets/meteor_bg1.png")
            speed = require("../assets/meteor_speed3.gif")
            size = 100
        } else if (meteor.threat_score <= 75) {
            bg_img = require("../assets/meteor_bg2.png")
            speed = require("../assets/meteor_speed3.gif")
            size = 150
        } else {
            bg_img = require("../assets/meteor_bg3.png")
            speed = require("../assets/meteor_speed3.gif")
            size = 200
        }
        return (
            <View>
                <ImageBackground source={bg_img} style={styles.backgroundImage}>
                    <View styles={styles.gifContainer}>
                        <Image source={speed} style={{ width: size, height: size, alignSelf: "center" }}></Image>
                        <View>
                            <Text style={[styles.cardTitle, { marginTop: 400, marginLeft: 50 }]}>{item.name}</Text>
                            <Text style={[styles.cardText, { marginTop: 20, marginLeft: 50 }]}>Closest to Earth - {item.close_approach_data[0].close_approach_date_full}</Text>
                            <Text style={[styles.cardText, { marginTop: 5, marginLeft: 50 }]}>Minimum Diameter (KM) - {item.estimated_diameter.kilometers.estimated_diameter_min}</Text>
                            <Text style={[styles.cardText, { marginTop: 5, marginLeft: 50 }]}>Maximum Diameter (KM) - {item.estimated_diameter.kilometers.estimated_diameter_max}</Text>
                            <Text style={[styles.cardText, { marginTop: 5, marginLeft: 50 }]}>Velocity (KM/H) - {item.close_approach_data[0].relative_velocity.kilometers_per_hour}</Text>
                            <Text style={[styles.cardText, { marginTop: 5, marginLeft: 50 }]}>Missing Earth by (KM) - {item.close_approach_data[0].miss_distance.kilometers}</Text>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        );
    };

    /* item is ur meteors .....index is 0,1,2,3...
    index.toString is index is converted as string and tht stores in ur key extractor*/ 
    keyExtractor = (item, index) => index.toString();

    render() {
        /* if data has not been fetched to us and length of dictionary is 0 then i need to display the message loading this is the time where
        ur data is not fetched...u check ur dictionary has elements inside it */
        if (Object.keys(this.state.meteors).length === 0) {
            return (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                    <Text>Loading</Text>
                </View>
            )
            /* In else condition we will start with a loop with help of map function ..it will start a loop on date of every dictionary that is 
            key of dictionary and after starting the loop it will add in an array called meteor_arr
            (meteor_arr ----it finally contains a list of entire meteors with date in it. Next is we dont want the date in it and we want every 
                information on every meteors like id,neo_ref,nasa_jpl,absolute_magnitude,meters,miles.....to have all these information what will have is 
                another array which is empty and concat it our meteor_arr */
        } else {
            let meteor_arr = Object.keys(this.state.meteors).map(meteor_date => {
                return this.state.meteors[meteor_date]
            })
            let meteors = [].concat.apply([], meteor_arr);
            meteors.forEach(function (element) {
                let diameter = (element.estimated_diameter.kilometers.estimated_diameter_min + element.estimated_diameter.kilometers.estimated_diameter_max) / 2
                let threatScore = (diameter / element.close_approach_data[0].miss_distance.kilometers) * 1000000000
                /*10^9 ---beacuse threat score is a very very small unit so wil multiply with 10^9 so u get somewer in whole number and ur storing in threatscore*/
                element.threat_score = threatScore;
            });
            /* all objects in our meteor_array will get stored inside array called meteors
            concating is 2 arrays together that is empty array + meteor_arr..so objects are stored inside it  */
            meteors.sort(function (a, b) {
                return b.threat_score - a.threat_score
            })
            /* i have lots of data i dnt wnt to show all of them hence i need to seggregate them on what to show and what not to , so for that we are 
            calculating threat score for every meteors.................threatscore----formula is based on bigger the meteor more the threat it is causing
            to the earth...lesser distance the meteor is near to earth causing the threat...since both are taken in the form of kilometers that wil define
            how much threat it is causing......after getting threatscore ur arranging in descending order.....now the meteors contain 1st 5 datas*/

            meteors = meteors.slice(0, 5)
            return (
                <View style={styles.container}>
                    <SafeAreaView style={styles.droidSafeArea} />
        /*Flatlist --also called as lazyloading if u dont want to load entire data with one stretch u can load certain part of it
        3 mandatory fields to be used whn used Flatlist
        (1) keyExtractor---how do u wnt to extract the data  */
                    <FlatList
                        keyExtractor={this.keyExtractor}
                        data={meteors}
                        renderItem={this.renderItem}
                        horizontal={true}
                    />
                </View >
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    droidSafeArea: {
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    titleBar: {
        flex: 0.15,
        justifyContent: "center",
        alignItems: "center"
    },
    titleText: {
        fontSize: 30,
        fontWeight: "bold",
        color: "white"
    },
    meteorContainer: {
        flex: 0.85
    },
    listContainer: {
        backgroundColor: 'rgba(52, 52, 52, 0.5)',
        justifyContent: "center",
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        borderRadius: 10,
        padding: 10
    },
    cardTitle: {
        fontSize: 20,
        marginBottom: 10,
        fontWeight: "bold",
        color: "white"
    },
    cardText: {
        color: "white"
    },
    threatDetector: {
        height: 10,
        marginBottom: 10
    },
    gifContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1
    },
    meteorDataContainer: {
        justifyContent: "center",
        alignItems: "center",

    }
});