var map;
var clientID;
var clientSecret;

var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.long = data.long;
	this.url = data.url;
	this.address= data.address;
	this.contact = data.contact;
	//this.venues.id = "";

	this.visible = ko.observable(true);

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170801';// + '&query=' auto;

	$.ajax({
                //type: 'GET',
                url: foursquareURL,
                dataType: "json",
                data: {
                    client_id: clientID,
                    client_secret: clientSecret,
                    query: "auto", // gets data from marker.name (array of object)
                    near: "Orlando",
                    v: 20170801// version equals date
                },
                success: function() {
                    // console.log(data);
                    for (var i=0; i< data.length; i++){
                    // get venue info
                    venues = data.response.venues.name[0];
                    // get venue address info
                    address = data.response.venues.location.formattedAddress[0];
                    // get venue category info
                    contact = data.response.venues.contact.phone[0];
                    // gets link of place
                    foursquareId = data.response.venues.id[0];
                    // populates infowindow with api info
                    //contentString = "<div class='info-window-content'>" + "Name: " + "<span class='info'>" + self.name + "</span></div>" +
                    //    "<div class='content'>" + "Category: " + "<span class='info'>" + self.category + "</span></div>" +
                     //   "<div class='content'>" + "Address: " + "<span class='info'>" + self.address + "</span></div>" +
                     //   "<div class='content'>" + "More info: " + "<a href='" + self.foursquareId + "'>" + "Click here" + "</a></div>";
                    }    

                    //marker.contentString;
                },
                error: function() {
                   var contentString = "<div class='name'>Foursquare data is currently not available. Please try again.</div>";
                }
     });           
	this.contentString = '<div class="info-window-content"><div class="title"><b>' + self.name + "</b></div>" +
        //'<div class="content"><a href="' + self.venues +'">' + self.venues + "</a></div>" +
        '<div class="content">' + self.address + "</div>" +
        '<div class="content">' + self.contact+ "</div>" +
        '<div class="content">' + self.foursquareId + "</div></div>";

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(self.lat, self.long),
			map: map,
			title: self.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + self.name + "</b></div>" +
        //'<div class="content"><a href="' + self.venues +'">' + self.venues + "</a></div>" +
        '<div class="content">' + self.address + "</div>" +
        '<div class="content">' + self.contact + "</div>" +
        '<div class="content"><a href="URL:' + self.foursquareId +'">' + self.foursquareId +"</a></div></div>";

        self.infoWindow.setContent(self.contentString);

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

	locationslist.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
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