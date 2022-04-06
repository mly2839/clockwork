
/*
    author: Michael Ly
    date: 4/6/2022
*/

//imports
import { Scene, Color, PerspectiveCamera, WebGLRenderer, ACESFilmicToneMapping, sRGBEncoding, Mesh, SphereBufferGeometry, MeshStandardMaterial, PMREMGenerator } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//scene
let scene = new Scene();
scene.background = new Color("white");

//camera
let camera = new PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0,0,10);

//renderer
let renderer = new WebGLRenderer({ antialias: true });
renderer.setSize( innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.outputEncoding = sRGBEncoding;
document.body.appendChild(renderer.domElement);

//adding in controls to move
let controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0);

//loading pmrem generator
let pmrem = new PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

//function to start up the rendering of the scene and camera
(async function init() {

    let envHdrTexture= await new RGBELoader().loadAsync("./assets/modals/cannon_1k_blurred.hdr")
    let envRT = pmrem.fromEquirectangular(envHdrTexture);

    //added a sphere to the scene
    let sphereMesh = new Mesh(
        new SphereBufferGeometry(2, 10, 10),
        new MeshStandardMaterial({ 
            envMap: envRT.texture,
            roughness: 0.2,
            metalness: 0.5,
        }),
    );
    scene.add(sphereMesh);
    
    //animation loop
    renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
    });
})();
