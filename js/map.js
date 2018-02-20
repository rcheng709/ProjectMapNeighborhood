//var markersModel;

// create a map variable that will be used in startMap()
var map;

// create array for listing markers in map
var markers = [];

// initialize map
function startMap() {
    // intial map view when loaded
    var myLatLng = {
        lat: 28.395331,
        lng: -81.379551
    };
    // create a map object and get map from DOM for display
    

    map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 13
        
    });
        

    // attach a click event listener to the marker objects and open an info window on click
    // creates infowindow for each place pin
    var infoWindow = new google.maps.InfoWindow();

    // iterates through all locations and drop pins on every single location
    for (j = 0; j < locations.length; j++) {
        (function() {
            //auto store name and location iteration in variables
            var name = locations[j].name;
            var location = locations[j].location;

            // drop marker after looping
            var marker = new google.maps.Marker({
                position: location,
                map: map,
                name: name,
                animation: google.maps.Animation.DROP,
                address: address
                
            });
            // pushes all locations into markers array
            markers.push(marker);

            markersModel.myLocations()[j].marker = marker;

            // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', function() {
                // show info inside infowindow when clicked
                populateInfoWindow(this, infoWindow);

                // show info retrieved from foursquare api down below
                infoWindow.setContent(contentString);
            });

            // This function populates the infowindow when the marker is clicked. We'll only allow
            // one infowindow which will open at the marker that is clicked, and populate based
            // on that markers position.
            function populateInfoWindow(marker, infoWindow) {
                // Check to make sure the infowindow is not already opened on this marker.
                if (infoWindow.marker != marker) {
                    infoWindow.marker = marker;
                    infoWindow.setContent('<div class="name">' + marker.name + '</div>' + marker.contentString);
                    // sets animation to bounce 2 times when marker is clicked
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        marker.setAnimation(null);
                    }, 2130);
                    infoWindow.open(map, marker);
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infoWindow.addListener('closeclick', function() {
                        infoWindow.setMarker = null;
                    });
                }
            } // end of populateInfoWindow

            // foursquare client-id and client-secret
            var client_id = "RIHRBG21AKHMDKCBLDPY5LMSRQ151JWEDLKD05UF5BHDTD4W";
            var client_secret = "GEIR3TDNE4ECXQU3REW1RTR41HP3PZJFGZ2NVURVR2JECV55";

            // foursquare api url
            var foursquareUrl = "https://api.foursquare.com/v2/venues/search"; // + marker.position.lat() + "," + marker.position.lng();
            // creating variables outside of the for ajax request for faster loading
            var venue, address, category, foursquareId, contentString;

            // ajax request - foursquare api data (https://developer.foursquare.com/docs/)
            $.ajax({
                //	type: 'GET',
                url: foursquareUrl,
                dataType: "json",
                data: {
                    client_id: client_id,
                    client_secret: client_secret,
                    query: marker.name, // gets data from marker.name (array of object)
                    near: "Orlando",
                    v: 20170801// version equals date
                },
                success: function(data) {
                    // console.log(data);
                    // get venue info
                    venue = data.response.venues[0];
                    // get venue address info
                    address = venue.location.formattedAddress[0];
                    // get venue category info
                    category = venue.categories[0].name;
                    // gets link of place
                    foursquareId = "https://foursquare.com/v/" + venue.id;
                    // populates infowindow with api info
                    contentString = "<div class='name'>" + "Name: " + "<span class='info'>" + name + "</span></div>" +
                        "<div class='category'>" + "Category: " + "<span class='info'>" + category + "</span></div>" +
                        "<div class='address'>" + "Address: " + "<span class='info'>" + address + "</span></div>" +
                        "<div class='information'>" + "More info: " + "<a href='" + foursquareId + "'>" + "Click here" + "</a></div>";

                    marker.contentString;
                },
                error: function() {
                    contentString = "<div class='name'>Foursquare data is currently not available. Please try again.</div>";
                }
            });
        })(j);
    } // end of for loop through markers [j]
}

function mapError() {
    alert("Technical Error:Contact website administrator Map could not be loaded at this moment. Please try again");
}

// Location Constructor
var Location = function(data) {
    var self = this;
    this.name = data.name;
    this.location = data.location;
    this.show = ko.observable(true);
};

// VIEW MODEL //
var MarkersModel = function() {
    var self = this;
    // define Location observable array () // Observables and Observable Arrays are JS Functions
    this.myLocations = ko.observableArray();
    this.filteredInput = ko.observable('');
    // this.locationsList = ko.observableArray();

    for (i = 0; i < locations.length; i++) {
        var place = new Location(locations[i]);
        self.myLocations.push(place);
    }

    // from http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
    this.searchFilter = ko.computed(function() {
        var filter = self.filteredInput().toLowerCase(); // listens to what user types in to the input search bar
        // iterates through myLocations observable array
        for (j = 0; j < self.myLocations().length; j++) {
        	// it filters myLocations as user starts typing
            if (self.myLocations()[j].name.toLowerCase().indexOf(filter) > -1) {
                self.myLocations()[j].show(true); // shows locations according to match with user key words
                if (self.myLocations()[j].marker) {
                    self.myLocations()[j].marker.setVisible(true); // shows/filters map markers according to match with user key words
                }
            } else {
                self.myLocations()[j].show(false); // hides locations according to match with user key words
                if (self.myLocations()[j].marker) {
                    self.myLocations()[j].marker.setVisible(false); // hides map markers according to match with user key words
                }
            }
        }
    });

    // map marker bounces when location is clicked on list
    // https://developers.google.com/maps/documentation/javascript/events
    this.showLocation = function(locations) {
        google.maps.event.trigger(locations.marker, 'click');
    };
  // set foursqError to false until the api call has run and we know if it has succeeded
 // self.foursqError = ko.observable(false);
};

// instantiate the ViewModel using the new operator and apply the bindings (aka activate KO)
var markersModel = new MarkersModel();

// activate knockout apply binding
ko.applyBindings(markersModel);
