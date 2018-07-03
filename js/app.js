var model = {
    locations: [{
            type: "wildlife park",
            title: "singapore zoo",
            location: {
                lat: 1.404349,
                lng: 103.793023
            }
        },
        {
            type: "Tower Building",
            title: "Pinnacle@duxton",
            location: {
                lat: 1.2771,
                lng: 103.841344
            }
        },
        {
            type: "Nature Park",
            title: "MacRitchie Reservoir",
            location: {
                lat: 1.344762,
                lng: 103.822351
            }
        },
        {
            type: "Amusement Park",
            title: "Sentosa",
            location: {
                lat: 1.249404,
                lng: 103.830321
            }
        },
        {
            type: "Nature Park",
            title: "Botanic Garden",
            location: {
                lat: 1.31384,
                lng: 103.815914
            }
        }
    ]
}

//Global Variables
var map;
var markers = [];
var indexSelectedMarker = [0,1,2,3,4];
var infowindow={};
var wikitext = "";
var wikiurl = "";

//function will be call by MAPAPI loading script
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 1.352083, lng:103.819836},
      zoom: 12
    });
    infowindow = new google.maps.InfoWindow({maxWidth: 250});
    mapFunction.makeMarkers();
    mapFunction.displayMarkers(indexSelectedMarker);
}

//all function related to map
var mapFunction = {
    googleError: function(error) {
        window.alert("Can't load Google Map API");
    },

    makeMarkers: function() {
        for (var i = 0; i < model.locations.length; i++) {
            position = model.locations[i].location;
            title = model.locations[i].title;
            var marker = new google.maps.Marker({
                // map: map, TODO: put in display function
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i
            });
            marker.addListener('click', function() {
                mapFunction.bounceMarker(this);
                mapFunction.infoWindow(this);
            });
            markers.push(marker);
        }

    },

    displayMarkers: function(indexSelectedMarker) {
        var bounds = new google.maps.LatLngBounds();

        indexSelectedMarker.forEach(function(element) {
            markers[element].setMap(map);
            bounds.extend(markers[element].position);
        })
        map.fitBounds(bounds);
    },

    hideMarkers: function() {
        for (var i = 0; i < model.locations.length; i++) {
            markers[i].setMap(null);
        }
    },

    bounceMarker: function(marker) {
        if (marker.getAnimation() == null) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.setAnimation(null);
        }
    },

    infoWindow: function(marker) {
        if (infowindow.marker != marker) {
            var wikiRequestTimeout = setTimeout(function() {
                window.alert("Fail to load, wiki content")
            }, 5000);
            var wikiurl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&formate=json&callback=wikiCallback';

            $.ajax({
                url: wikiurl,
                dataType: 'jsonp',
                success: function(data) {
                    wikitext = data[2][0];
                    wikiurl = data[3][0];
                    infowindow.setContent('');
                    infowindow.marker = marker;
                    infowindow.setContent('<div><h5>' + marker.title + '</h5><p>' + wikitext + '</p><a href=' + wikiurl + '>' + wikiurl + '</a>' + '</div>');
                    infowindow.open(map, marker);
                    clearTimeout(wikiRequestTimeout);
                },
                error: function() {
                    alert("wiki error");
                }

            });
        }
    },
}


var koviewmodel = function() {
    self = this;
    self.showlist = ko.observable("false");
    self.toggleVisibility = function() {
        self.showlist(!self.showlist());
    }

    self.selectMode = function() {
        mapFunction.hideMarkers();
        indexSelectedMarker = [];
        self.list([]);
        var type = document.getElementById("type");
        var selectedType = type.value;
        self.indexOfType(selectedType); //to get indexSelectedMarker
        mapFunction.displayMarkers(indexSelectedMarker);
        self.displayList(indexSelectedMarker);
        // reset index of selectedMarder
        indexSelectedMarker = [0, 1, 2, 3, 4];
    }
    //declare list
    self.list = ko.observableArray([]);
    self.displayList = function(indexSelectedMarker) {
        indexSelectedMarker.forEach(function(element) {
            self.list.push(model.locations[element].title);
        })
    }
    self.displayList(indexSelectedMarker);

    // indexofType is for select mode which will return the index of selected categories e.g park, building
    //display marker and display list wil use this.
    self.indexOfType = function(selectedType) {
        if (selectedType == "all") {
            indexSelectedMarker = [0, 1, 2, 3, 4];
        } else {
            model.locations.forEach(function(value, index) {
                if (selectedType == value.type) {
                    indexSelectedMarker.push(index);
                }
            })
        }
    }

    self.listevent = function() {
        for (var i = 0; i < markers.length; i++) {
            if (this == markers[i].title) {
                mapFunction.bounceMarker(markers[i]);
                mapFunction.infoWindow(markers[i]);
            }
        }
    }
}

ko.applyBindings(new koviewmodel());
