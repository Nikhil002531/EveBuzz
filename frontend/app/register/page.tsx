
'use client';
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { UserPlus, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';


const EveBuzzRegister = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const frameId = useRef(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  // Three.js setup (similar to landing page)
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
    for (let i = 0; i < 80; i++) {
      const particle = new THREE.Mesh(
        particleGeometry,
        particleMaterials[Math.floor(Math.random() * particleMaterials.length)]
      );
      
      particle.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015
        ),
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        originalOpacity: particle.material.opacity
      };
      
      scene.add(particle);
      particlesRef.current.push(particle);
    }

    // Create geometric shapes
    const geometries = [
      new THREE.TetrahedronGeometry(0.05),
      new THREE.OctahedronGeometry(0.05),
      new THREE.IcosahedronGeometry(0.05)
    ];

    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshBasicMaterial({ 
        color: Math.random() > 0.5 ? 0xfbbf24 : 0xf59e0b,
        transparent: true, 
        opacity: 0.3,
        wireframe: Math.random() > 0.5
      });
      
      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15
      );
      
      shape.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      };
      
      scene.add(shape);
      particlesRef.current.push(shape);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfbbf24, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xfbbf24, 0.8, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    camera.position.z = 8;

    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);

      particlesRef.current.forEach((particle) => {
        const userData = particle.userData;
        
        if (userData.velocity) {
          particle.position.add(userData.velocity);
          
          // Boundary checking
          if (particle.position.x > 12) particle.position.x = -12;
          if (particle.position.x < -12) particle.position.x = 12;
          if (particle.position.y > 12) particle.position.y = -12;
          if (particle.position.y < -12) particle.position.y = 12;
          if (particle.position.z > 8) particle.position.z = -8;
          if (particle.position.z < -8) particle.position.z = 8;
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
      });

      const time = Date.now() * 0.0003;
      camera.position.x = Math.sin(time) * 0.3;
      camera.position.y = Math.cos(time) * 0.2;
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
    setSuccess(''); // Clear previous success messages

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // API endpoint for your CreatUserView
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Only include username and password as per your UserSerializer
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Registration failed.';
        if (errorData) {
          // Flatten error messages from Django's DRF
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
        }
        setError(errorMessage);
        return;
      }

      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => {
        router.push('/login');
      }, 2000); // Redirect to login after a short delay
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred during registration. Please try again.');
    }
  };


  const handleBackToHome = () => {
    router.push('/'); // Uncomment when using Next.js router
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

        {/* Registration Form Card */}
        <div className="w-full max-w-md bg-gradient-to-b from-gray-900/85 to-black/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-yellow-400/30 p-8 relative">
          <div className="relative z-10">
            <div className="text-center mb-8">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Join 
                </span>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  {' '}EveBuzz
                </span>
              </h2>
              <p className="text-gray-300 text-sm">
                Create your account to start exploring campus events
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-500/50 rounded-lg">
                <p className="text-green-300 text-sm text-center">{success}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200 backdrop-blur-sm"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </div>
                )}
              </button>
            </div>

            <div className="mt-6 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>

            <p className="mt-6 text-center text-gray-300 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-yellow-400 hover:text-yellow-300 font-medium underline transition-colors duration-200"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EveBuzzRegister;