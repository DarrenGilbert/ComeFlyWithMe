var startTime = Date.now();

var lat = 51.500183;
var lng = -0.1290511;
var lastLat;
var lastLng;

var map;
var camera;
var renderer;
var scene;
var material;

require(["esri/map", "esri/geometry/Point"], function (Map, Point) {
	map = new Map("map", {
		center: [lng, lat],
		zoom: 18,
		basemap: "satellite"
	});
	init();
	getWeather(lat, lng);
});

function init() {

	container = document.createElement('div');
	document.body.appendChild(container);


	container.style.position = 'absolute';
	container.style.top = '0px';

	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 3000);
	camera.position.z = 5000;
	camera.position.y = 1000;

	scene = new THREE.Scene();

	geometry = new THREE.Geometry();

	var texture = THREE.ImageUtils.loadTexture('img/cloud10.png', null, animate);
	texture.magFilter = THREE.LinearMipMapLinearFilter;
	texture.minFilter = THREE.LinearMipMapLinearFilter;

	material = new THREE.ShaderMaterial({
		uniforms: {
			"map": {
				type: "t",
				value: texture
			}
		},
		vertexShader: document.getElementById('vs').textContent,
		fragmentShader: document.getElementById('fs').textContent,
		depthWrite: false,
		depthTest: false,
		transparent: true
	});

	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	mesh = new THREE.Mesh(geometry, material);
	mesh.position.z = -8000;
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer({
		antialias: false
	});
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);
}

function checkFlight() {
	var term = $('form>input').val();
	$.ajax({
		url: '/api/flight/search?query=' + term
	}).done(function (data) {
		if (data.error) {
			showError();
		} else {}
	}).error(function () {
		showError();
	})
	return false;
}

function showError() {
	var button = $('form>button');
	button.css('background-color', '#902636');
	button[0].innerHTML = "OOPS";
}

function clearError() {
	var button = $('form>button');
	button.css('background-color', '#28303B');
	button[0].innerHTML = "FLY";
}

function getWeather(lat, lng) {
	$.ajax({
		url: "/api/weather/?lat=" + lat + "&lng=" + lng,
	}).done(function (data) {
		var weatherData = JSON.parse(data);
		calculateLightLevel(weatherData.dt, weatherData.sys.sunrise, weatherData.sys.sunset);
		generateClouds(weatherData.clouds.all);
	});
}

function calculateLightLevel(date, sunrise, sunset) {
	if (date > sunrise && date < sunset) {
		$('#timeOverlay').css('background-color', 'rgba(0, 0, 0, 0.1)');
	} else {
		$('#timeOverlay').css('background-color', 'rgba(0, 0, 0, 0.77)');
	}
}

function onWindowResize(event) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	position = ((Date.now() - startTime) * 0.03) % 4000;

	camera.position.z = -position + 4000;
	camera.rotation.x = -Math.PI / 2;
	camera.rotation.y = 0;

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function generateClouds(clouds) {
	clouds = clouds / 10;
	var length = scene.children.length;
	for (var i = 0; i < length; i++) {
		scene.remove(scene.children[0])
	}
	geometry = new THREE.Geometry();
	plane = new THREE.Mesh(new THREE.PlaneGeometry(64, 64));
	var p = 4000 / (clouds + 1);
	for (var i = 0; i < p; i++) {
		plane.position.x = Math.random() * 1000 - 500;
		plane.position.y = Math.random() * Math.random() * 1200 - 15;
		plane.position.z = i * (clouds + 1);
		plane.rotation.z = Math.random() * Math.PI;
		plane.scale.x = plane.scale.y = Math.random() * Math.random() * 5 + 0.5;
		plane.rotation.x = 180;
		THREE.GeometryUtils.merge(geometry, plane);
	}
	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
}
