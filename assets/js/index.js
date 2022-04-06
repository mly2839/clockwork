
/*
    author: Michael Ly
    date: 4/6/2022
*/

//imports
import { Scene, Color, PerspectiveCamera, WebGLRenderer, ACESFilmicToneMapping, sRGBEncoding, Mesh, SphereBufferGeometry, MeshStandardMaterial, PMREMGenerator, RingGeometry, DoubleSide, CylinderBufferGeometry, Group, Vector2, BoxBufferGeometry } from "three";
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

//mouse movement
let mousePos = new Vector2(0,0);

window.addEventListener("mousemove", (e) => {
    let x = e.clientX - innerWidth * 0.5;
    let y = e.clientY - innerHeight * 0.5;

    mousePos.x = x * 0.001;
    mousePos.y = y * 0.001;
});

//function to start up the rendering of the scene and camera
(async function init() {

    //setting up environment textures
    let envHdrTexture= await new RGBELoader().loadAsync("./assets/modals/cannon_1k_blurred.hdr")
    let envRT = pmrem.fromEquirectangular(envHdrTexture);

    //adding the rings
    let ring1 = CustomRing(envRT, 0.65, "white");
    ring1.scale.set(0.75, 0.75);
    scene.add(ring1);

    let ring2 = CustomRing(envRT, 0.35, new Color(0.25, 0.225, 0.215));
    ring2.scale.set(1.05, 1.05);
    scene.add(ring2);

    let ring3 = CustomRing(envRT, 0.15, new Color(0.7, 0.7, 0.7));
    ring3.scale.set(1.3, 1.3);
    scene.add(ring3);

    scene.add()
    
    //animation loop
    renderer.setAnimationLoop(() => {

        //rotating the rings
        ring1.rotation.x = ring1.rotation.x * 0.95 + (mousePos.y * 1.2) * 0.05;
        ring1.rotation.y = ring1.rotation.y * 0.95 + (mousePos.x * 1.2) * 0.05;

        ring2.rotation.x = ring2.rotation.x * 0.95 + (mousePos.y * 0.375) * 0.05;
        ring2.rotation.y = ring2.rotation.y * 0.95 + (mousePos.x * 0.375) * 0.05;

        ring3.rotation.x = ring3.rotation.x * 0.95 + (-mousePos.y * 0.275) * 0.05;
        ring3.rotation.y = ring3.rotation.y * 0.95 + (-mousePos.x * 0.275) * 0.05;

        controls.update();
        renderer.render(scene, camera);
    });
})();

//function to make the rings of the clock
function CustomRing(envRT, thickness, color) {

    let ring = new Mesh(
        new RingGeometry(2, 2 + thickness, 70),
        new MeshStandardMaterial({ 
            envMap: envRT.texture,
            roughness: 0,
            metalness: 1,
            side: DoubleSide,
            color,
            envMapIntensity: 1
        })
    );
    ring.position.set(0,0, 0.25*0.5);

    let outerCylynder = new Mesh(
        new CylinderBufferGeometry(2 + thickness, 2 + thickness, 0.25, 70, 1, true),
        new MeshStandardMaterial({ 
            envMap: envRT.texture,
            roughness: 0,
            metalness: 1,
            side: DoubleSide,
            color,
            envMapIntensity: 1
        })
    );
    outerCylynder.rotation.x = Math.PI * 0.5;

    let innerCylynder = new Mesh(
        new CylinderBufferGeometry(2, 2 , 0.25, 140, 1, true),
        new MeshStandardMaterial({ 
            envMap: envRT.texture,
            roughness: 0,
            metalness: 1,
            side: DoubleSide,
            color,
            envMapIntensity: 1
        })
    );
    innerCylynder.rotation.x = Math.PI * 0.5;

    let group = new Group();
    group.add(ring, outerCylynder, innerCylynder);

    return group;
}

