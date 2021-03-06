// Get references to page elements
var $first_name = $("#first-name");
var $last_name = $("#last-name");
var $belt_color = $("#belt-color");
var $weight = $("#weight");
var $zipcode = $("#zipcode");
var $submitBtn = $("#submit");
var $competitorList = $("#competitor-list");
var $zipSubmit = $("#zipSubmit");



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

// refreshExamples gets new examples from the db and repopulates the list
var refreshCompetitors = function(matches) {
  let $matchedCompetitors;
  if (matches && matches.length > 0) {
    $matchedCompetitors = matches.map(match => {
      const $rowData = [
        $("<td>").text(match.id),
        $("<td>").text(`${match.first_name} ${match.last_name}`),
        $("<td>").text(match.belt_color),
        $("<td>").text(match.weight),
        $("<td>").text(match.zipcode),
        $("<td>").append(
          $("<button>")
            .addClass("btn btn-danger float-right delete")
            .text("x")
        )
      ];
      const $row = $("<tr>").attr("data-id", match.id);
     return ($row.append($rowData));
    });
  } else {
    $matchedCompetitors = $("<tr>").text("no matches");
  }
  $("#competitor-list").empty();
  $("#competitor-list").append($matchedCompetitors);
  $("#competitorHeader").text("Your Matches:");
};
// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
var handleFormSubmit = function(event) {
  event.preventDefault();

  var competitor = {
    first_name: $("#first-name").val().trim(),
    last_name: $("#last-name").val().trim(),
    belt_color: $("#belt-color").val().trim(),
    weight: $("#weight").val().trim(),
    zipcode: $("#zipcode").val().trim()
  };

  if (!(competitor.first_name && competitor.last_name)) {
    alert("You must enter data in every field!");
    return;
  }

  API.saveCompetitor(competitor).then(function(res) {
    refreshCompetitors(res);
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
    .parent()
    .attr("data-id");

  API.deleteCompetitors(idToDelete).then(function() {
    API.getCompetitors().then(function(res){
      console.log(res);
      refreshCompetitors(res);
    });
  });
};

// Add event listeners to the submit and delete buttons

$submitBtn.on("click", handleFormSubmit);
$("#competitor-list").on("click", ".delete", handleDeleteBtnClick);


// Allows user to recenter map to their zipcode
var userLat;
var userLng;
var userZip;
var compZip;

var zipCollect = function(event) {
  event.preventDefault();
  userZip = $("#zip").val().trim()

  var geocoded = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userZip + "&key=AIzaSyDZYOxZZL8kgIlC4RLfG8Gkfr8xHnZmFTc"
  $.getJSON(geocoded, function(result){
    userLat = result.results[0].geometry.location.lat
    userLng = result.results[0].geometry.location.lng
    console.log(geocoded);
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
  // API.getCompetitors().then(function(data) {
  //   for (i = 0; i < data.length; i++) {
  //     compZip = data[i].zipcode
  //   }
  // })
  // var distance = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + userZip + "&destinations=" + compZip + "&key=AIzaSyDZYOxZZL8kgIlC4RLfG8Gkfr8xHnZmFTc"
  // console.log(distance.rows.elements.distance)
  })
  $("#zip").val("");
}

$zipSubmit.on("click", zipCollect);
