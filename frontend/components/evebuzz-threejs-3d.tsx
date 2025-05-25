import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { UserCheck, CalendarDays, Sparkles } from 'lucide-react';

const EveBuzzThreeJS = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const frameId = useRef(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const buttons = [
    {
      label: 'User',
      icon: <UserCheck className="mr-2" />,
      description: 'Get instant event details and recommendations',
      bgColor: 'bg-gradient-to-r from-gray-800/90 to-gray-900/90',
      hoverColor: 'hover:from-gray-700/90 hover:to-gray-800/90'
    },
    {
      label: 'Organizer',
      icon: <CalendarDays className="mr-2" />,
      description: 'Manage and create campus events',
      bgColor: 'bg-gradient-to-r from-yellow-600/90 to-amber-600/90',
      hoverColor: 'hover:from-yellow-500/90 hover:to-amber-500/90'
    }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create floating particles
    const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const particleMaterials = [
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.8 }),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 }),
      new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.7 }),
    ];

    // Create particles
    for (let i = 0; i < 100; i++) {
      const particle = new THREE.Mesh(
        particleGeometry,
        particleMaterials[Math.floor(Math.random() * particleMaterials.length)]
      );
      
      particle.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      
      // Add random velocity and rotation
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        originalOpacity: particle.material.opacity
      };
      
      scene.add(particle);
      particlesRef.current.push(particle);
    }

    // Create larger glowing orbs
    const orbGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xfbbf24, 
      transparent: true, 
      opacity: 0.3 
    });

    for (let i = 0; i < 15; i++) {
      const orb = new THREE.Mesh(orbGeometry, orbMaterial.clone());
      orb.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15
      );
      
      orb.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
        pulseSpeed: Math.random() * 0.02 + 0.01,
        originalOpacity: orb.material.opacity
      };
      
      scene.add(orb);
      particlesRef.current.push(orb);
    }

    // Create geometric shapes
    const geometries = [
      new THREE.TetrahedronGeometry(0.05),
      new THREE.OctahedronGeometry(0.05),
      new THREE.IcosahedronGeometry(0.05)
    ];

    for (let i = 0; i < 20; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshBasicMaterial({ 
        color: Math.random() > 0.5 ? 0xfbbf24 : 0xf59e0b,
        transparent: true, 
        opacity: 0.4,
        wireframe: Math.random() > 0.5
      });
      
      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
      );
      
      shape.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015
        ),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        )
      };
      
      scene.add(shape);
      particlesRef.current.push(shape);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfbbf24, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xfbbf24, 1, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Camera position
    camera.position.z = 10;

    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);

      // Animate particles
      particlesRef.current.forEach((particle, index) => {
        const userData = particle.userData;
        
        // Move particles
        if (userData.velocity) {
          particle.position.add(userData.velocity);
          
          // Boundary checking - wrap around
          if (particle.position.x > 15) particle.position.x = -15;
          if (particle.position.x < -15) particle.position.x = 15;
          if (particle.position.y > 15) particle.position.y = -15;
          if (particle.position.y < -15) particle.position.y = 15;
          if (particle.position.z > 10) particle.position.z = -10;
          if (particle.position.z < -10) particle.position.z = 10;
        }
        
        // Rotate particles
        if (userData.rotationSpeed) {
          if (userData.rotationSpeed instanceof THREE.Vector3) {
            particle.rotation.x += userData.rotationSpeed.x;
            particle.rotation.y += userData.rotationSpeed.y;
            particle.rotation.z += userData.rotationSpeed.z;
          } else {
            particle.rotation.y += userData.rotationSpeed;
          }
        }
        
        // Pulsing effect for orbs
        if (userData.pulseSpeed) {
          const time = Date.now() * 0.001;
          particle.material.opacity = userData.originalOpacity + Math.sin(time * userData.pulseSpeed) * 0.2;
        }
      });

      // Rotate camera slightly
      const time = Date.now() * 0.0005;
      camera.position.x = Math.sin(time) * 0.5;
      camera.position.y = Math.cos(time) * 0.3;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Three.js canvas container */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 via-black via-gray-800 to-slate-800"
        style={{ zIndex: 1 }}
      />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4" style={{ zIndex: 10 }}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
          <div className="flex items-center">
            <Sparkles className="text-yellow-400 mr-2 w-8 h-8" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
              EveBuzz
            </h1>
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-400/30 p-8 relative">
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4 text-center">
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Welcome to 
              </span>
              <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                {' '}EveBuzz
              </span>
            </h2>
            <p className="text-gray-300 text-center mb-8 text-lg">
              Your AI-powered campus event companion
            </p>

            <div className="space-y-4">
              {buttons.map((button) => (
                <button
                  key={button.label}
                  className={`
                    w-full py-4 px-6 rounded-xl text-white font-semibold 
                    ${button.bgColor} ${button.hoverColor}
                    transform transition-all duration-300 ease-in-out
                    flex items-center justify-center gap-2
                    hover:scale-105 hover:shadow-2xl
                    focus:outline-none focus:ring-4 focus:ring-opacity-50
                    border border-opacity-20 backdrop-blur-sm
                    ${button.label === 'User' 
                      ? 'border-gray-600 focus:ring-gray-400' 
                      : 'border-yellow-500 focus:ring-yellow-400'
                    }
                    ${hoveredButton === button.label 
                      ? `ring-4 ${button.label === 'User' ? 'ring-gray-400/50' : 'ring-yellow-400/50'} shadow-2xl`
                      : ''
                    }
                  `}
                  onMouseEnter={() => setHoveredButton(button.label)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {button.icon}
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{button.label}</span>
                    <span className="text-xs font-normal opacity-75 mt-1">
                      {button.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EveBuzzThreeJS;