'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { useAuth } from '@/contexts/AuthContext';
import { blockBuilderAPI } from '@/lib/api';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/BlockBuilderPage.css';

// We'll use dynamic import for Three.js to avoid SSR issues
let THREE: any = null;
if (typeof window !== 'undefined') {
  import('three').then((module) => {
    THREE = module;
  });
}

interface Block {
  x: number;
  y: number;
  z: number;
  color: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  challenge: string;
  requirements: {
    minBlocks?: number;
    minRemoved?: number;
    structure?: string;
    useLoop?: boolean;
  };
  xpReward: number;
  coinsReward: number;
}

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Your First Block',
    description: 'Place your first block',
    challenge: 'Place a red block at position (0, 0, 0)',
    requirements: { minBlocks: 1 },
    xpReward: 25,
    coinsReward: 10
  },
  {
    id: 2,
    title: 'Build a Tower',
    description: 'Create a tall structure',
    challenge: 'Build a tower 5 blocks high using build_tower()',
    requirements: { minBlocks: 5, structure: 'tower' },
    xpReward: 50,
    coinsReward: 20
  },
  {
    id: 3,
    title: 'Create a Wall',
    description: 'Build a wall structure',
    challenge: 'Create a wall 10 blocks long using create_wall()',
    requirements: { minBlocks: 10, structure: 'wall' },
    xpReward: 75,
    coinsReward: 30
  },
  {
    id: 4,
    title: 'Add a Door',
    description: 'Use remove_block to make an opening in a wall',
    challenge: 'Build a wall and use remove_block(x, y, z) to create a door opening (at least 8 blocks remaining).',
    requirements: { minBlocks: 8, minRemoved: 1 },
    xpReward: 85,
    coinsReward: 35
  },
  {
    id: 5,
    title: 'Add a Window',
    description: 'Add a window by removing a block from a wall',
    challenge: 'Build a wall and use remove_block to create a door and a window (at least 10 blocks, at least 2 removals).',
    requirements: { minBlocks: 10, minRemoved: 2 },
    xpReward: 100,
    coinsReward: 45
  },
  {
    id: 6,
    title: 'Build a Simple Pyramid',
    description: 'Use loops to build a small pyramid',
    challenge: 'Create a pyramid 4 blocks wide at the base using a for loop',
    requirements: { minBlocks: 10, useLoop: true },
    xpReward: 100,
    coinsReward: 40
  },
  {
    id: 7,
    title: 'Build a Bridge',
    description: 'Create a bridge connecting two points',
    challenge: 'Build a bridge with two towers and blocks connecting them',
    requirements: { minBlocks: 15 },
    xpReward: 125,
    coinsReward: 50
  },
  {
    id: 8,
    title: 'Build a Staircase',
    description: 'Create stairs going upward',
    challenge: 'Build a staircase that goes up 5 steps using a loop',
    requirements: { minBlocks: 15, useLoop: true },
    xpReward: 150,
    coinsReward: 60
  },
  {
    id: 9,
    title: 'Build a Castle Tower',
    description: 'Create a tall defensive tower',
    challenge: 'Build a tall tower with walls around it (at least 25 blocks)',
    requirements: { minBlocks: 25 },
    xpReward: 200,
    coinsReward: 75
  },
  {
    id: 10,
    title: 'Build a House',
    description: 'Create a complete house structure',
    challenge: 'Build a house with four walls and a roof (at least 30 blocks)',
    requirements: { minBlocks: 30, structure: 'house' },
    xpReward: 300,
    coinsReward: 100
  }
];

const GRID_SIZE = 20;

export default function BlockBuilderPage() {
  const { character, addCoins, addExperience, addPoints } = useCharacter();
  const { authState } = useAuth();
  const [code, setCode] = useState(`# Write Python code to build with blocks!
# Example:
# place_block(0, 0, 0, "red")
# build_tower(height=5)
# create_wall(length=10)
`);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [isLoadingBuild, setIsLoadingBuild] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'firstperson'>('editor');
  const [showHintModal, setShowHintModal] = useState(false);
  const [selectedHintLevel, setSelectedHintLevel] = useState(1);
  const [hintText, setHintText] = useState('');
  const [removedCount, setRemovedCount] = useState(0);
  
  // First-person view state - start at ground level
  // Character body center is at y=0.5 relative, so group at y=0.5 puts feet at y=0 (ground level)
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0.5, z: 0 });
  const [characterRotation, setCharacterRotation] = useState(0); // Y rotation in radians
  const keysPressed = useRef<Set<string>>(new Set());
  const characterMeshRef = useRef<any>(null);
  const mouseDownRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const lastMouseYRef = useRef(0);
  const viewModeRef = useRef(viewMode);
  const characterPositionRef = useRef(characterPosition);
  const characterRotationRef = useRef(characterRotation);
  
  // Keep refs in sync with state
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);
  
  useEffect(() => {
    characterPositionRef.current = characterPosition;
  }, [characterPosition]);
  
  useEffect(() => {
    characterRotationRef.current = characterRotation;
  }, [characterRotation]);
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  
  const sceneRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const sceneRef3D = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const blockMeshesRef = useRef<Map<string, any>>(new Map());

  const challenge = CHALLENGES[currentChallenge];

  // Initialize Three.js scene
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Wait for the container to be ready
    const checkAndInit = () => {
      if (!sceneRef.current) {
        // Retry after a short delay
        setTimeout(checkAndInit, 100);
        return;
      }

      // Check if already initialized
      if (rendererRef.current && sceneRef3D.current) {
        return; // Already initialized
      }

      initThree();
    };

    const initThree = async () => {
      try {
        const THREE = await import('three');
        const OrbitControls = (await import('three/examples/jsm/controls/OrbitControls.js')).OrbitControls;

        if (!sceneRef.current) return;

        // Clear any existing content
        while (sceneRef.current.firstChild) {
          sceneRef.current.removeChild(sceneRef.current.firstChild);
        }

        // Scene setup
        const scene = new THREE.Scene();
        // Set background from character's selected background, or default to sky blue
        if (character.background?.value) {
          const bgValue = character.background.value;
          if (bgValue.startsWith('#')) {
            // Hex color
            scene.background = new THREE.Color(bgValue);
          } else if (bgValue.startsWith('rgb') || bgValue.startsWith('rgba')) {
            // RGB/RGBA color - parse it
            const match = bgValue.match(/(\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
              scene.background = new THREE.Color(
                parseInt(match[1]) / 255,
                parseInt(match[2]) / 255,
                parseInt(match[3]) / 255
              );
            } else {
              scene.background = new THREE.Color(0x87ceeb); // Fallback to sky blue
            }
          } else if (bgValue.includes('gradient')) {
            // For gradients, extract the first color or use a solid color approximation
            // Three.js doesn't support CSS gradients directly, so we'll use the first color
            const colorMatch = bgValue.match(/#([0-9a-fA-F]{6})/);
            if (colorMatch) {
              scene.background = new THREE.Color('#' + colorMatch[1]);
            } else {
              // Try to extract RGB from gradient
              const rgbMatch = bgValue.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
              if (rgbMatch) {
                scene.background = new THREE.Color(
                  parseInt(rgbMatch[1]) / 255,
                  parseInt(rgbMatch[2]) / 255,
                  parseInt(rgbMatch[3]) / 255
                );
              } else {
                scene.background = new THREE.Color(0x87ceeb); // Fallback
              }
            }
          } else {
            scene.background = new THREE.Color(0x87ceeb); // Fallback to sky blue
          }
        } else {
          scene.background = new THREE.Color(0x87ceeb); // Default sky blue
        }
        sceneRef3D.current = scene;

        // Get container dimensions
        const width = sceneRef.current.clientWidth || 800;
        const height = sceneRef.current.clientHeight || 600;

        // Camera - center on play area 0 to GRID_SIZE
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(GRID_SIZE / 2, 18, GRID_SIZE / 2);
        camera.lookAt(GRID_SIZE / 2, 0, GRID_SIZE / 2);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        sceneRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Fun cursor for orbit controls so kids know they can drag to rotate the grid
        const canvasEl = renderer.domElement;
        canvasEl.style.cursor = 'grab';
        const handleMouseDown = () => {
          canvasEl.style.cursor = 'grabbing';
        };
        const handleMouseUp = () => {
          canvasEl.style.cursor = 'grab';
        };
        const handleMouseLeave = () => {
          canvasEl.style.cursor = 'grab';
        };
        canvasEl.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        canvasEl.addEventListener('mouseleave', handleMouseLeave);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 50;
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Grid helper - position so grid spans 0 to GRID_SIZE in X and Z
        const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0x888888, 0xcccccc);
        gridHelper.position.set(GRID_SIZE / 2, 0, GRID_SIZE / 2);
        scene.add(gridHelper);

        // Coordinate labels along X (left-right) and Z (forward-back) axes to help players place blocks
        const createLabelSprite = (text: string, scale: number = 0.6) => {
          const size = 128;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;
          ctx.clearRect(0, 0, size, size);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.font = 'bold 72px Montserrat, Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.lineWidth = 8;
          ctx.strokeText(text, size / 2, size / 2);
          ctx.fillText(text, size / 2, size / 2);
          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(scale, scale, scale);
          return sprite;
        };

        // Labels for integer coordinates 0 to GRID_SIZE-1 on x and z, matching the grid
        for (let x = 0; x < GRID_SIZE; x++) {
          const sprite = createLabelSprite(String(x), 0.55);
          if (sprite) {
            sprite.position.set(x, 0.01, -1.1); // just in front of the grid
            scene.add(sprite);
          }
        }

        for (let z = 0; z < GRID_SIZE; z++) {
          const sprite = createLabelSprite(String(z), 0.55);
          if (sprite) {
            sprite.position.set(-1.1, 0.01, z); // along the left edge of the grid
            scene.add(sprite);
          }
        }

        // Axis labels to show which direction is X, Z, and Y
        const xLabel = createLabelSprite('X', 0.7);
        if (xLabel) {
          xLabel.position.set(GRID_SIZE - 0.2, 0.02, -2); // near front-right corner
          scene.add(xLabel);
        }

        const zLabel = createLabelSprite('Z', 0.7);
        if (zLabel) {
          zLabel.position.set(-2, 0.02, GRID_SIZE - 0.2); // near back-left corner
          scene.add(zLabel);
        }

        const yLabel = createLabelSprite('Y', 0.7);
        if (yLabel) {
          yLabel.position.set(-2, 3, -2); // off to the side, floating upward
          scene.add(yLabel);
        }

        // Ground - align with grid (0 to GRID_SIZE in X and Z)
        const groundGeometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x90ee90 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(GRID_SIZE / 2, -0.5, GRID_SIZE / 2);
        ground.receiveShadow = true;
        scene.add(ground);

        // Create character (simple cylinder for body, sphere for head)
        const characterGroup = new THREE.Group();
        
        // Body (cylinder)
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        characterGroup.add(body);
        
        // Add a simple head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.2;
        head.castShadow = true;
        characterGroup.add(head);
        
        // Position character at ground level
        // Ground is at y=-0.5, blocks are at y=0,1,2...
        // Character body center is at y=0.5 relative to group, so group at y=0.5 puts body bottom at y=0 (ground level)
        characterGroup.position.set(0, 0.5, 0);
        scene.add(characterGroup);
        characterMeshRef.current = characterGroup;

        // Animation loop
        let animationId: number;
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          if (controls && camera && scene && renderer) {
            // Update character position - use refs to get current values
            if (characterMeshRef.current) {
              const currentPos = characterPositionRef.current;
              const currentRot = characterRotationRef.current;
              
              characterMeshRef.current.position.set(
                currentPos.x,
                currentPos.y,
                currentPos.z
              );
              characterMeshRef.current.rotation.y = currentRot;
            }
            
            // Handle first-person view - use refs to get current values
            if (viewModeRef.current === 'firstperson' && characterMeshRef.current) {
              // Position camera at character's eye level
              // Character group is at y=0.5, head is at y=1.2 relative, so eye level is around y=1.7
              const eyeHeight = 1.7;
              const currentPos = characterPositionRef.current;
              const currentRot = characterRotationRef.current;
              
              camera.position.set(
                currentPos.x,
                currentPos.y + eyeHeight,
                currentPos.z
              );
              
              // Rotate camera based on character rotation
              // For first-person, we want to look in the direction the character is facing
              camera.rotation.set(0, currentRot, 0);
              
              // Disable orbit controls in first-person mode
              controls.enabled = false;
            } else {
              // Enable orbit controls in editor mode
              controls.enabled = true;
              controls.update();
            }
            
            renderer.render(scene, camera);
          }
        };
        animate();

        // Handle resize
        const handleResize = () => {
          if (!sceneRef.current || !camera || !renderer) return;
          const newWidth = sceneRef.current.clientWidth;
          const newHeight = sceneRef.current.clientHeight;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          if (renderer && renderer.domElement) {
            const canvas = renderer.domElement;
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
          }
          window.removeEventListener('mouseup', handleMouseUp);
          if (renderer && renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
          if (renderer) {
            renderer.dispose();
          }
        };
      } catch (error) {
        console.error('Error initializing Three.js:', error);
      }
    };

    // Start initialization
    checkAndInit();

    // Cleanup on unmount
    return () => {
      if (rendererRef.current) {
        const renderer = rendererRef.current;
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
        rendererRef.current = null;
      }
      sceneRef3D.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  // Update background when character background changes
  useEffect(() => {
    if (!sceneRef3D.current || typeof window === 'undefined') return;
    
    const updateBackground = async () => {
      const THREE = await import('three');
      const scene = sceneRef3D.current;
      if (!scene) return;
      
      if (character.background?.value) {
        const bgValue = character.background.value;
        if (bgValue.startsWith('#')) {
          // Hex color
          scene.background = new THREE.Color(bgValue);
        } else if (bgValue.startsWith('rgb') || bgValue.startsWith('rgba')) {
          // RGB/RGBA color - parse it
          const match = bgValue.match(/(\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            scene.background = new THREE.Color(
              parseInt(match[1]) / 255,
              parseInt(match[2]) / 255,
              parseInt(match[3]) / 255
            );
          } else {
            scene.background = new THREE.Color(0x87ceeb); // Fallback to sky blue
          }
        } else if (bgValue.includes('gradient')) {
          // For gradients, extract the first color or use a solid color approximation
          const colorMatch = bgValue.match(/#([0-9a-fA-F]{6})/);
          if (colorMatch) {
            scene.background = new THREE.Color('#' + colorMatch[1]);
          } else {
            // Try to extract RGB from gradient
            const rgbMatch = bgValue.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
              scene.background = new THREE.Color(
                parseInt(rgbMatch[1]) / 255,
                parseInt(rgbMatch[2]) / 255,
                parseInt(rgbMatch[3]) / 255
              );
            } else {
              scene.background = new THREE.Color(0x87ceeb); // Fallback
            }
          }
        } else {
          scene.background = new THREE.Color(0x87ceeb); // Fallback to sky blue
        }
      } else {
        scene.background = new THREE.Color(0x87ceeb); // Default sky blue
      }
    };
    
    updateBackground();
  }, [character.background]);

  // Update 3D scene when blocks change
  useEffect(() => {
    if (!sceneRef3D.current) return;

    const updateBlocks = async () => {
      const THREE = await import('three');
      const scene = sceneRef3D.current;
      if (!scene) return;

    // Remove old blocks
    blockMeshesRef.current.forEach((mesh) => {
      scene.remove(mesh);
    });
    blockMeshesRef.current.clear();

    // Add new blocks
    blocks.forEach((block) => {
      const key = `${block.x},${block.y},${block.z}`;
      if (blockMeshesRef.current.has(key)) return;

        const colorMap: { [key: string]: number } = {
          'red': 0xff0000,
          'blue': 0x0000ff,
          'green': 0x00ff00,
          'yellow': 0xffff00,
          'orange': 0xffa500,
          'purple': 0x800080,
          'pink': 0xffc0cb,
          'brown': 0xa52a2a,
          'black': 0x000000,
          'white': 0xffffff
        };

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
          color: colorMap[block.color.toLowerCase()] || 0xff0000,
          roughness: 0.7,
          metalness: 0.3
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(block.x, block.y, block.z);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);
        blockMeshesRef.current.set(key, cube);
      });
    };

    updateBlocks();
  }, [blocks]);

  // Update character position in 3D scene when state changes
  useEffect(() => {
    if (characterMeshRef.current) {
      characterMeshRef.current.position.set(
        characterPosition.x,
        characterPosition.y,
        characterPosition.z
      );
      characterMeshRef.current.rotation.y = characterRotation;
    }
  }, [characterPosition, characterRotation]);

  // Keyboard controls for first-person movement
  useEffect(() => {
    if (viewMode !== 'firstperson') {
      keysPressed.current.clear();
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isMovementKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'q', 'e'].includes(key);
      
      if (isMovementKey) {
        e.preventDefault(); // Prevent default browser behavior (scrolling, etc.)
        e.stopPropagation();
      }
      
      keysPressed.current.add(key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isMovementKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'q', 'e'].includes(key);
      
      if (isMovementKey) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    // Movement loop
    const moveInterval = setInterval(() => {
      if (viewModeRef.current !== 'firstperson') return;
      
      const moveSpeed = 0.1;
      const rotateSpeed = 0.05;
      
      // Forward/Backward (Arrow Up/Down or W/S)
      if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) {
        setCharacterPosition(prev => ({
          x: prev.x - Math.sin(characterRotationRef.current) * moveSpeed,
          y: prev.y,
          z: prev.z - Math.cos(characterRotationRef.current) * moveSpeed
        }));
      }
      if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) {
        setCharacterPosition(prev => ({
          x: prev.x + Math.sin(characterRotationRef.current) * moveSpeed,
          y: prev.y,
          z: prev.z + Math.cos(characterRotationRef.current) * moveSpeed
        }));
      }
      
      // Strafe Left/Right (Arrow Left/Right or A/D)
      if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
        setCharacterPosition(prev => ({
          x: prev.x - Math.cos(characterRotationRef.current) * moveSpeed,
          y: prev.y,
          z: prev.z + Math.sin(characterRotationRef.current) * moveSpeed
        }));
      }
      if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
        setCharacterPosition(prev => ({
          x: prev.x + Math.cos(characterRotationRef.current) * moveSpeed,
          y: prev.y,
          z: prev.z - Math.sin(characterRotationRef.current) * moveSpeed
        }));
      }
      
      // Rotate with Q/E
      if (keysPressed.current.has('q')) {
        setCharacterRotation(prev => prev - rotateSpeed);
      }
      if (keysPressed.current.has('e')) {
        setCharacterRotation(prev => prev + rotateSpeed);
      }
    }, 16); // ~60fps

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveInterval);
      keysPressed.current.clear();
    };
  }, [viewMode]);

  // Mouse look controls for first-person view
  useEffect(() => {
    if (viewMode !== 'firstperson' || !sceneRef.current) return;

    const container = sceneRef.current;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left mouse button
        mouseDownRef.current = true;
        lastMouseXRef.current = e.clientX;
        lastMouseYRef.current = e.clientY;
        container.requestPointerLock?.();
      }
    };

    const handleMouseUp = () => {
      mouseDownRef.current = false;
      document.exitPointerLock?.();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseDownRef.current) return;
      
      const sensitivity = 0.002;
      const deltaX = e.movementX || (e.clientX - lastMouseXRef.current);
      
      // Horizontal rotation (yaw)
      setCharacterRotation(prev => prev - deltaX * sensitivity);
      
      lastMouseXRef.current = e.clientX;
      lastMouseYRef.current = e.clientY;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      document.exitPointerLock?.();
    };
  }, [viewMode]);

  // Check challenge completion when blocks or removals change (with debouncing to avoid multiple checks)
  useEffect(() => {
    if ((blocks.length > 0 || removedCount > 0) && !isLoadingBuild && !showSuccess && !executing) {
      // Small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        const req = challenge.requirements;
        const blocksOk = !req.minBlocks || blocks.length >= req.minBlocks;
        if (blocksOk) checkChallengeCompletion();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [blocks.length, removedCount, isLoadingBuild, showSuccess, executing, challenge.id]);

  // Load saved build on mount
  useEffect(() => {
    const loadSavedBuild = async () => {
      if (!authState.isAuthenticated) {
        setIsLoadingBuild(false);
        return;
      }

      try {
        const response = await blockBuilderAPI.loadBuild();
        if (response.data.success) {
          setBlocks(response.data.blocks || []);
          setCurrentChallenge(response.data.currentChallenge || 0);
        }
      } catch (error: any) {
        console.error('Error loading saved build:', error);
        // If no saved build exists, that's okay - start fresh
      } finally {
        setIsLoadingBuild(false);
      }
    };

    loadSavedBuild();
  }, [authState.isAuthenticated]);

  // Save build when blocks or challenge change (with debouncing)
  useEffect(() => {
    if (isLoadingBuild || !authState.isAuthenticated) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await blockBuilderAPI.saveBuild(blocks, currentChallenge);
      } catch (error: any) {
        console.error('Error saving build:', error);
      }
    }, 1000);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [blocks, currentChallenge, isLoadingBuild, authState.isAuthenticated]);

  // Python command functions
  const executePythonCode = async (code: string) => {
    setExecuting(true);
    setMessage('');
    setError('');

    try {
      // Create a safe execution context
      const context: any = {
        blocks: [...blocks],
        place_block: (x: number, y: number, z: number, color: string = 'red') => {
          const newBlock: Block = { x, y, z, color };
          setBlocks(prev => {
            const key = `${x},${y},${z}`;
            if (prev.some(b => `${b.x},${b.y},${b.z}` === key)) {
              return prev; // Block already exists
            }
            return [...prev, newBlock];
          });
          return { success: true, message: `Placed ${color} block at (${x}, ${y}, ${z})` };
        },
        remove_block: (x: number, y: number, z: number) => {
          setBlocks(prev => prev.filter(b => !(b.x === x && b.y === y && b.z === z)));
          setRemovedCount(prev => prev + 1);
          return { success: true, message: `Removed block at (${x}, ${y}, ${z})` };
        },
        build_tower: (x: number = 0, y: number = 0, z: number = 0, height: number = 5, color: string = 'red') => {
          const newBlocks: Block[] = [];
          for (let i = 0; i < height; i++) {
            newBlocks.push({ x, y: y + i, z, color });
          }
          setBlocks(prev => {
            const existing = new Set(prev.map(b => `${b.x},${b.y},${b.z}`));
            const toAdd = newBlocks.filter(b => !existing.has(`${b.x},${b.y},${b.z}`));
            return [...prev, ...toAdd];
          });
          return { success: true, message: `Built tower of height ${height}` };
        },
        create_wall: (x: number = 0, y: number = 0, z: number = 0, length: number = 10, height: number = 1, color: string = 'blue', direction: string = 'x') => {
          const newBlocks: Block[] = [];
          for (let i = 0; i < length; i++) {
            for (let j = 0; j < height; j++) {
              // Direction 'x' = along x-axis (east-west), 'z' = along z-axis (north-south)
              if (direction === 'z' || direction === 'Z') {
                // Wall along z-axis (north-south)
                newBlocks.push({ x, y: y + j, z: z + i, color });
              } else {
                // Wall along x-axis (east-west) - default
                newBlocks.push({ x: x + i, y: y + j, z, color });
              }
            }
          }
          setBlocks(prev => {
            const existing = new Set(prev.map(b => `${b.x},${b.y},${b.z}`));
            const toAdd = newBlocks.filter(b => !existing.has(`${b.x},${b.y},${b.z}`));
            return [...prev, ...toAdd];
          });
          return { success: true, message: `Created wall of length ${length} along ${direction === 'z' || direction === 'Z' ? 'z-axis' : 'x-axis'}` };
        },
        clear_all: () => {
          setBlocks([]);
          return { success: true, message: 'Cleared all blocks' };
        }
      };

      // Wrap user code in try-except
      const wrappedCode = `
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
    result = {"success": True, "message": "Code executed successfully"}
except Exception as e:
    result = {"success": False, "error": str(e)}
`;

      // Execute Python-like commands by parsing and executing
      const lines = code.split('\n');
      
      const results: any[] = [];
      
      // Process lines recursively to handle nested loops
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) {
          i++;
          continue;
        }
        
        // Execute line (which may consume multiple lines if it's a loop)
        i = executeLine(line, context, results, lines, i);
      }

      // Helper function to execute a single line or nested code block
      function executeLine(line: string, ctx: any, res: any[], remainingLines: string[] = [], currentIndex: number = 0): number {
        const trimmed = line.trim();
        // Check if this line is a for loop
        const forLoopMatch = line.match(/for\s+(\w+)\s+in\s+range\s*\(\s*(\d+)\s*(?:,\s*(\d+))?\s*\)\s*:/);
        if (forLoopMatch) {
          const loopVar = forLoopMatch[1];
          const start = 0;
          const end = parseInt(forLoopMatch[2]);
          let loopRange = Array.from({ length: end }, (_, i) => i);
          if (forLoopMatch[3]) {
            const end2 = parseInt(forLoopMatch[3]);
            loopRange = Array.from({ length: end2 - start }, (_, i) => start + i);
          }
          
          // Collect the loop body (indented lines)
          const loopBody: string[] = [];
          const baseIndent = line.length - line.trimStart().length;
          let lineIndex = currentIndex + 1;
          
          while (lineIndex < remainingLines.length) {
            const bodyLine = remainingLines[lineIndex];
            const bodyIndent = bodyLine.length - bodyLine.trimStart().length;
            const bodyTrimmed = bodyLine.trim();
            
            if (!bodyTrimmed || bodyTrimmed.startsWith('#')) {
              lineIndex++;
              continue;
            }
            
            // If indentation is greater than base, it's part of the loop body
            if (bodyIndent > baseIndent) {
              loopBody.push(bodyLine);
              lineIndex++;
            } else {
              // Same or less indentation means we're done with this loop
              break;
            }
          }
          
          // Execute the loop
          for (const val of loopRange) {
            const loopContext = { ...ctx, [loopVar]: val };
            let bodyIndex = 0;
            while (bodyIndex < loopBody.length) {
              const bodyLine = loopBody[bodyIndex];
              const consumed = executeLine(bodyLine, loopContext, res, loopBody, bodyIndex);
              bodyIndex = consumed;
            }
          }
          
          return lineIndex; // Return the index after processing the loop
        }
        
        // Parse place_block(x, y, z, "color") - handle numbers, variables, and simple expressions like x+1
        const placeMatch = trimmed.match(/place_block\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*(?:,\s*["'](\w+)["'])?\s*\)/);
        if (placeMatch) {
          // Helper function to evaluate simple expressions
          const evaluateExpression = (expr: string, context: any): number => {
            const trimmedExpr = expr.trim();
            
            // Try direct number
            if (!isNaN(Number(trimmedExpr))) {
              return parseInt(trimmedExpr);
            }
            
            // Try simple addition: x + 1, x+1, 1 + x, etc.
            const addMatch = trimmedExpr.match(/(\w+)\s*\+\s*(\d+)/);
            if (addMatch) {
              const varName = addMatch[1];
              const num = parseInt(addMatch[2]);
              const varValue = context[varName] !== undefined ? context[varName] : (!isNaN(Number(varName)) ? parseInt(varName) : 0);
              return varValue + num;
            }
            
            const addMatch2 = trimmedExpr.match(/(\d+)\s*\+\s*(\w+)/);
            if (addMatch2) {
              const num = parseInt(addMatch2[1]);
              const varName = addMatch2[2];
              const varValue = context[varName] !== undefined ? context[varName] : (!isNaN(Number(varName)) ? parseInt(varName) : 0);
              return num + varValue;
            }
            
            // Try simple subtraction: x - 1, x-1, etc.
            const subMatch = trimmedExpr.match(/(\w+)\s*-\s*(\d+)/);
            if (subMatch) {
              const varName = subMatch[1];
              const num = parseInt(subMatch[2]);
              const varValue = context[varName] !== undefined ? context[varName] : (!isNaN(Number(varName)) ? parseInt(varName) : 0);
              return varValue - num;
            }
            
            // Try simple variable
            if (context[trimmedExpr] !== undefined) {
              return context[trimmedExpr];
            }
            
            // Fallback to parsing as number
            return parseInt(trimmedExpr) || 0;
          };
          
          const xVal = placeMatch[1];
          const yVal = placeMatch[2];
          const zVal = placeMatch[3];
          const color = placeMatch[4] || 'red';
          
          const x = evaluateExpression(xVal, ctx);
          const y = evaluateExpression(yVal, ctx);
          const z = evaluateExpression(zVal, ctx);
          
          const result = ctx.place_block(x, y, z, color);
          res.push(result);
          return currentIndex + 1;
        }

        // Parse remove_block(x, y, z) - handle both numbers and variables
        const removeMatch = trimmed.match(/remove_block\s*\(\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*\)/);
        if (removeMatch) {
          let x: number;
          let y: number;
          let z: number;
          
          const xVal = removeMatch[1];
          const yVal = removeMatch[2];
          const zVal = removeMatch[3];
          
          if (!isNaN(Number(xVal))) {
            x = parseInt(xVal);
          } else {
            x = ctx[xVal] !== undefined ? ctx[xVal] : 0;
          }
          
          if (!isNaN(Number(yVal))) {
            y = parseInt(yVal);
          } else {
            y = ctx[yVal] !== undefined ? ctx[yVal] : 0;
          }
          
          if (!isNaN(Number(zVal))) {
            z = parseInt(zVal);
          } else {
            z = ctx[zVal] !== undefined ? ctx[zVal] : 0;
          }
          
          const result = ctx.remove_block(x, y, z);
          res.push(result);
          return currentIndex + 1;
        }

        // Parse build_tower: positional (x,y,z,height,color) OR mixed (x,y,z, height=, color=) OR keyword (x=, y=, z=, height=, color=) OR no-arg
        const towerParenMatch = trimmed.match(/build_tower\s*\(([^)]*)\)/);
        if (towerParenMatch) {
          const args = towerParenMatch[1];
          // A. Full positional: four or five values (x, y, z, height [, color])
          const fullPosMatch = args.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*["']?(\w+)["']?)?\s*$/);
          if (fullPosMatch) {
            const result = ctx.build_tower(
              parseInt(fullPosMatch[1]),
              parseInt(fullPosMatch[2]),
              parseInt(fullPosMatch[3]),
              parseInt(fullPosMatch[4]),
              fullPosMatch[5] || 'red'
            );
            res.push(result);
            return currentIndex + 1;
          }
          // B. Mixed: three numbers then optional keywords (e.g. 1, 0, 1, height=5)
          const mixedMatch = args.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,/);
          if (mixedMatch) {
            const x = parseInt(mixedMatch[1]);
            const y = parseInt(mixedMatch[2]);
            const z = parseInt(mixedMatch[3]);
            const heightMatch = args.match(/height\s*=\s*(\d+)/);
            const colorMatch = args.match(/color\s*=\s*["']?(\w+)["']?/);
            const height = heightMatch ? parseInt(heightMatch[1]) : 5;
            const color = colorMatch ? colorMatch[1] : 'red';
            const result = ctx.build_tower(x, y, z, height, color);
            res.push(result);
            return currentIndex + 1;
          }
          // C. Keyword-only: height=, x=, y=, z=, color=
          if (args.includes('height=') || args.includes('x=') || args.includes('y=') || args.includes('z=') || args.includes('color=')) {
            const heightMatch = args.match(/height\s*=\s*(\d+)/);
            const xMatch = args.match(/x\s*=\s*(\d+)/);
            const yMatch = args.match(/y\s*=\s*(\d+)/);
            const zMatch = args.match(/z\s*=\s*(\d+)/);
            const colorMatch = args.match(/color\s*=\s*["']?(\w+)["']?/);
            const x = xMatch ? parseInt(xMatch[1]) : 0;
            const y = yMatch ? parseInt(yMatch[1]) : 0;
            const z = zMatch ? parseInt(zMatch[1]) : 0;
            const height = heightMatch ? parseInt(heightMatch[1]) : 5;
            const color = colorMatch ? colorMatch[1] : 'red';
            const result = ctx.build_tower(x, y, z, height, color);
            res.push(result);
            return currentIndex + 1;
          }
          // D. No-arg
          const result = ctx.build_tower();
          res.push(result);
          return currentIndex + 1;
        }

        // Parse create_wall: positional (x,y,z,length,...) OR keyword (length=, direction=, x=, y=, z=, ...) OR no-arg
        const wallParenMatch = trimmed.match(/create_wall\s*\(([^)]*)\)/);
        if (wallParenMatch) {
          const args = wallParenMatch[1];
          // Positional form: starts with digit (x, y, z, length, ...)
          const positionalMatch = args.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+))?(?:\s*,\s*["'](\w+)["'])?(?:\s*,\s*["']([xz])["'])?\s*$/);
          if (positionalMatch) {
            const result = ctx.create_wall(
              parseInt(positionalMatch[1]),
              parseInt(positionalMatch[2]),
              parseInt(positionalMatch[3]),
              parseInt(positionalMatch[4]),
              positionalMatch[5] ? parseInt(positionalMatch[5]) : 1,
              positionalMatch[6] || 'blue',
              positionalMatch[7] || 'x'
            );
            res.push(result);
            return currentIndex + 1;
          }
          // Keyword form: length=N and optional direction=, x=, y=, z=, height=, color=
          if (args.includes('length=')) {
            const lengthMatch = args.match(/length\s*=\s*(\d+)/);
            const length = lengthMatch ? parseInt(lengthMatch[1]) : 10;
            const dirMatch = args.match(/direction\s*=\s*["']([xz])["']/i);
            const direction = dirMatch ? dirMatch[1].toLowerCase() : 'x';
            const xMatch = args.match(/x\s*=\s*(\d+)/);
            const yMatch = args.match(/y\s*=\s*(\d+)/);
            const zMatch = args.match(/z\s*=\s*(\d+)/);
            const x = xMatch ? parseInt(xMatch[1]) : 0;
            const y = yMatch ? parseInt(yMatch[1]) : 0;
            const z = zMatch ? parseInt(zMatch[1]) : 0;
            const heightMatch = args.match(/height\s*=\s*(\d+)/);
            const height = heightMatch ? parseInt(heightMatch[1]) : 1;
            const colorMatch = args.match(/color\s*=\s*["'](\w+)["']/);
            const color = colorMatch ? colorMatch[1] : 'blue';
            const result = ctx.create_wall(x, y, z, length, height, color, direction);
            res.push(result);
            return currentIndex + 1;
          }
          // create_wall() - no args, use defaults
          const result = ctx.create_wall();
          res.push(result);
          return currentIndex + 1;
        }

        // Parse clear_all()
        if (trimmed.match(/clear_all\s*\(\s*\)/)) {
          const result = ctx.clear_all();
          res.push(result);
          return currentIndex + 1;
        }
        
        // If no match, just return next index
        return currentIndex + 1;
      }

      if (results.length > 0) {
        const lastResult = results[results.length - 1];
        setMessage(lastResult.message || 'Code executed successfully!');
      } else {
        setMessage('Code executed, but no blocks were placed. Check your commands!');
      }

      // Check challenge completion after state updates
      // Use a longer timeout to ensure blocks state is updated
      setTimeout(() => {
        checkChallengeCompletion();
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'An error occurred while executing your code');
    } finally {
      setExecuting(false);
    }
  };

  const checkChallengeCompletion = () => {
    // Don't check if already showing success (prevents multiple triggers)
    if (showSuccess) return;
    
    const req = challenge.requirements;
    let completed = true;

    // Check minimum blocks requirement
    if (req.minBlocks && blocks.length < req.minBlocks) {
      completed = false;
    }
    // Check minimum removals requirement (for door/window challenges)
    if (req.minRemoved != null && removedCount < req.minRemoved) {
      completed = false;
    }

    // Debug logging
    console.log('Challenge check:', {
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      blocksCount: blocks.length,
      requiredBlocks: req.minBlocks,
      removedCount,
      requiredRemoved: req.minRemoved,
      completed
    });

    const removalsOk = req.minRemoved == null || removedCount >= req.minRemoved;
    if (completed && blocks.length >= (req.minBlocks || 0) && removalsOk) {
      // Challenge completed!
      console.log('Challenge completed!', challenge.title);
      addExperience(challenge.xpReward);
      addCoins(challenge.coinsReward);
      addPoints(50 + (challenge.id * 25));
      setShowSuccess(true);

      // Auto-advance to next challenge
      setTimeout(() => {
        if (currentChallenge < CHALLENGES.length - 1) {
          const nextChallenge = currentChallenge + 1;
          setCurrentChallenge(nextChallenge);
          setRemovedCount(0);
          // Don't clear blocks - let user keep their build
          setShowSuccess(false);
        }
      }, 2000);
    }
  };

  const resetBuild = () => {
    setBlocks([]);
    setRemovedCount(0);
    setMessage('');
    setError('');
    setCharacterPosition({ x: 0, y: 0.5, z: 0 });
    setCharacterRotation(0);
    if (characterMeshRef.current) {
      characterMeshRef.current.position.set(0, 0.5, 0);
      characterMeshRef.current.rotation.y = 0;
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'editor' ? 'firstperson' : 'editor');
  };

  const getHintsForChallenge = (challengeId: number): string[] => {
    const hints: { [key: number]: string[] } = {
      1: [
        'Use place_block(0, 0, 0, "red") to place your first block at the origin.',
        'The place_block function takes x, y, z coordinates and a color name in quotes.',
        'Try: place_block(0, 0, 0, "red")'
      ],
      2: [
        'Use build_tower(height=5) to create a tower 5 blocks high.',
        'The build_tower function automatically stacks blocks vertically.',
        'Example: build_tower(height=5) will create 5 blocks at (0,0,0), (0,1,0), (0,2,0), etc.'
      ],
      3: [
        'Use create_wall(length=10) to build a horizontal wall.',
        'The create_wall function places blocks in a line along the x-axis.',
        'Example: create_wall(length=10) creates 10 blocks from (0,0,0) to (9,0,0).'
      ],
      4: [
        'Build a wall with create_wall(length=10), then use remove_block(x, y, z) to make an opening.',
        'Pick coordinates of one block in the wall (e.g. (5, 0, 0) for a wall along x) and remove it.',
        'Example: create_wall(length=10) then remove_block(5, 0, 0) creates a door opening.'
      ],
      5: [
        'You need two openings: use remove_block() twice with different coordinates.',
        'Build a wall (at least 10 blocks), then remove two blocks to make a door and a window.',
        'Example: create_wall(length=10), then remove_block(3, 0, 0) and remove_block(7, 0, 0).'
      ],
      6: [
        'Use a for loop to build a pyramid layer by layer.',
        'Try: for i in range(4): build_tower(height=4-i, x=i, z=i)',
        'Each layer of the pyramid should be smaller than the one below it. Start with a 4-block base and decrease by 1 each layer.'
      ],
      7: [
        'Build two towers, then connect them with blocks.',
        'Try: build_tower(height=3, x=0, z=0) and build_tower(height=3, x=5, z=0)',
        'Then use place_block() or a loop to place blocks between the towers at the same height.'
      ],
      8: [
        'Use a for loop to place blocks that go up one step at a time.',
        'Try: for i in range(5): place_block(i, i, 0, "red")',
        'Each step should be one block higher (y coordinate increases) and one block forward (x coordinate increases).'
      ],
      9: [
        'Build a tall central tower, then add walls around it.',
        'Start with build_tower(height=8) for the center, then use create_wall() to build walls around it.',
        'You can use multiple create_wall() calls at different positions to create a square or rectangular base.'
      ],
      10: [
        'Build four walls to form the base of the house, then add a roof on top.',
        'Use create_wall() to build each of the four walls. Try walls at different positions and directions.',
        'Then use place_block() or build_tower() to add a roof on top of the walls. The roof should be at a higher y coordinate than the walls.'
      ]
    };
    return hints[challengeId] || ['Keep trying! You can do it!'];
  };

  const purchaseHint = (hintLevel: number) => {
    const cost = hintLevel * 10;
    if (character.coins < cost) {
      setError(`Not enough coins! You need ${cost} coins for this hint.`);
      return;
    }

    addCoins(-cost);
    const hints = getHintsForChallenge(challenge.id);
    setHintText(hints[hintLevel - 1]);
    setShowHintModal(true);
  };

  return (
    <ProtectedRoute>
      <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
        <Navigation />
        <div className="block-builder-page">
          <div className="block-builder-header">
            <h1>🎮 3D Block Builder</h1>
            <div className="block-builder-stats">
              <span>Challenge {currentChallenge + 1} of {CHALLENGES.length}</span>
              <span>⭐ {character.experience} XP</span>
              <span>🪙 {character.coins} Coins</span>
              <span>🏆 {character.points || 0} Points</span>
            </div>
          </div>

          <div className="block-builder-content">
            {/* Left Panel - Code Editor */}
            <div className="block-builder-editor-panel">
              <div className="challenge-info">
                <h2>{challenge.title}</h2>
                <p>{challenge.description}</p>
                <div className="challenge-box">
                  <strong>Challenge:</strong> {challenge.challenge}
                </div>
              </div>

              {/* How to Play Instructions - Collapsible */}
              <div className="how-to-play-panel">
                <div 
                  className="how-to-play-header"
                  onClick={() => setShowHowToPlay(!showHowToPlay)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <h3>🎮 How to Play</h3>
                  <span className="dropdown-arrow">{showHowToPlay ? '▲' : '▼'}</span>
                </div>
                {showHowToPlay && (
                  <div className="how-to-play-content" style={{ display: 'block' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ color: '#2a5298', marginBottom: '8px' }}>📝 How It Works:</h4>
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>Write <strong>Python code</strong> in the editor to place and manipulate blocks in the 3D world</li>
                        <li>Use commands like <code>place_block(x, y, z, "color")</code> to place individual blocks</li>
                        <li>Use <code>build_tower(height=5)</code> to quickly build vertical structures; use <code>build_tower(1, 0, 1, height=5)</code> or <code>build_tower(x=1, z=1, height=5)</code> to place a tower at a specific location</li>
                        <li>Use <code>create_wall(length=10)</code> to build horizontal walls</li>
                        <li><strong>Coordinates guide:</strong> <code>x</code> is left ↔ right, <code>y</code> is up ↕ down (height), and <code>z</code> is forward ↔ back on the grid. The X/Z numbers around the grid match these values.</li>
                        <li>Click <strong>"▶ Run Code"</strong> or press <strong>Ctrl+Enter</strong> to execute your code</li>
                        <li>Watch your blocks appear in the <strong>3D World</strong> on the right!</li>
                        <li>Complete challenges to earn XP, coins, and points!</li>
                      </ul>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ color: '#2a5298', marginBottom: '8px' }}>💡 Command Examples:</h4>
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li><code>place_block(0, 0, 0, "red")</code> - Place a red block at position (0, 0, 0)</li>
                        <li><code>place_block(2, 4, 4, "blue")</code> - Place a blue block at position (2, 4, 4)</li>
                        <li><strong>⚠️ Important:</strong> Always use commas between ALL parameters, including before the color!</li>
                        <li><strong>❌ Wrong:</strong> <code>place_block(2, 4, 4 "red")</code> - Missing comma!</li>
                        <li><strong>✅ Correct:</strong> <code>place_block(2, 4, 4, "red")</code> - All commas included!</li>
                        <li><code>build_tower(height=5)</code> - Build a tower 5 blocks high at (0,0,0)</li>
                        <li><code>build_tower(1, 0, 1, height=5)</code> or <code>build_tower(x=1, z=1, height=5)</code> - Tower at (1,0,1)</li>
                        <li><code>create_wall(length=10)</code> - Create a wall 10 blocks long (along x-axis)</li>
                        <li><code>create_wall(length=10, direction="z")</code> - Create a wall 10 blocks long (along z-axis, perpendicular!)</li>
                        <li><code>create_wall(0, 0, 0, 10, 1, "blue", "z")</code> - Blue wall at (0,0,0) along z-axis (positional)</li>
                        <li><code>create_wall(x=2, z=4, length=10, direction="z")</code> - Wall at (2,0,4) along z-axis (keyword position)</li>
                        <li><code>remove_block(0, 0, 0)</code> - Remove a block at a position</li>
                        <li><code>clear_all()</code> - Remove all blocks</li>
                      </ul>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ color: '#2a5298', marginBottom: '8px' }}>🔄 Using Loops:</h4>
                      <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        <li>You can use Python <code>for</code> loops to build complex structures!</li>
                        <li>Example: <code>for i in range(5): place_block(i, 0, 0, "red")</code></li>
                        <li>This places 5 red blocks in a line from (0,0,0) to (4,0,0)</li>
                        <li>Remember to indent code inside loops (use spaces or tabs)</li>
                      </ul>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ color: '#2a5298', marginBottom: '8px' }}>🎨 Available Colors:</h4>
                      <p style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        red, blue, green, yellow, orange, purple, pink, brown, black, white
                      </p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ color: '#2a5298', marginBottom: '8px' }}>💡 Need More Help?</h4>
                      <p style={{ marginLeft: '20px', lineHeight: '1.6' }}>
                        Use the hint buttons below to get help with the current challenge. Each hint costs coins (10, 20, or 30 coins).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="code-editor-section">
                <h3>Python Code Editor</h3>
                <textarea
                  className="block-code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      if (!executing && code.trim()) {
                        executePythonCode(code);
                      }
                    }
                  }}
                  placeholder="Write Python code to build with blocks..."
                  spellCheck={false}
                />
              </div>

              <div className="command-reference">
                <h4>Available Commands:</h4>
                <ul>
                  <li><code>place_block(x, y, z, "color")</code> - Place a block</li>
                  <li><code>remove_block(x, y, z)</code> - Remove a block</li>
                  <li><code>build_tower(height=5)</code> - Build a tower; <code>build_tower(1, 0, 1, height=5)</code> - tower at (1,0,1)</li>
                  <li><code>create_wall(length=10)</code> - Wall along x-axis; use <code>direction="z"</code> for z-axis</li>
                  <li><code>create_wall(x=2, z=4, length=10, direction="z")</code> - Wall at (2,0,4) along z-axis</li>
                  <li><code>clear_all()</code> - Clear all blocks</li>
                </ul>
              </div>

              <div className="editor-actions">
                <button
                  className="run-code-btn"
                  onClick={() => executePythonCode(code)}
                  disabled={executing || !code.trim()}
                >
                  {executing ? '⏳ Executing...' : '▶ Run Code'}
                </button>
                <button
                  className="reset-btn"
                  onClick={resetBuild}
                >
                  🗑️ Clear All
                </button>
                <button
                  className="view-toggle-btn"
                  onClick={toggleViewMode}
                >
                  {viewMode === 'editor' ? '👁️ First Person' : '📝 Editor View'}
                </button>
              </div>

              {/* Hint System */}
              <div className="hint-section">
                <h4>💡 Need Help?</h4>
                <div className="hint-buttons">
                  <button
                    className="hint-btn"
                    onClick={() => purchaseHint(1)}
                    disabled={character.coins < 10}
                  >
                    💡 Hint 1 (10 coins)
                  </button>
                  <button
                    className="hint-btn"
                    onClick={() => purchaseHint(2)}
                    disabled={character.coins < 20}
                  >
                    💡 Hint 2 (20 coins)
                  </button>
                  <button
                    className="hint-btn"
                    onClick={() => purchaseHint(3)}
                    disabled={character.coins < 30}
                  >
                    💡 Hint 3 (30 coins)
                  </button>
                </div>
              </div>

              {/* Hint Modal */}
              {showHintModal && (
                <div className="hint-modal-overlay" onClick={() => setShowHintModal(false)}>
                  <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                    <h3>💡 Hint</h3>
                    <p>{hintText}</p>
                    <button className="close-hint-btn" onClick={() => setShowHintModal(false)}>
                      Close
                    </button>
                  </div>
                </div>
              )}

              {message && (
                <div className="success-message">
                  ✅ {message}
                </div>
              )}

              {error && (
                <div className="error-message">
                  ❌ {error}
                </div>
              )}

              {showSuccess && (
                <div className="challenge-complete-modal">
                  <h2>🎉 Challenge Complete!</h2>
                  <p>You earned:</p>
                  <div className="rewards">
                    <div>⭐ {challenge.xpReward} XP</div>
                    <div>🪙 {challenge.coinsReward} Coins</div>
                    <div>🏆 {50 + (challenge.id * 25)} Points</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - 3D World */}
            <div className="block-builder-world-panel">
              <div className="world-header">
                <h3>3D World</h3>
                <div className="world-stats">
                  <span>Blocks: {blocks.length}</span>
                </div>
              </div>
              <div 
                ref={sceneRef} 
                className="threejs-container"
                style={{ width: '100%', height: '100%', position: 'relative', cursor: viewMode === 'firstperson' ? 'none' : 'default' }}
              >
                {viewMode === 'firstperson' && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '0.9rem',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}>
                    <div>🎮 First Person Mode</div>
                    <div style={{ marginTop: '5px', fontSize: '0.8rem', opacity: 0.9 }}>
                      <div>Arrow Keys / WASD: Move</div>
                      <div>Q/E: Rotate</div>
                      <div>Click + Drag: Look Around</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
