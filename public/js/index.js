// Get references to page elements
var $first_name = $("#first-name");
var $last_name = $("#last-name");
var $belt_color = $("#belt-color");
var $weight = $("#weight")
var $zipcode = $("#zipcode")
var $submitBtn = $("#submit");
var $competitorList = $("#competitor-list");
var $zipSubmit = $("#zipSubmit")

// The API object contains methods for each kind of request we'll make
var API = {
  saveCompetitor: function(saveCompetitor) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/competitors",
      data: JSON.stringify(saveCompetitor)
    });
  },
  getCompetitors: function() {
    return $.ajax({
      url: "api/competitors",
      type: "GET"
    });
  },
  deleteCompetitors: function(id) {
    return $.ajax({
      url: "api/competitors/" + id,
      type: "DELETE"
    });
  }
};

var compZip;

// refreshExamples gets new examples from the db and repopulates the list
var refreshCompetitors = function() {
  API.getCompetitors().then(function(data) {
    console.log(data)
    for (i = 0; i < data.length; i++) {
      compZip = data[i].zipcode
      console.log(compZip)
    }
    var $competitors = data.map(function(competitors) {
      var $a = $("<a>")
        .text(competitors.text)
        .attr("href", "/example/" + competitors.id);

      var $li = $("<li>")
        .attr({
          class: "list-group-item",
          "data-id": competitors.id
        })
        .append($a);

      var $button = $("<button>")
        .addClass("btn btn-danger float-right delete")
        .text("ｘ");

      $li.append($button);

      return $li;
    });

    $("#competitor-list").empty();
    $("#competitor-list").append($competitors);
  });
};

// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
var handleFormSubmit = function(event) {
  event.preventDefault();

  var competitors = {
    first_name: $("#first-name").val().trim(),
    last_name: $("#last-name").val().trim(),
    belt_color: $("#belt-color").val().trim(),
    weight: $("#weight").val().trim(),
    zipcode: $("#zipcode").val().trim()
  };

  if (!(competitors.first_name && competitors.last_name)) {
    alert("You must enter data in every field!");
    return;
  }

  API.saveCompetitor(competitors).then(function() {
    refreshCompetitors();
  });

  $("#first-name").val("");
  $("#last-name").val("");
  $("#belt-color").val("");
  $("#weight").val("");
  $("#zipcode").val("");
};

// handleDeleteBtnClick is called when an example's delete button is clicked
// Remove the example from the db and refresh the list
var handleDeleteBtnClick = function() {
  var idToDelete = $(this)
    .parent()
    .attr("data-id");

  API.deleteCompetitors(idToDelete).then(function() {
    refreshCompetitors();
  });
};

// Add event listeners to the submit and delete buttons

$submitBtn.on("click", handleFormSubmit);
$("#competitor-list").on("click", ".delete", handleDeleteBtnClick);


// Allows user to recenter map to their zipcode
var userLat;
var userLng;
var userZip;

var zipCollect = function(event) {
  event.preventDefault();

  userZip = $("#zip").val().trim()

  var geocoded = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userZip + "&key=AIzaSyDZYOxZZL8kgIlC4RLfG8Gkfr8xHnZmFTc"

  $.getJSON(geocoded, function(result){
    userLat = result.results[0].geometry.location.lat
    userLng = result.results[0].geometry.location.lng
    
    map.setCenter({lat: userLat, lng: userLng});
    var place = new google.maps.LatLng(userLat,userLng);
    var request = {
      query: "jiu jitsu gym",
      location: place,
      radius: "5000",
    };

    service = new google.maps.places.PlacesService(map);

    service.textSearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }

        }
      });
  })
  $("#zip").val("");
  
  API.getCompetitors().then(function(data) {
    for (i = 0; i < data.length; i++) {
      compZip = data[i].zipcode
      var zipApi = "https://www.zipcodeapi.com/rest/W0TmA20g0feVfyvAbCfQ8UsdpNp0AME9pphPY3GR3shPXVrJLnnd6YSvhdHaS00O/distance.json/" + userZip + "/" + compZip + "/mile"
      // $.getJSON(zipApi, function(results) {
      //   console.log(results.distance)
      // })
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", zipApi, true);
      var body = xmlhttp.response;
      console.log(body)
    }
  })
}

$zipSubmit.on("click", zipCollect);