'use client';
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { LogIn, Eye, EyeOff, Sparkles, ArrowLeft, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EveBuzzLogin = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const frameId = useRef(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  // Three.js setup (optimized for login page)
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

    // Create floating particles with varied colors
    const particleGeometry = new THREE.SphereGeometry(0.025, 8, 8);
    const particleMaterials = [
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 }),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.7 }),
      new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.8 }),
      new THREE.MeshBasicMaterial({ color: 0xfcd34d, transparent: true, opacity: 0.6 }),
    ];

    // Create smaller, more numerous particles for login ambiance
    for (let i = 0; i < 60; i++) {
      const particle = new THREE.Mesh(
        particleGeometry,
        particleMaterials[Math.floor(Math.random() * particleMaterials.length)]
      );
      
      particle.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 15
      );
      
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.012
        ),
        rotationSpeed: (Math.random() - 0.5) * 0.025,
        originalOpacity: particle.material.opacity,
        pulseSpeed: Math.random() * 0.01 + 0.005
      };
      
      scene.add(particle);
      particlesRef.current.push(particle);
    }

    // Create glowing orbs for ambient lighting effect
    const orbGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    for (let i = 0; i < 8; i++) {
      const orbMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xfbbf24, 
        transparent: true, 
        opacity: 0.2 
      });
      
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      orb.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10
      );
      
      orb.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008
        ),
        pulseSpeed: Math.random() * 0.015 + 0.01,
        originalOpacity: orb.material.opacity
      };
      
      scene.add(orb);
      particlesRef.current.push(orb);
    }

    // Create subtle geometric shapes
    const geometries = [
      new THREE.TetrahedronGeometry(0.04),
      new THREE.OctahedronGeometry(0.04),
      new THREE.IcosahedronGeometry(0.04),
      new THREE.DodecahedronGeometry(0.04)
    ];

    for (let i = 0; i < 12; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshBasicMaterial({ 
        color: Math.random() > 0.6 ? 0xfbbf24 : 0xf59e0b,
        transparent: true, 
        opacity: 0.4,
        wireframe: Math.random() > 0.7
      });
      
      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 12
      );
      
      shape.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008
        ),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015
        )
      };
      
      scene.add(shape);
      particlesRef.current.push(shape);
    }

    // Enhanced lighting for login atmosphere
    const ambientLight = new THREE.AmbientLight(0xfbbf24, 0.25);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xfbbf24, 0.6, 80);
    pointLight1.position.set(-5, 5, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf59e0b, 0.4, 60);
    pointLight2.position.set(5, -3, 6);
    scene.add(pointLight2);

    camera.position.z = 7;

    // Animation loop with subtle movements
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      particlesRef.current.forEach((particle, index) => {
        const userData = particle.userData;
        
        if (userData.velocity) {
          particle.position.add(userData.velocity);
          
          // Smooth boundary wrapping
          if (particle.position.x > 11) particle.position.x = -11;
          if (particle.position.x < -11) particle.position.x = 11;
          if (particle.position.y > 11) particle.position.y = -11;
          if (particle.position.y < -11) particle.position.y = 11;
          if (particle.position.z > 7) particle.position.z = -7;
          if (particle.position.z < -7) particle.position.z = 7;
        }
        
        if (userData.rotationSpeed) {
          if (userData.rotationSpeed instanceof THREE.Vector3) {
            particle.rotation.x += userData.rotationSpeed.x;
            particle.rotation.y += userData.rotationSpeed.y;
            particle.rotation.z += userData.rotationSpeed.z;
          } else {
            particle.rotation.y += userData.rotationSpeed;
          }
        }
        
        // Gentle pulsing effect
        if (userData.pulseSpeed) {
          particle.material.opacity = userData.originalOpacity + 
            Math.sin(time * userData.pulseSpeed + index) * 0.15;
        }
      });

      // Subtle camera movement
      camera.position.x = Math.sin(time * 0.2) * 0.2;
      camera.position.y = Math.cos(time * 0.15) * 0.15;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed. Please check your credentials.');
        return;
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      router.push('/'); // Redirect to a protected dashboard or home page
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };


  const handleBackToHome = () => {
    router.push('/');
    console.log('Would navigate back to home');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
    console.log('Would navigate to forgot password');
    alert('Would navigate to forgot password page');
  };

  const handleRegister = () => {
    router.push('/register');
    console.log('Would navigate to register');
  };

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
          <button
            onClick={handleBackToHome}
            className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            <span className="font-medium">Back to EveBuzz</span>
          </button>
          <div className="flex items-center">
            <Sparkles className="text-yellow-400 mr-2 w-8 h-8" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
              EveBuzz
            </h1>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="w-full max-w-md bg-gradient-to-b from-gray-900/85 to-black/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-400/30 p-8 relative">
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                
              </div>
              <h2 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Welcome to 
                </span>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  {' '}EveBuzz
                </span>
              </h2>
              <p className="text-gray-300 text-sm">
                Sign in to access your campus events
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/50 border border-red-500/50 rounded-lg animate-pulse">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                >
                  
                </button>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400/50 border border-yellow-500/20 backdrop-blur-sm disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </div>
                )}
              </button>
            </div>

            <div className="mt-6 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>

            <p className="mt-6 text-center text-gray-300 text-sm">
              Don't have an account?{' '}
              <button
                onClick={handleRegister}
                className="text-yellow-400 hover:text-yellow-300 font-medium underline transition-colors duration-200"
              >
                Create one here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EveBuzzLogin;