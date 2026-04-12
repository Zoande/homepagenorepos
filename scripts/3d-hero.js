// ============================================
// MIND-BLOWING 3D HERO SCENE WITH THREE.JS
// ============================================

class ThreeDHero {
  constructor() {
    this.container = document.getElementById('canvas-3d');
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });

    this.camera.position.z = 5;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    this.objects = [];
    this.initialPositions = [];
    this.mouse = { x: 0, y: 0 };
    this.scroll = 0;
    this.targetScroll = 0;

    this.createGeometries();
    this.setupLights();
    this.setupEvents();
    this.animate();
  }

  createGeometries() {
    // Create rotating icosahedron with vibrant colors
    const geometry1 = new THREE.IcosahedronGeometry(1.5, 4);
    const material1 = new THREE.MeshPhongMaterial({
      color: 0x9B6BA8,
      emissive: 0x9B6BA8,
      emissiveIntensity: 0.3,
      wireframe: false,
      shininess: 100
    });
    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.position.set(-3, 2, 0);
    mesh1.rotation.order = 'YXZ';
    this.scene.add(mesh1);
    this.objects.push({ mesh: mesh1, speed: 0.0015, rotAxis: 'xyz', startPos: mesh1.position.clone() });

    // Create octahedron with coral color
    const geometry2 = new THREE.OctahedronGeometry(1.2, 2);
    const material2 = new THREE.MeshPhongMaterial({
      color: 0xE07856,
      emissive: 0xE07856,
      emissiveIntensity: 0.25,
      wireframe: false,
      shininess: 100
    });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.position.set(3, -1.5, 0);
    mesh2.rotation.order = 'XYZ';
    this.scene.add(mesh2);
    this.objects.push({ mesh: mesh2, speed: -0.0012, rotAxis: 'yzx', startPos: mesh2.position.clone() });

    // Create torus knot with teal color
    const geometry3 = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
    const material3 = new THREE.MeshPhongMaterial({
      color: 0x4A9B9F,
      emissive: 0x4A9B9F,
      emissiveIntensity: 0.2,
      wireframe: false,
      shininess: 100
    });
    const mesh3 = new THREE.Mesh(geometry3, material3);
    mesh3.position.set(-2, -1.5, -2);
    mesh3.scale.set(0.8, 0.8, 0.8);
    this.scene.add(mesh3);
    this.objects.push({ mesh: mesh3, speed: 0.0018, rotAxis: 'zyx', startPos: mesh3.position.clone() });

    // Create dodecahedron with emerald color
    const geometry4 = new THREE.DodecahedronGeometry(1, 0);
    const material4 = new THREE.MeshPhongMaterial({
      color: 0x2D8659,
      emissive: 0x2D8659,
      emissiveIntensity: 0.3,
      wireframe: false,
      shininess: 100
    });
    const mesh4 = new THREE.Mesh(geometry4, material4);
    mesh4.position.set(2.5, 2, -1.5);
    this.scene.add(mesh4);
    this.objects.push({ mesh: mesh4, speed: -0.001, rotAxis: 'xyz', startPos: mesh4.position.clone() });

    // Create rotating tetrahedron with rose color
    const geometry5 = new THREE.TetrahedronGeometry(1.3);
    const material5 = new THREE.MeshPhongMaterial({
      color: 0xC85A6C,
      emissive: 0xC85A6C,
      emissiveIntensity: 0.25,
      wireframe: false,
      shininess: 100
    });
    const mesh5 = new THREE.Mesh(geometry5, material5);
    mesh5.position.set(0, 0, -3);
    this.scene.add(mesh5);
    this.objects.push({ mesh: mesh5, speed: 0.0013, rotAxis: 'yzx', startPos: mesh5.position.clone() });

    // Create GLOWING wireframe sphere for extra effect - MASSIVE SIZE
    const geometry6 = new THREE.SphereGeometry(4.5, 64, 64);
    const material6 = new THREE.LineBasicMaterial({ 
      color: 0x6B9DC5,
      transparent: true,
      opacity: 0.5,
      linewidth: 1
    });
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry6),
      material6
    );
    wireframe.position.set(0, 0, -2);
    wireframe.scale.set(1.3, 1.3, 1.3);
    this.scene.add(wireframe);
    this.objects.push({ mesh: wireframe, speed: 0.00015, rotAxis: 'xyz', isWireframe: true, startPos: wireframe.position.clone() });

    // Add multiple glowing solid spheres with varying sizes for depth
    const sphereConfigs = [
      { size: 3.2, emissive: 0x4A7FA8, intensity: 0.5, opacity: 0.12 },
      { size: 2.5, emissive: 0x6B9DC5, intensity: 0.3, opacity: 0.08 },
      { size: 4.0, emissive: 0x00FFFF, intensity: 0.2, opacity: 0.06 },
      { size: 3.5, emissive: 0xFF007F, intensity: 0.35, opacity: 0.1 }
    ];

    sphereConfigs.forEach((config, idx) => {
      const geometry7 = new THREE.SphereGeometry(config.size, 32, 32);
      const material7 = new THREE.MeshPhongMaterial({
        color: 0x6B9DC5,
        emissive: config.emissive,
        emissiveIntensity: config.intensity,
        transparent: true,
        opacity: config.opacity,
        wireframe: false,
        shininess: 30
      });
      const glowingSphere = new THREE.Mesh(geometry7, material7);
      glowingSphere.position.set(0, 0, -2 + idx * 0.5);
      this.scene.add(glowingSphere);
      this.objects.push({ mesh: glowingSphere, speed: 0.00008 + idx * 0.00003, rotAxis: 'xyz', isWireframe: false, startPos: glowingSphere.position.clone() });
    });

    // Create starfield for ultra mind-blowing effect
    this.createParticles();
  }

  setupLights() {
    // Stronger ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    // Point lights for each color - ULTRA INTENSE FOR MIND-BLOWING EFFECT
    const lights = [
      { color: 0x9B6BA8, position: [-8, 4, 6], intensity: 1.5 },
      { color: 0xE07856, position: [8, -3, 6], intensity: 1.5 },
      { color: 0x4A9B9F, position: [0, 0, 10], intensity: 2.0 },
      { color: 0x2D8659, position: [4, 3, 4], intensity: 1.3 },
      { color: 0xC85A6C, position: [-4, 3, 4], intensity: 1.3 },
      { color: 0x6B9DC5, position: [0, 6, -2], intensity: 1.8 },
      { color: 0xFF00FF, position: [-10, 0, 10], intensity: 1.2 },
      { color: 0x00FFFF, position: [10, 0, 10], intensity: 1.2 },
      { color: 0x00FF00, position: [0, -8, 5], intensity: 0.9 },
      { color: 0xFFFF00, position: [-6, -2, 8], intensity: 0.8 }
    ];

    lights.forEach(light => {
      const pointLight = new THREE.PointLight(light.color, light.intensity, 200);
      pointLight.position.set(...light.position);
      this.scene.add(pointLight);
    });
  }

  createParticles() {
    // Create starfield/particle effect for ultra mind-blowing visuals
    const particleCount = 250;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorOptions = [
      [0.42, 0.26, 0.53], // Purple
      [0.88, 0.47, 0.34], // Coral
      [0.29, 0.61, 0.62], // Teal
      [0.42, 0.50, 1.0],  // Blue
      [1.0, 0.0, 1.0],    // Magenta
      [0.0, 1.0, 1.0]     // Cyan
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
      
      sizes[i] = Math.random() * 0.25 + 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      sizeRange: [0.1, 1.0]
    });

    const particles = new THREE.Points(geometry, material);
    particles.position.z = -5;
    this.scene.add(particles);
    this.particles = particles;
  }

  setupEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('scroll', () => {
      this.targetScroll = window.scrollY;
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.onWindowResize();
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Smooth scroll lerp to prevent jerky layout - MUCH SMOOTHER TRANSITIONS
    this.scroll += (this.targetScroll - this.scroll) * 0.12;

    // Rotate objects
    this.objects.forEach((obj, index) => {
      const rot = obj.mesh.rotation;
      switch(obj.rotAxis) {
        case 'xyz':
          rot.x += obj.speed;
          rot.y += obj.speed;
          rot.z += obj.speed * 0.5;
          break;
        case 'yzx':
          rot.y += obj.speed;
          rot.z += obj.speed;
          rot.x += obj.speed * 0.5;
          break;
        case 'zyx':
          rot.z += obj.speed * 1.5;
          rot.y += obj.speed;
          rot.x += obj.speed * 0.3;
          break;
      }

      // Move with mouse - enhanced effect
      const mouseInfluence = 2.5;
      obj.mesh.position.x += (this.mouse.x * mouseInfluence - obj.mesh.position.x) * 0.015;
      obj.mesh.position.y += (this.mouse.y * mouseInfluence - obj.mesh.position.y) * 0.015;

      // Parallax with scroll - ABSOLUTE position based on START position, not incremental
      // MUCH slower to prevent overwhelming effect
      const scrollParallax = this.scroll * 0.0003;
      obj.mesh.position.z = obj.startPos.z + (scrollParallax * 0.15);
      
      // Gentle rotation based on scroll (VERY subtle now)
      const rotationInfluence = scrollParallax * 0.015;
      obj.mesh.rotation.x += rotationInfluence * 0.2;
      obj.mesh.rotation.y += rotationInfluence * 0.3;
    });

    // Move camera with mouse for parallax - ENHANCED RESPONSIVENESS
    const camMouseX = this.mouse.x * 0.8;
    const camMouseY = this.mouse.y * 0.8;
    this.camera.position.x += (camMouseX - this.camera.position.x) * 0.08;
    this.camera.position.y += (camMouseY - this.camera.position.y) * 0.08;
    
    // Camera follows scroll with more subtle depth effect - PREVENTS LAYOUT SHIFT
    this.camera.position.z = 5 + (this.scroll * 0.0008);
    
    this.camera.lookAt(0, 0, 0);

    // Animate particles for starfield effect
    if (this.particles) {
      this.particles.rotation.x += 0.0001;
      this.particles.rotation.y += 0.00015;
      
      // Subtle pulse effect on particle opacity
      const pulse = Math.sin(Date.now() * 0.001) * 0.15 + 0.6;
      this.particles.material.opacity = pulse;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ThreeDHero();
});
