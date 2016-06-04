var camera, scene, renderer, geometry, material, mesh;
var stockCubes = [];
var numCubes = 4;

var minRate = 0.02;
var maxRate = 0.08;


var maxSize = 70;


// colour management    //
var maxGreen = 0x248f24;
var maxRed = 0xe60000;
var middleYellow = 0xffcc00; 

// ---------------------- // 

var gainOrLoss = [];
var companyNames = ["LSE","FTSE","JPNX","SSE","JDX"];
var setLocations = [];
for (var i = 0 ; i < numCubes; i++){
    setLocations[i] = new THREE.Vector3(-450 +(i * 300), 0, 0);
}
var rotationRates = [0.02,0.02,0.04,0.01,0.07];
var indexChanges =[];
var lastUpdate = "";
var max = 0;





function interpolateRate(frac){
    return minRate + ((maxRate - minRate)*frac);
}



var settings = {
       "async": true,
       "crossDomain": true,
       "dataType": "json",
       "url": "/globalIndexQuery/",
       "method": "GET",
       "headers": {
         "accept": "application/json",
         "x-mashape-key": "APIKEY"
       }
    };




$.ajax(settings).done(function (response) {
    indexChanges[0] = response[0].index1Change;
    indexChanges[1] = response[0].index2Change;
    indexChanges[2] = response[0].index3Change;
    indexChanges[3] = response[0].index4Change;
    for (int i =0; i < 4; i++){
        if (Math.abs(indexChanges[i]) > max){
            max = Math.abs(indexChanges[i]);
        }
    }
    for (int i = 0; i < 4; i++){
        rotationRates[i] = interpolateRate(Math.abs(indexChanges[i])/ max);
    }
    lastUpdate = response[0].timeOfUpdate;
    

    console.log(response);
    init();
    animate();
    
});

//init();
//animate();
function createTextElement(text){
var canvas1 = document.createElement('canvas');
var context1 = canvas1.getContext('2d');
context1.font = " 20px Arial";
context1.fillStyle = "rgba(0,0,0,0.95)";
context1.fillText(text, 0, 50);
// canvas contents will be used for a texture
var texture1 = new THREE.Texture(canvas1);
texture1.needsUpdate = true;
var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
material1.transparent = true;
var mesh1 = new THREE.Mesh(
    new THREE.PlaneGeometry(canvas1.width, canvas1.height),
    material1
  );
return mesh1;
}

function interpolateColor(arg){
    if (arg > 0){
        return maxGreen;
    } else {
        return maxRed;
    }
}
function init() {
    container = document.getElementById( 'canvas' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, 1000/ 200, 1, 10000);
    camera.position.z = 350;
    camera.position.x = 0;
    camera.position.y = 0;
    scene.add(camera);

    // directional lighting     //
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 1, -1,25);
    scene.add( directionalLight );
    var directionalLight2 = new THREE.DirectionalLight(0xffffff,0.5);
    directionalLight2.position.set(0,-1,0);
    scene.add(directionalLight2);
    var directionaLight3  = new THREE.DirectionalLight(0xffffff,0.5);
    directionaLight3.position.set(0,1,0);
    scene.add(directionaLight3);
    var directionalLight4 = new THREE.DirectionalLight(0xffffff,0.5);
    directionalLight4.position.set(-1,0,0);
    scene.add(directionalLight4);
    // ---------------------- //

    for (var i = 0; i < numCubes; i++){
        r = maxSize;
        var mesh1 = undefined; 
        var locationSource;
        var geometry = new THREE.OctahedronGeometry( r,1 );
        var material = new THREE.MeshBasicMaterial( {color: interpolateColor(indexChanges[i]), specular: 0x555555, shininess: 15 } );; 
        var index; 
        var labelNames; 
        stockCubes[i] = new THREE.Mesh(geometry, material);
        if (i >= 0){
            locationSource = setLocations;
            labelNames = companyNames;
            index = i; 
        } 
        stockCubes[i].position.set(locationSource[index].x + r/2 , locationSource[index].y, locationSource[index].z);
        mesh1 = createTextElement(labelNames[index]);
        mesh1.position.set(stockCubes[i].position.x + 100,stockCubes[i].position.y - 150,  0);
        scene.add(mesh1);  
        scene.add(stockCubes[i]);
        console.log(stockCubes[i]);
        var helper = new THREE.EdgesHelper( stockCubes[i], 0xffffff ); // or THREE.WireframeHelper
        helper.material.linewidth = 0.05;
        scene.add( helper );
    }
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(1000, 150);
    renderer.setClearColor( 0xffffff, 0);
    container.appendChild( renderer.domElement );
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
function render() {
    for (var i = 0 ;i < numCubes;i++){
    stockCubes[i].rotation.x += rotationRates[i];
    }
    renderer.setClearColor( 0xffffff, 0);
    camera.lookAt( new THREE.Vector3(0,0,290) );
    renderer.render(scene, camera);
}