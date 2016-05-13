function initApp(idx,par,time){
    updateTime(time);
    //updateTable(time,idx);
    _table.drawTimeTable(time, idx);
    updateLocation(idx,par,time);
}

function updateTime(time){
    user.time = time;
    _slider.setSliderValue(time);
    _map.updateTime(time);
}

function updateTable(time, idx){
    var nearest = calculateNear(smhidata[idx].lat, smhidata[idx].lon);
    var locations = [idx,nearest[0].idx, nearest[1].idx, nearest[2].idx, nearest[3].idx];

    _table.updateTimeTable(time, idx);
    _table.highlightColumn(par, time);
}

function updateLocation(idx,par,time){
    //Update header
    $("#tableLocation").html(smhidata[idx].name);
    $(".l_header").html(smhidata[idx].name);

    //Update components
    _graph.initGraph(smhidata, idx, par, time);
    _slider.setSliderValue(time);
    _map.updateTime(time);
    _map.updatePar(par);

    var data = {
        lon: smhidata[idx].lon,
        lat: smhidata[idx].lat
    };
    _map.updateMap(data);

    _table.updateTimeTable(time,idx);
    _table.highlightColumn(par, time);
}

function formatGetTime(time){
    var string = time[11] + time[12] + time[13] + time[14] + time[15];
    return string;
}

 //Used to calculate the arraySize-nr of cities closest to a position.
function calculateNear(userLat, userLong){
    var nearestPos = [];
    var arraySize = 4;
    var firstlat = smhidata[0].lat;
    var firstlon = smhidata[0].lon;
    var arrMaxVal = 0;
    var arrIndex;
    var result = haversine(userLat,firstlat,userLong,firstlon);

    //Loops through all cities and compares distance with havesine-function.
    for (var i=0; i<smhidata.length; i++){
        var ans = haversine(userLat,smhidata[i].lat,userLong,smhidata[i].lon);

        //If nearest-position-array is empty. Push the four first results and its index in smhidata
        if(nearestPos.length < arraySize && ans != 0){
            nearestPos.push({res: ans, idx: i});
            arrMaxVal = ans;
            if(ans > arrMaxVal){
                arrMaxVal = ans;
            }
        }
        else if(ans < arrMaxVal && ans != 0){      //If the new value is close to current position than the last.

            arrMaxVal = nearestPos[0].res;
            arrIndex = 0;
            //Check where the largest value is in the array and insert the new closer position in that slot.
            for (var j = 0; j < arraySize; j++){
                if (arrMaxVal < nearestPos[j].res){
                    arrMaxVal = nearestPos[j].res;
                    arrIndex = j;
                }
            }
            nearestPos[arrIndex] = {res: ans, idx: i};
            result = ans;   //result will be compared to the next ans given from next smhidata-value.
        }
    }

    return nearestPos;
};

//Autocomplete for the Searchbar
var input = document.getElementById('CitySearch');
var awesomplete = new Awesomplete(input, {
    minChars: 1,
    maxItems: 5,
    autoFirst: true,
    filter: Awesomplete.FILTER_STARTSWITH
});

//Saving the name of the cities in an array
var list = [];
    for(i=0; i<smhidata.length; i++) {

    list[i] = smhidata[i].name;
}

awesomplete.list = list;

//This function runs when the Sök button is clicked
document.getElementById("SearchBtn").onclick = function(){
    var AdresFalt = $("#CitySearch");

    for(var i=0; i<smhidata.length; i++){
        if(AdresFalt.val() == smhidata[i].name) {
            updateLocation(i,'t',0);
        }
    }   
}; 

function runScript(e) {
    if (e.keyCode == 13) {
        var tb = document.getElementById("searchText");
        var AdresFalt = $("#CitySearch");
        
        for(i=0; i<smhidata.length; i++){
            if(AdresFalt.val() == smhidata[i].name) {
                    
                updateLocation(i,'t',0);
            }
        }

        return false;
    }
}

function haversine(lat1, lat2, lng1, lng2){
    rad = 3961; // for km use 3961, for miles use 6372.8
    deltaLat = toRad(lat2-lat1);
    deltaLng = toRad(lng2-lng1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);
    a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) + Math.sin(deltaLng/2) * Math.sin(deltaLng/2) * Math.cos(lat1) * Math.cos(lat2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return  rad * c;
};

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
};
