"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, Float, Preload, RoundedBox, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

import { TEXTURES } from "@/lib/collection";

const RING_RADIUS = 3.15;
const SNOW_COUNT = 420;
const SNOW_SPAN = 15;

/** One collection card: frosted slab with the art inlaid on the front face. */
function GuinCard({ texture, angle }: { texture: THREE.Texture; angle: number }) {
  const position = useMemo<[number, number, number]>(
    () => [Math.sin(angle) * RING_RADIUS, 0, Math.cos(angle) * RING_RADIUS],
    [angle],
  );

  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.7}>
      <group position={position} rotation={[0, angle, 0]}>
        <RoundedBox args={[1.72, 1.86, 0.16]} radius={0.08} smoothness={4}>
          <meshPhysicalMaterial
            color="#9fc0ff"
            roughness={0.12}
            metalness={0.05}
            transmission={0.85}
            thickness={0.6}
            ior={1.35}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[1.5, 1.62]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.55}
            metalness={0}
            emissive="#ffffff"
            emissiveMap={texture}
            emissiveIntensity={0.28}
          />
        </mesh>
      </group>
    </Float>
  );
}

/** The carousel of cards, rotating slowly and leaning toward the cursor. */
function GuinRing() {
  const group = useRef<THREE.Group>(null);
  const textures = useTexture([...TEXTURES], (loaded) => {
    // Runs at load time, not during render, so the textures stay untouched by React.
    for (const texture of loaded as THREE.Texture[]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
    }
  });

  useFrame((state, delta) => {
    const ring = group.current;
    if (!ring) return;

    ring.rotation.y += delta * 0.16;
    // Ease the whole ring toward the pointer for a hand-held parallax feel.
    ring.rotation.x = THREE.MathUtils.lerp(ring.rotation.x, -state.pointer.y * 0.22, 0.05);
    ring.position.y = THREE.MathUtils.lerp(ring.position.y, state.pointer.y * 0.25, 0.05);
  });

  return (
    <group ref={group}>
      {textures.map((texture, index) => (
        <GuinCard
          key={texture.uuid}
          texture={texture}
          angle={(index / textures.length) * Math.PI * 2}
        />
      ))}
    </group>
  );
}

/** Faceted ice chunks orbiting outside the ring. */
function IceShards() {
  const shards = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2 + 0.4;
        const radius = 4.4 + (index % 3) * 0.9;
        return {
          key: index,
          position: [
            Math.sin(angle) * radius,
            Math.sin(index * 2.1) * 2.2,
            Math.cos(angle) * radius - 1.5,
          ] as [number, number, number],
          scale: 0.22 + (index % 4) * 0.13,
          speed: 0.8 + (index % 5) * 0.25,
        };
      }),
    [],
  );

  return (
    <>
      {shards.map((shard) => (
        <Float key={shard.key} speed={shard.speed} rotationIntensity={1.6} floatIntensity={1.4}>
          <mesh position={shard.position} scale={shard.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color="#cfe4ff"
              roughness={0.05}
              transmission={0.95}
              thickness={1.1}
              ior={1.31}
              flatShading
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/** Deterministic pseudo-random in [0, 1). Keeps the field identical every render. */
function noise(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Depth snow inside the 3D scene, layered under the page-wide canvas snow. */
function SnowField() {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i += 1) {
      positions[i * 3] = (noise(i + 1) - 0.5) * 22;
      positions[i * 3 + 1] = noise(i + 101) * SNOW_SPAN;
      positions[i * 3 + 2] = (noise(i + 211) - 0.5) * 14 - 2;
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return buffer;
  }, []);

  useFrame((state) => {
    const mesh = points.current;
    if (!mesh) return;

    // Y is uniform across exactly SNOW_SPAN, so wrapping the whole field by that
    // span is invisible, with no per-particle bookkeeping needed.
    const elapsed = state.clock.elapsedTime;
    mesh.position.y = -((elapsed * 0.45) % SNOW_SPAN) - SNOW_SPAN / 2 + SNOW_SPAN;
    mesh.rotation.z = Math.sin(elapsed * 0.15) * 0.06;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        color="#f4f8ff"
        size={0.055}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Frames the ring for the viewport and, when motion is allowed, leans the camera
 * toward the pointer. Distance widens on narrow screens so no card gets cropped.
 */
function CameraRig({ interactive }: { interactive: boolean }) {
  useFrame((state, delta) => {
    // Read the camera off the frame state. It is a live scene object, not React state.
    const { camera, size, pointer } = state;
    const distance = size.width < 640 ? 10.4 : size.width < 1024 ? 8.6 : 7.2;
    // On wide screens the copy owns the left half, so aim left of centre to
    // push the ring across to the right.
    const focusX = size.width >= 1024 ? -1.9 : 0;
    const targetX = interactive ? pointer.x * 0.9 : 0;
    const targetY = interactive ? 0.4 + pointer.y * 0.5 : 0.4;

    if (interactive) {
      const damp = 1 - Math.pow(0.001, delta);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, damp);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, damp);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, distance, damp);
    } else {
      // Reduced motion runs on demand, so a single frame has to land on target.
      camera.position.set(targetX, targetY, distance);
    }

    camera.lookAt(focusX, 0, 0);
  });

  return null;
}

export default function GuinScene({ reduceMotion = false }: { reduceMotion?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 7.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={reduceMotion ? "demand" : "always"}
      fallback={null}
    >
      <fog attach="fog" args={["#050a1c", 9, 26]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#eaf2ff" />
      <directionalLight position={[-6, -2, -4]} intensity={0.7} color="#7f9fe0" />
      <pointLight position={[3.5, -2.5, 3]} intensity={22} color="#c9ff3d" distance={12} />

      <Suspense fallback={null}>
        <GuinRing />
        <IceShards />
        <SnowField />
        <Preload all />
      </Suspense>

      <CameraRig interactive={!reduceMotion} />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
