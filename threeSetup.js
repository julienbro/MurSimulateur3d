import * as CONFIG from './config.js';

export let scene, camera, renderer, controls, raycaster, mousePointer, plane, initialPerspectiveFOV;
export let textureLoader; // Added export

// Placeholder for viewportContainer, should be passed or imported from uiUtils
let viewportContainerRef; 

export function initThreeJS(viewportContainerElement, canvasContainerElement, onShadowsEnabled) {
    viewportContainerRef = viewportContainerElement; // Store reference
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xADD8E6);

    camera = new THREE.PerspectiveCamera(50, viewportContainerRef.clientWidth / viewportContainerRef.clientHeight, 0.1, 1000);
    initialPerspectiveFOV = camera.fov;
    camera.position.copy(CONFIG.initialCameraPosition);
    camera.lookAt(CONFIG.initialCameraLookAt);

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(viewportContainerRef.clientWidth, viewportContainerRef.clientHeight);
    renderer.shadowMap.enabled = onShadowsEnabled; // Use passed state
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainerElement.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.1;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI - 0.01;
    controls.target.copy(CONFIG.initialCameraLookAt);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 30, 10);
    directionalLight.castShadow = onShadowsEnabled; // Use passed state
    directionalLight.shadow.mapSize.width = 8192;
    directionalLight.shadow.mapSize.height = 8192;
    directionalLight.shadow.camera = new THREE.OrthographicCamera(-15, 15, 15, -15, 0.1, 50);
    directionalLight.shadow.bias = -0.00005;
    scene.add(directionalLight);

    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, side: THREE.DoubleSide, roughness: 0.9, metalness: 0.1 });
    planeMaterial.shadowSide = THREE.FrontSide;
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.name = "GroundPlane";
    scene.add(plane);

    const gridHelper = new THREE.GridHelper(100, 100, 0xaaaaaa, 0xcccccc);
    gridHelper.name = "GridHelper";
    gridHelper.visible = false;
    scene.add(gridHelper);

    raycaster = new THREE.Raycaster();
    mousePointer = new THREE.Vector2();
    textureLoader = new THREE.TextureLoader(); // Initialize textureLoader here
}

export function animate(onAnimateCallbacks = []) { // Allow passing callbacks
    requestAnimationFrame(() => animate(onAnimateCallbacks));
    controls.update();
    onAnimateCallbacks.forEach(cb => cb()); // Execute callbacks
    renderer.render(scene, camera);
}

export function onWindowResize() {
    if (!camera || !renderer || !viewportContainerRef) return;
    const newWidth = viewportContainerRef.clientWidth;
    const newHeight = viewportContainerRef.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}

export function setView(viewType) {
    if (!camera || !controls) return;
    const dist = 5;
    const center = new THREE.Vector3(0, 0.5, 0);
    controls.enabled = true;
    controls.enableRotate = true;
    camera.fov = initialPerspectiveFOV;
    camera.up.set(0, 1, 0);
    switch (viewType) {
        case '3d':
            camera.position.copy(CONFIG.initialCameraPosition);
            controls.target.copy(CONFIG.initialCameraLookAt);
            break;
        case 'top':
            camera.position.set(center.x, center.y + dist, center.z + 0.01);
            controls.target.copy(center);
            camera.lookAt(center);
            controls.enableRotate = false;
            break;
        case 'front':
            camera.position.set(center.x, center.y, center.z + dist);
            controls.target.copy(center);
            camera.lookAt(center);
            controls.enableRotate = false;
            break;
        case 'back':
            camera.position.set(center.x, center.y, center.z - dist);
            controls.target.copy(center);
            camera.lookAt(center);
            controls.enableRotate = false;
            break;
        case 'left':
            camera.position.set(center.x - dist, center.y, center.z);
            controls.target.copy(center);
            camera.lookAt(center);
            controls.enableRotate = false;
            break;
        case 'right':
            camera.position.set(center.x + dist, center.y, center.z);
            controls.target.copy(center);
            camera.lookAt(center);
            controls.enableRotate = false;
            break;
    }
    camera.updateProjectionMatrix();
    controls.update();
}
