'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text3D, Center, MeshDistortMaterial, Sphere } from '@react-three/drei'
import { Mesh, Vector3 } from 'three'
import * as THREE from 'three'

// Floating geometric shapes component
function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<Mesh[]>([])

  // Generate random positions for shapes
  const shapes = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 1.5,
      type: Math.floor(Math.random() * 4), // 0: box, 1: sphere, 2: torus, 3: octahedron
    }))
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }

    // Animate individual shapes
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.x += 0.01 * (i % 2 === 0 ? 1 : -1)
        mesh.rotation.y += 0.01 * (i % 3 === 0 ? 1 : -1)
        mesh.position.y += Math.sin(state.clock.elapsedTime + i) * 0.002
      }
    })
  })

  const renderShape = (shape: any, index: number) => {
    const commonProps = {
      key: shape.id,
      position: shape.position,
      rotation: shape.rotation,
      scale: shape.scale,
      ref: (ref: Mesh) => {
        if (ref) meshRefs.current[index] = ref
      },
    }

    const material = (
      <meshStandardMaterial
        color={`hsl(${200 + Math.random() * 60}, 70%, 60%)`}
        transparent
        opacity={0.3}
        wireframe={Math.random() > 0.7}
      />
    )

    switch (shape.type) {
      case 0:
        return (
          <mesh {...commonProps}>
            <boxGeometry args={[1, 1, 1]} />
            {material}
          </mesh>
        )
      case 1:
        return (
          <mesh {...commonProps}>
            <sphereGeometry args={[0.5, 16, 16]} />
            {material}
          </mesh>
        )
      case 2:
        return (
          <mesh {...commonProps}>
            <torusGeometry args={[0.5, 0.2, 8, 16]} />
            {material}
          </mesh>
        )
      case 3:
        return (
          <mesh {...commonProps}>
            <octahedronGeometry args={[0.7]} />
            {material}
          </mesh>
        )
      default:
        return null
    }
  }

  return (
    <group ref={groupRef}>
      {shapes.map((shape, index) => renderShape(shape, index))}
    </group>
  )
}

// Particle system component
function ParticleSystem() {
  const pointsRef = useRef<THREE.Points>(null)
  
  const particles = useMemo(() => {
    const positions = new Float32Array(1000 * 3)
    const colors = new Float32Array(1000 * 3)
    
    for (let i = 0; i < 1000; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
      
      // Color
      const color = new THREE.Color()
      color.setHSL(0.6 + Math.random() * 0.2, 0.7, 0.6)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={1000}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={1000}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Central orb component
function CentralOrb() {
  const orbRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.5
      orbRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      orbRef.current.scale.setScalar(scale)
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={orbRef} position={[0, 0, 0]}>
        <Sphere args={[1.5, 64, 64]}>
          <MeshDistortMaterial
            color="#3b82f6"
            transparent
            opacity={0.4}
            distort={0.3}
            speed={2}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
      </mesh>
    </Float>
  )
}

// Floating text component
function FloatingText() {
  const textRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      textRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5
    }
  })

  return (
    <group ref={textRef} position={[0, 3, -2]}>
      <Center>
        <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.5}
            height={0.1}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            AI Studio
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.8}
              emissive="#3b82f6"
              emissiveIntensity={0.2}
            />
          </Text3D>
        </Float>
      </Center>
    </group>
  )
}

// Main Hero3D component
export function Hero3D() {
  return (
    <group>
      {/* Ambient elements */}
      <ParticleSystem />
      <FloatingShapes />
      
      {/* Central focus */}
      <CentralOrb />
      
      {/* Text */}
      <FloatingText />
      
      {/* Additional lighting */}
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#8b5cf6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#ffffff"
        castShadow
      />
    </group>
  )
}