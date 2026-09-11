/**
 * LOST TREASURE: THREE.JS 3D WEBGL ENGINE & PROCEDURAL 3D MODELS
 * Renders interactive 3D models of the Aztec Sun Medallion, Brass Astrolabe,
 * Cursed Emerald Skull, and Serpent Key with real-time lighting and mouse interaction.
 */

class LostTreasure3D {
  constructor() {
    this.isThreeAvailable = typeof THREE !== 'undefined';
  }

  /**
   * Initialize a 3D Hero Model Viewer (used on login.php and register.php)
   */
  initHeroModel(containerId, modelType = 'sun_medallion') {
    if (!this.isThreeAvailable) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth || 160;
    const height = container.clientHeight || 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3d1, 0.8);
    scene.add(ambientLight);

    const goldPointLight = new THREE.PointLight(0xffd700, 2.5, 50);
    goldPointLight.position.set(4, 4, 4);
    scene.add(goldPointLight);

    const seaCyanLight = new THREE.PointLight(0x17bebb, 1.5, 50);
    seaCyanLight.position.set(-4, -2, 2);
    scene.add(seaCyanLight);

    // Create 3D Model
    let modelGroup;
    if (modelType === 'sun_medallion') {
      modelGroup = this.createAztecMedallion();
    } else if (modelType === 'astrolabe') {
      modelGroup = this.createAstrolabe();
    } else if (modelType === 'cursed_skull') {
      modelGroup = this.createCursedSkull();
    } else {
      modelGroup = this.createAztecMedallion();
    }
    scene.add(modelGroup);

    // Mouse Interaction (Click & Drag to rotate)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0;
    let targetRotationY = 0;

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) {
        // Parallax hover sway
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        targetRotationY = ((e.clientX - centerX) / window.innerWidth) * 1.5;
        targetRotationX = ((e.clientY - centerY) / window.innerHeight) * 1.5;
        return;
      }
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      modelGroup.rotation.y += deltaX * 0.02;
      modelGroup.rotation.x += deltaY * 0.02;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        modelGroup.rotation.y += 0.012;
        modelGroup.rotation.x = THREE.MathUtils.lerp(modelGroup.rotation.x, targetRotationX, 0.08);
        modelGroup.position.y = Math.sin(elapsedTime * 2) * 0.12;
      }

      goldPointLight.position.x = Math.sin(elapsedTime * 1.5) * 5;
      goldPointLight.position.y = Math.cos(elapsedTime * 1.5) * 5;

      renderer.render(scene, camera);
    };

    animate();
    return { scene, camera, renderer, modelGroup };
  }

  /**
   * Procedural 3D Model: Aztec Sun Medallion
   */
  createAztecMedallion() {
    const group = new THREE.Group();

    // 1. Coin Body
    const coinGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.18, 48);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.28
    });
    const coin = new THREE.Mesh(coinGeo, goldMat);
    coin.rotation.x = Math.PI / 2;
    group.add(coin);

    // 2. Raised Aztec Outer Rim
    const rimGeo = new THREE.TorusGeometry(1.58, 0.1, 16, 48);
    const darkGoldMat = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      metalness: 0.9,
      roughness: 0.2
    });
    const rim = new THREE.Mesh(rimGeo, darkGoldMat);
    group.add(rim);

    // 3. Sun Ray Triangular Teeth (12 rays around circumference)
    const rayMat = new THREE.MeshStandardMaterial({
      color: 0xf3e5ab,
      metalness: 0.9,
      roughness: 0.25
    });
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const rayGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.x = Math.cos(angle) * 1.4;
      ray.position.y = Math.sin(angle) * 1.4;
      ray.rotation.z = angle - Math.PI / 2;
      ray.position.z = 0.08;
      group.add(ray);

      // Back side ray
      const rayBack = ray.clone();
      rayBack.position.z = -0.08;
      group.add(rayBack);
    }

    // 4. Center Aztec Sun God Visage (Tonatiuh)
    const faceGeo = new THREE.DodecahedronGeometry(0.65, 1);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.92,
      roughness: 0.18
    });
    const face = new THREE.Mesh(faceGeo, centerMat);
    face.position.z = 0.12;
    group.add(face);

    // Back face
    const backFace = face.clone();
    backFace.position.z = -0.12;
    group.add(backFace);

    // Glowing Inner Core
    const coreGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffeedd });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    return group;
  }

  /**
   * Procedural 3D Model: Brass Navigational Astrolabe
   */
  createAstrolabe() {
    const group = new THREE.Group();

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc59b27,
      metalness: 0.88,
      roughness: 0.22
    });

    const darkBrassMat = new THREE.MeshStandardMaterial({
      color: 0x7c5727,
      metalness: 0.85,
      roughness: 0.35
    });

    // 1. Outer Ring (Mater)
    const outerRingGeo = new THREE.TorusGeometry(1.6, 0.12, 16, 64);
    const outerRing = new THREE.Mesh(outerRingGeo, brassMat);
    group.add(outerRing);

    // 2. Top Suspension Shackle Ring
    const shackleGeo = new THREE.TorusGeometry(0.4, 0.06, 16, 32);
    const shackle = new THREE.Mesh(shackleGeo, brassMat);
    shackle.position.y = 1.9;
    group.add(shackle);

    // 3. Middle Rotating Rete (Zodiac Lattice)
    const reteGeo = new THREE.TorusGeometry(1.0, 0.06, 16, 32);
    const rete = new THREE.Mesh(reteGeo, darkBrassMat);
    rete.rotation.x = 0.2;
    group.add(rete);

    // 4. Rotating Sighting Alidade (Pointer Needle)
    const alidadeGeo = new THREE.BoxGeometry(3.1, 0.14, 0.08);
    const alidade = new THREE.Mesh(alidadeGeo, brassMat);
    alidade.position.z = 0.15;
    alidade.rotation.z = Math.PI / 4;
    group.add(alidade);

    // 5. Center Pivot Pin & Rose
    const pinGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.35, 24);
    const pin = new THREE.Mesh(pinGeo, brassMat);
    pin.rotation.x = Math.PI / 2;
    group.add(pin);

    return group;
  }

  /**
   * Procedural 3D Model: Cursed Emerald Aztec Skull
   */
  createCursedSkull() {
    const group = new THREE.Group();

    const boneMat = new THREE.MeshStandardMaterial({
      color: 0x223326,
      roughness: 0.5,
      metalness: 0.2
    });

    // 1. Cranium
    const craniumGeo = new THREE.SphereGeometry(1.2, 24, 20);
    craniumGeo.scale(1, 1.15, 1.1);
    const cranium = new THREE.Mesh(craniumGeo, boneMat);
    group.add(cranium);

    // 2. Jaw & Cheekbones
    const jawGeo = new THREE.BoxGeometry(1.0, 0.8, 1.1);
    const jaw = new THREE.Mesh(jawGeo, boneMat);
    jaw.position.set(0, -0.85, 0.2);
    group.add(jaw);

    // 3. Glowing Emerald Eye Sockets
    const eyeGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x2ecc71,
      emissive: 0x27ae60,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.9
    });

    const leftEye = new THREE.Mesh(eyeGeo, emeraldMat);
    leftEye.position.set(-0.45, 0.1, 0.95);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, emeraldMat);
    rightEye.position.set(0.45, 0.1, 0.95);
    group.add(rightEye);

    // Green Cursed Fire Point Light
    const skullLight = new THREE.PointLight(0x2ecc71, 3, 8);
    skullLight.position.set(0, 0, 1.2);
    group.add(skullLight);

    return group;
  }

  /**
   * Procedural 3D Model: Serpent Bone Key
   */
  createSerpentKey() {
    const group = new THREE.Group();

    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xeae0c8,
      roughness: 0.45,
      metalness: 0.15
    });

    const jadeMat = new THREE.MeshStandardMaterial({
      color: 0x1abc9c,
      emissive: 0x16a085,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.7
    });

    // 1. Key Bow (Coiled Viper Loop)
    const bowGeo = new THREE.TorusGeometry(0.7, 0.12, 16, 32);
    const bow = new THREE.Mesh(bowGeo, boneMat);
    bow.position.y = 1.4;
    group.add(bow);

    // 2. Center Jade Eye inside Bow
    const jadeOrbGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const jadeOrb = new THREE.Mesh(jadeOrbGeo, jadeMat);
    jadeOrb.position.y = 1.4;
    group.add(jadeOrb);

    // 3. Spinal Column Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.4, 16);
    const shaft = new THREE.Mesh(shaftGeo, boneMat);
    group.add(shaft);

    // Vertebrae Ribs along shaft
    for (let y = -0.6; y <= 0.6; y += 0.4) {
      const ribGeo = new THREE.TorusGeometry(0.24, 0.05, 8, 16);
      const rib = new THREE.Mesh(ribGeo, boneMat);
      rib.position.y = y;
      rib.rotation.x = Math.PI / 2;
      group.add(rib);
    }

    // 4. Serpent Teeth Bit (Key ward)
    const bitGeo = new THREE.BoxGeometry(0.45, 0.5, 0.1);
    const bit = new THREE.Mesh(bitGeo, boneMat);
    bit.position.set(0.3, -1.0, 0);
    group.add(bit);

    return group;
  }

  /**
   * Initialize the 3D Relic Inspector Viewer Modal in index.php
   */
  initInteractiveRelicModal(containerId, relicId) {
    if (!this.isThreeAvailable) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfff5e4, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 2.5, 20);
    pointLight.position.set(3, 3, 4);
    scene.add(pointLight);

    let model;
    if (relicId === 'brass_astrolabe' || relicId === 'celestial_monocle') {
      model = this.createAstrolabe();
    } else if (relicId === 'aztec_sun_medallion') {
      model = this.createAztecMedallion();
    } else if (relicId === 'cursed_emerald_skull' || relicId === 'emerald_skull') {
      model = this.createCursedSkull();
    } else if (relicId === 'skeleton_key' || relicId === 'venom_ward_key' || relicId === 'serpent_key') {
      model = this.createSerpentKey();
    } else {
      model = this.createAztecMedallion();
    }
    scene.add(model);

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => isDragging = false);

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      model.rotation.y += dx * 0.015;
      model.rotation.x += dy * 0.015;
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isDragging) {
        model.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();
  }

  /**
   * Procedural 3D Model: Interactive 3D Cipher Wheel
   * Outer fixed ring with ancient runes + inner rotating disc with alphabet
   */
  createCipherWheelGroup() {
    const group = new THREE.Group();

    // 1. Outer Bronze Disc Frame
    const outerGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.15, 48);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x8b6b3e,
      metalness: 0.8,
      roughness: 0.3
    });
    const outerDisc = new THREE.Mesh(outerGeo, outerMat);
    outerDisc.rotation.x = Math.PI / 2;
    group.add(outerDisc);

    // 2. Outer Raised Rim with Runes notches
    const outerRimGeo = new THREE.TorusGeometry(2.18, 0.1, 16, 48);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2
    });
    const outerRim = new THREE.Mesh(outerRimGeo, goldMat);
    group.add(outerRim);

    // Outer notches (26 points)
    for (let i = 0; i < 26; i++) {
      const angle = (i * Math.PI * 2) / 26;
      const notchGeo = new THREE.BoxGeometry(0.04, 0.18, 0.2);
      const notch = new THREE.Mesh(notchGeo, goldMat);
      notch.position.set(Math.cos(angle) * 1.95, Math.sin(angle) * 1.95, 0.08);
      notch.rotation.z = angle;
      group.add(notch);
    }

    // 3. Inner Rotating Disc Group
    const innerGroup = new THREE.Group();
    const innerGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.22, 48);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x2b1c11,
      metalness: 0.4,
      roughness: 0.6
    });
    const innerDisc = new THREE.Mesh(innerGeo, innerMat);
    innerDisc.rotation.x = Math.PI / 2;
    innerDisc.position.z = 0.04;
    innerGroup.add(innerDisc);

    // Inner rim
    const innerRimGeo = new THREE.TorusGeometry(1.48, 0.06, 16, 48);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc59b27,
      metalness: 0.85,
      roughness: 0.25
    });
    const innerRim = new THREE.Mesh(innerRimGeo, brassMat);
    innerRim.position.z = 0.15;
    innerGroup.add(innerRim);

    // Center Aztec Sun boss
    const bossGeo = new THREE.SphereGeometry(0.45, 24, 24);
    bossGeo.scale(1, 1, 0.4);
    const boss = new THREE.Mesh(bossGeo, goldMat);
    boss.position.z = 0.2;
    innerGroup.add(boss);

    // Center ruby jewel
    const jewelGeo = new THREE.OctahedronGeometry(0.2, 2);
    const jewelMat = new THREE.MeshStandardMaterial({
      color: 0x9e2a2b,
      emissive: 0x751c1c,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8
    });
    const jewel = new THREE.Mesh(jewelGeo, jewelMat);
    jewel.position.z = 0.35;
    innerGroup.add(jewel);

    // Indicator pointer triangle
    const pointerGeo = new THREE.ConeGeometry(0.12, 0.35, 3);
    const pointer = new THREE.Mesh(pointerGeo, goldMat);
    pointer.position.set(0, 1.35, 0.2);
    pointer.rotation.z = Math.PI;
    innerGroup.add(pointer);

    group.add(innerGroup);
    return { group, innerGroup };
  }

  /**
   * Initialize 3D Cipher Wheel in Screen 3
   */
  initCipherWheelViewer(containerId, onShiftChange) {
    if (!this.isThreeAvailable) return null;
    const container = document.getElementById(containerId);
    if (!container) return null;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffecd0, 1.2);
    scene.add(ambientLight);

    const goldPoint = new THREE.PointLight(0xffd700, 2.5, 30);
    goldPoint.position.set(2, 3, 4);
    scene.add(goldPoint);

    const torchLight = new THREE.PointLight(0xff7722, 1.8, 20);
    torchLight.position.set(-3, -2, 3);
    scene.add(torchLight);

    const { group, innerGroup } = this.createCipherWheelGroup();
    scene.add(group);

    // Initial slight tilt
    group.rotation.x = 0.25;

    let currentShift = 3;
    let targetRotation = (currentShift * (Math.PI * 2)) / 26;
    innerGroup.rotation.z = targetRotation;

    let isDragging = false;
    let startAngle = 0;
    let currentInnerAngle = targetRotation;

    const getAngleFromEvent = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return Math.atan2(e.clientY - cy, e.clientX - cx);
    };

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      startAngle = getAngleFromEvent(e) - currentInnerAngle;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        // Snap to nearest 26th step
        const step = (Math.PI * 2) / 26;
        let normalized = (innerGroup.rotation.z % (Math.PI * 2));
        if (normalized < 0) normalized += Math.PI * 2;
        let stepIdx = Math.round(normalized / step) % 26;
        currentShift = stepIdx;
        targetRotation = stepIdx * step;
        if (onShiftChange) onShiftChange(currentShift);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const angle = getAngleFromEvent(e);
      currentInnerAngle = angle - startAngle;
      innerGroup.rotation.z = currentInnerAngle;
      const step = (Math.PI * 2) / 26;
      let normalized = (currentInnerAngle % (Math.PI * 2));
      if (normalized < 0) normalized += Math.PI * 2;
      let stepIdx = Math.round(normalized / step) % 26;
      if (stepIdx !== currentShift) {
        currentShift = stepIdx;
        if (onShiftChange) onShiftChange(currentShift);
      }
    });

    const setShift = (shift) => {
      currentShift = ((shift % 26) + 26) % 26;
      targetRotation = (currentShift * (Math.PI * 2)) / 26;
    };

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isDragging) {
        innerGroup.rotation.z = THREE.MathUtils.lerp(innerGroup.rotation.z, targetRotation, 0.15);
      }
      renderer.render(scene, camera);
    };
    animate();

    return {
      setShift,
      getShift: () => currentShift
    };
  }
}

window.lostTreasure3D = new LostTreasure3D();
