import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { UserCheck, CalendarDays, Sparkles, ArrowLeft } from 'lucide-react';
import axios from "axios";

export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";

const apiUrl = "http://127.0.0.1:8000/";
const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const LoadingIndicator = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
    </div>
  );
};

function Form({ route, method, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // In a real single-file app without react-router-dom, you might replace this
  // with a callback prop to handle navigation or remove navigation logic.
  // For this example, we'll keep it as if react-router-dom is present.
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would be `useNavigate()` from 'react-router-dom'
    // For a self-contained example without routing, you might just show a success message.
    if (path === "/") {
      alert("Login successful! Redirecting to home.");
    } else if (path === "/login") {
      alert("Registration successful! Please login.");
    }
  };

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await api.post(route, { username, password });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-300 hover:text-white transition-colors duration-200"
          title="Go Back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-center flex-grow">{name}</h1>
        <div className="w-6"></div> {/* Spacer to balance the back button */}
      </div>

      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        aria-label="Username"
        required
      />
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        aria-label="Password"
        required
      />
      {loading && <LoadingIndicator />}
      <button className="form-button" type="submit" disabled={loading}>
        {name}
      </button>
    </form>
  );
}

// --- Main EveBuzzThreeJS Component ---
const App = () => { // Renamed to App for default export
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const frameId = useRef(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMethod, setFormMethod] = useState(""); // "login" or "register"
  const [formRoute, setFormRoute] = useState(""); // "/api/token/" or "/api/register/"

  const buttons = [
    {
      label: 'User',
      icon: <UserCheck className="mr-2" />,
      description: 'Get instant event details and recommendations',
      bgColor: 'bg-gradient-to-r from-gray-800/90 to-gray-900/90',
      hoverColor: 'hover:from-gray-700/90 hover:to-gray-800/90',
      action: () => {
        setFormMethod("login");
        setFormRoute("/api/token/");
        setShowForm(true);
      }
    },
    {
      label: 'Organizer',
      icon: <CalendarDays className="mr-2" />,
      description: 'Manage and create campus events',
      bgColor: 'bg-gradient-to-r from-yellow-600/90 to-amber-600/90',
      hoverColor: 'hover:from-yellow-500/90 hover:to-amber-500/90',
      action: () => {
        setFormMethod("register");
        setFormRoute("/api/register/"); // Assuming your register API route
        setShowForm(true);
      }
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
      particlesRef.current.forEach((particle) => {
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

  const handleGoBack = () => {
    setShowForm(false);
    setFormMethod("");
    setFormRoute("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-inter">
      {/* Basic inline styles for Form.css, adapted to Tailwind or direct CSS */}
      <style>
        {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

                .font-inter {
                    font-family: 'Inter', sans-serif;
                }

                .form-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem; /* Equivalent to Tailwind's space-y-4 */
                    width: 100%;
                    padding: 1.5rem; /* Equivalent to Tailwind's p-6 */
                    background: rgba(0, 0, 0, 0.6); /* Slightly darker background for form */
                    border-radius: 1.5rem; /* Equivalent to Tailwind's rounded-3xl */
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(251, 191, 36, 0.3); /* yellow-400/30 */
                    backdrop-filter: blur(12px); /* backdrop-blur-xl */
                    color: white;
                }

                .form-input {
                    width: 100%;
                    padding: 0.75rem 1rem; /* py-3 px-4 */
                    border-radius: 0.5rem; /* rounded-lg */
                    border: 1px solid rgba(251, 191, 36, 0.5); /* yellow-400/50 */
                    background-color: rgba(255, 255, 255, 0.1); /* bg-white/10 */
                    color: white;
                    font-size: 1rem; /* text-base */
                    transition: all 0.2s ease-in-out;
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.6); /* text-white/60 */
                }

                .form-input:focus {
                    outline: none;
                    border-color: #fcd34d; /* yellow-300 */
                    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.4); /* ring-4 ring-yellow-400/40 */
                    background-color: rgba(255, 255, 255, 0.15);
                }

                .form-button {
                    width: 100%;
                    padding: 0.75rem 1.5rem; /* py-3 px-6 */
                    border-radius: 0.75rem; /* rounded-xl */
                    background: linear-gradient(to right, #f59e0b, #eab308); /* from-amber-500 to-yellow-500 */
                    color: white;
                    font-weight: 600; /* font-semibold */
                    font-size: 1.125rem; /* text-lg */
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    border: none;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                .form-button:hover {
                    background: linear-gradient(to right, #eab308, #fcd34d); /* hover:from-yellow-500 hover:to-yellow-400 */
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
                }

                .form-button:disabled {
                    background: #6b7280; /* gray-500 */
                    cursor: not-allowed;
                    opacity: 0.7;
                    transform: none;
                    box-shadow: none;
                }
                `}
      </style>

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
            {!showForm ? (
              <>
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
                      onClick={button.action}
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
              </>
            ) : (
              <Form route={formRoute} method={formMethod} onBack={handleGoBack} />
            )}

            <div className="mt-6 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
