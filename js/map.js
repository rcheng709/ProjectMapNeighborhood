var map;
var clientID;
var clientSecret;

var Location = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.URL = "";
    this.address = data.address;
    this.category = data.categories;


    this.visible = ko.observable(true);

    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170801'; // + '&query=' auto;

    $.ajax({
        //type: 'GET',
        url: foursquareURL,
        dataType: "json",
        data: {
            client_id: clientID,
            client_secret: clientSecret,
            //query: "", // gets data from marker.name (array of object)
            //near: "Orlando",
            v: 20170801 // version equals date
        },
        success: function(data) {
            // console.log(data);
            var results = data.response.venues[0];
            self.category = results.categories[0].name;
            self.address = results.location.formattedAddress[0];
            self.URL =  "https://foursquare.com/v/"+results.id;
            if (typeof self.URL === 'undefined') {
                self.URL = "";
            }
        },
        error: function() {
            alert("Foursquare data is currently not available. Please try again later");
        }
    });
    this.infoString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content">' + self.category + "</div>" +
        '<div class="content">' + self.address + "</div>" +
        '<div class="content">' + self.URL + "</div></div>";

    this.infoWindow = new google.maps.InfoWindow({
        content: self.infoString,
        maxWidth: 250
    });

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(self.lat, self.long),
        map: map,
        title: self.name
    });

    this.showMarker = ko.computed(function() {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function() {
        self.infoString = '<div class="info-window-content"><div class="title"><b>' + self.name + "</b></div>" +
            //'<div class="content"><a href="' + self.venues +'">' + self.venues + "</a></div>" +
            '<div class="content">' + self.category + "</div>" +
            '<div class="content">' + self.address + "</div>" +
            '<div class="content">' + "More Info: " + "<a href='" + self.URL + "'>" + "Click here" + "</a></div>";

        self.infoWindow.setContent(self.infoString);

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100);
    });

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function AppViewModel() {
    var myLatLng = {
        lat: 28.395331,
        lng: -81.379551
    };
    var self = this;

    this.searchTerm = ko.observable("");

    this.locationList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: myLatLng
    });

    // Foursquare API settings
    clientID = "RIHRBG21AKHMDKCBLDPY5LMSRQ151JWEDLKD05UF5BHDTD4W";
    clientSecret = "GEIR3TDNE4ECXQU3REW1RTR41HP3PZJFGZ2NVURVR2JECV55";

    locationslist.forEach(function(locationItem) {
        self.locationList.push(new Location(locationItem));
    });

    this.filteredList = ko.computed(function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
    this.mapElem.style.height = window.innerHeight - 50;
}

function startMap() {
    ko.applyBindings(new AppViewModel());
}

function mapError() {
     
   alert("Google Maps has failed to load. Please check your internet connection and try again.");
} 