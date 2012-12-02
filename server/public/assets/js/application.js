$(document).ready(function() {
	$('#map').css('height', ($(window).height() - 160));
});

$(window).resize(function() {
	$('#map').css('height', ($(window).height() - 160));
}).resize();


var map = L.map('map').setView([49.27, -123.10], 13);

L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
}).addTo(map);



var popup = L.popup();


//load markers to map
$.ajax({
	type: "GET",
	url: "/marker",
}).done(function(markers) {
	$.each(markers, function(index, markerData) {
		var marker = L.marker({
			lat: markerData.lat,
			lng: markerData.lng
		});
		marker._id = markerData._id;
		marker.addTo(map);
		marker.on('click', onMarkerClick);
	});
});

var currentEditMarker;

function onMarkerClick(e) {

	currentEditMarker = e.target;


	$.ajax({
		type: "GET",
		url: "/marker/" + currentEditMarker._id,
	}).done(function(markerData) {
		$('#edit-marker-layer').text(markerData.layer);

		var created = new Date(parseInt(markerData._id.slice(0,8), 16)*1000);
		$('#edit-marker-username').html('<strong>' + markerData.username + '</strong> added this marker on ' + created.toString());
		
		var like_count = markerData.like_count;
		$('#like-count').html('<strong>' + markerData.like_count + '</strong>');

		$('#edit-marker-description').text(markerData.description);
		$('.edit-marker-popover').show();
	});

}

var currentMarker;

function onMapClick(e) {
	//popup.setLatLng(e.latlng).setContent("You clicked the map at " + e.latlng.toString()).openOn(map);
	$('.marker-popover').show();
	currentMarker = L.marker(e.latlng);
	map.addLayer(currentMarker);
}

map.on('click', onMapClick);


$(".popover .close").on('click', function() {
	if(currentMarker) map.removeLayer(currentMarker);
	currentMarker = null;
	$('.popover').hide();
});



$(".submit-marker").click(function() {

	$.ajax({
		type: "POST",
		url: "/marker",
		data: $(".marker-form").serialize() + '&lat=' + currentMarker.getLatLng().lat + '&lng=' + currentMarker.getLatLng().lng,
		success: function(data) {
			//alert(data); 
			$('.marker-popover').hide();
			currentMarker._id = data._id;
			currentMarker.on('click', onMarkerClick);
			currentMarker = null;

			$('.marker-form')[0].reset();

		}
	});

	return false;
});


$(".cancel-marker").click(function() {

	if(currentMarker) map.removeLayer(currentMarker);
	$('.marker-popover').hide();
	currentMarker = null;


	return false;
});



$(".support-marker").click(function() {
	if(!currentEditMarker)
		return;

	$.ajax({
		type: "PUT",
		url: "/marker/support/"+currentEditMarker._id,
		data: {},
		success: function(markerData) {
			$('#like-count').html('<strong>' + markerData.like_count + '</strong>');
			currentMarker = null;

		}
	});

	return false;
});

$(function() {
  // Handler for .ready() called.
  //load markers to map
  $.ajax({
    type: "GET",
    url: "/marker",
  }).done(function(markers) {
    $.each(markers, function(index, markerData) {
      var marker = L.marker({
        lat: markerData.lat,
          lng: markerData.lng
      });
      var created = new Date(parseInt(markerData._id.slice(0,8), 16)*1000);
      var min = created.getMinutes().toString();
      min = min.length > 1 ? min : '0' + min;
      var listItem = '<li><a class="list_item" data-marker='+markerData._id+' href="#">'+markerData.username+'</a> ' + created.toDateString() + ' at '+ created.getHours().toString() + ':' + min + '</li>';
      $('.nav.nav-list').append(listItem).on('click', function(e) {
        var id = $(e.target).data('marker');
        $.ajax({
          type: "GET",
          url: "/marker/" + id,
        }).done(function(markerData) {
          $('#edit-marker-layer').text(markerData.layer);
          $('#edit-marker-username').html('<strong>' + markerData.username + '</strong> added this marker on ' + created.toString());

          var like_count = markerData.like_count;
          $('#like-count').html('<strong>' + markerData.like_count + '</strong>');

          $('#edit-marker-description').text(markerData.description);
          $('.edit-marker-popover').show();
        });
      });
    });
  });
});
