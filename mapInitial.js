var currentmap;
var secondIter=false;
var lines;
var marks;
var previousLat = 0.0;
var previousLong = 0.0;
var layerName= 'States';

function doMap()
{
	mymap = L.map('mapid', {
		center: [10.8505, 76.2711],
		zoom: 7,
	});
	var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
			
	var grayscale   = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr, accessToken:'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'});
	var	streets  = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, accessToken:'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'});
	var googleSat = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr, accessToken:'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'});
	var myLayer = L.tileLayer.wms('http://desktop-araudbg:8080/geoserver/training/wms?',{
					layers:layerName,
					format:'image/png',
					transparent:true,
	});
	
	mymap.addLayer(streets);
	
	var baseLayers = {
		 "Grayscale": grayscale,
		 "Streets": streets,
         "Satellite":googleSat,
	};
	
	marks=L.layerGroup();
	lines = L.layerGroup();
	var overlays = {
		"Lines": lines,
		"Marks":marks,
		"My Layer":myLayer, 
               
	};
	L.control.layers(baseLayers, overlays).addTo(mymap);

	mymap.on('click', function(ev) {
    showFeatureData(ev); // ev is an event object (MouseEvent in this case)
});
	currentmap=mymap;


}

function drawployline(x)
{
    
        var selected = x.rowIndex;
        var name = document.getElementById("justtable").rows[selected].cells[0].innerHTML;
        var loc = document.getElementById("justtable").rows[selected].cells[1].innerHTML;
       var latlong =  loc.split(',');
       var latitude = parseFloat(latlong[0]);
       var longitude = parseFloat(latlong[1]);
	   L.marker([latitude, longitude]).bindPopup(name).addTo(currentmap).addTo(marks).openPopup();
       
       if(secondIter && previousLat != latitude && previousLong != longitude)
       {
			
			var latlngs = [[previousLat,previousLong],[latitude, longitude]];
			var polyline = L.polyline(latlngs, {color: 'red'}).addTo(currentmap).addTo(lines);
			currentmap.fitBounds(polyline.getBounds());
       }
       previousLat=latitude;
	   previousLong=longitude;
	   secondIter=true;

}

function showFeatureData(ev)
{
	
	// https://cors-anywhere.herokuapp.com/
	var url1="http://desktop-araudbg:8080/geoserver/training/wms?request=GetFeatureInfo&service=WMS&version=1.1.1&layers="+layerName+"&styles=&srs=EPSG%3A4326&format=image%2Fpng"+
				"&bbox="+currentmap.getBounds().toBBoxString()+
				"&width="+currentmap.getSize().x+
				"&height="+currentmap.getSize().y+
				"&query_layers="+layerName+
				"&info_format=text%2Fplain"+
				"&feature_count=50"+
				"&x="+(currentmap.layerPointToContainerPoint(ev.layerPoint).x|0)+
				"&y="+(currentmap.layerPointToContainerPoint(ev.layerPoint).y|0)+
				"&exceptions=application%2Fvnd.ogc.se_xml";
				//alert(currentmap.layerPointToContainerPoint(ev.layerPoint).x|0);
	//alert(currentmap.getBounds().toBBoxString()+"\n"+(ev.layerPoint.x|0)+"  "+(ev.layerPoint.y|0));
	//window.open(url1);
	
	/* var dd=get_data_from_url(url1,ev); */
	//console.log(dd);<iframe src="./myPopup.html"></iframe>
	//'+url1+'&output=embed
	
	
	
	var pop2=new L.Popup({maxWidth:1000});
		pop2.setLatLng(ev.latlng);
		pop2.setContent('<iframe src="'+url1+'" width="400" height="100"></iframe>');
		currentmap.openPopup(pop2);
		
		
		
	//currentmap.openPopup(pop2);
	//fetch(url1, {mode:'cors'}).then(data => console.log(data));;
	//alert(get_data_from_url(url1)+" hi");
	/* var jobj=JSON.parse(get_data_from_url(url1));
	if(jobj != null)
	{
		delete jobj["geometry"];
	}
	console.log(jobj.toString()); */
	//'<iframe src='<iframe src="'+url1+'" width="400" height="100"></iframe>'
}

var http_req;

function get_data_from_url(url,ev){
    http_req = new XMLHttpRequest();
    http_req.open("GET",url,true);
	http_req.onload = function() {
		var pop2=new L.Popup({maxWidth:1000});
		pop2.setLatLng(ev.latlng);
		pop2.setContent(http_req.responseText);
		currentmap.openPopup(pop2);
    };
    http_req.send(null);
    return http_req.responseText;          
}

