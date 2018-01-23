/** ###################################
 *  Get location based on user input
 ###################################*/
const GOOGLE_MAPS_KEY = 'AIzaSyBpyEqJqLkmzO-z4rvLpide51lqGRskES4';

var placeSearch, autocomplete, currentLocation;


function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
        { types: ['geocode'] });

    autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
    var place = autocomplete.getPlace();
    currentLocation = {
        lat: place.geometry.location.lat(),
        lag: place.geometry.location.lng()
    }
}


function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}

/** ####################    
 *  Angular controller  
    ####################*/
var app = angular.module("main", []);
app.controller('main-control', function ($scope, $http) {

    let counter = {};

    $scope.mylocation = '';
    $scope.results = [];
    $scope.winner;

    $scope.displayBranchesResults = () => {
        $scope.results = [];
        counter = {};
        data.forEach((company) => {
            company.branchs.forEach(branch => {

                let resultItem = {
                    name: company.name,
                    location: branch.location,
                    place_id: branch.place_id,
                    distance: calcDistanceToMe(branch.geolocation).toFixed(3)
                };

                $scope.results.push(resultItem);
                calculateParimiter(resultItem);
            });
        });
        calculateWinner();
    };

    function calculateParimiter(resultItem) {
        if (typeof counter[resultItem.name] === 'undefined') {
            counter[resultItem.name] = 0;
        }
        if (resultItem.distance < 3) {
            counter[resultItem.name] = counter[resultItem.name] + 1;
        }
    }

    function calculateWinner() {
        let winnerCouter = 0;
        let winnerComp = '';
        for (var company in counter) {
            if (winnerCouter < counter[company]) {
                winnerCouter = counter[company];
                winnerComp = company;
            }
        }
        $scope.winner = {
            name: winnerComp,
            counter: winnerCouter,
        }
    }

    /** Converts numeric degrees to radians */
    if (typeof (Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function () {
            return this * Math.PI / 180;
        }
    }

    function calcDistanceToMe(geolocation) {
        const { lat: lon1, lag: lat1 } = currentLocation;
        const { lat: lon2, lag: lat2 } = geolocation;

        const R = 6371; // Radius of the earth in km
        let dLat = (lat2 - lat1).toRad();  // Javascript functions in radians
        let dLon = (lon2 - lon1).toRad();
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c; // Distance in km
        return Number(d);
    }
});