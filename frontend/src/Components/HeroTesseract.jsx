import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COLOR_DARK = '#2dd4bf'
const COLOR_LIGHT = '#6293ba'

function TesseractModel({ color }) {
  const lineRef = useRef()

  const vertices4D = useMemo(() => {
    const verts = []
    for (let i = 0; i < 16; i++) {
      verts.push(new THREE.Vector4(
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1
      ))
    }
    return verts
  }, [])

  const edges = useMemo(() => {
    const edgeList = []
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0
        for (let k = 0; k < 4; k++) {
          if (vertices4D[i].getComponent(k) !== vertices4D[j].getComponent(k)) diff++
        }
        if (diff === 1) edgeList.push([i, j])
      }
    }
    return edgeList
  }, [vertices4D])

  const geometry = useMemo(() => {
    const positions = new Float32Array(edges.length * 2 * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [edges])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const angleXW = t * 0.035
    const angleYZ = t * 0.06125
    const cosXW = Math.cos(angleXW), sinXW = Math.sin(angleXW)
    const cosYZ = Math.cos(angleYZ), sinYZ = Math.sin(angleYZ)

    const positions = geometry.attributes.position.array
    let idx = 0

    edges.forEach(([i, j]) => {
      ;[vertices4D[i], vertices4D[j]].forEach(v => {
        let x = v.x, y = v.y, z = v.z, w = v.w

        const x1 = x * cosXW - w * sinXW
        const w1 = x * sinXW + w * cosXW

        const y1 = y * cosYZ - z * sinYZ
        const z1 = y * sinYZ + z * cosYZ

        const d = 3.5
        const scale = 1.8 / (w1 + d)

        positions[idx++] = x1 * scale
        positions[idx++] = y1 * scale
        positions[idx++] = z1 * scale
      })
    })

    geometry.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} opacity={0.7} transparent />
    </lineSegments>
  )
}

function VertexDots({ color }) {
  const vertices4D = useMemo(() => {
    const verts = []
    for (let i = 0; i < 16; i++) {
      verts.push(new THREE.Vector4(
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1
      ))
    }
    return verts
  }, [])

  const pointGeo = useMemo(() => {
    const positions = new Float32Array(16 * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const angleXW = t * 0.035
    const angleYZ = t * 0.06125
    const cosXW = Math.cos(angleXW), sinXW = Math.sin(angleXW)
    const cosYZ = Math.cos(angleYZ), sinYZ = Math.sin(angleYZ)

    const positions = pointGeo.attributes.position.array
    let idx = 0

    vertices4D.forEach(v => {
      let x = v.x, y = v.y, z = v.z, w = v.w
      const x1 = x * cosXW - w * sinXW
      const w1 = x * sinXW + w * cosXW
      const y1 = y * cosYZ - z * sinYZ
      const z1 = y * sinYZ + z * cosYZ
      const d = 3.5
      const scale = 1.8 / (w1 + d)

      positions[idx++] = x1 * scale
      positions[idx++] = y1 * scale
      positions[idx++] = z1 * scale
    })

    pointGeo.attributes.position.needsUpdate = true
  })

  return (
    <points geometry={pointGeo}>
      <pointsMaterial
        size={0.12}
        color={color}
        opacity={1}
        transparent
        sizeAttenuation
      />
    </points>
  )
}

function InfinitySymbol({ color }) {
  const ref = useRef()
  const streakRef = useRef()
  const streakRef2 = useRef()

  const curve = useMemo(() => {
    const pts = []
    const a = 0.5
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2
      const denom = 1 + Math.sin(t) * Math.sin(t)
      pts.push(new THREE.Vector3(
        a * Math.cos(t) / denom,
        a * Math.sin(t) * Math.cos(t) / denom,
        0
      ))
    }
    return new THREE.CatmullRomCurve3(pts)
  }, [])

  const geo = useMemo(() =>
    new THREE.TubeGeometry(curve, 64, 0.016, 6, true),
  [curve])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ref.current.rotation.x = t * 0.15
    ref.current.rotation.z = t * 0.1
    if (streakRef.current) {
      const progress = (t * 0.112) % 1
      const pos = curve.getPointAt(progress)
      streakRef.current.position.copy(pos)
    }
    if (streakRef2.current) {
      const progress2 = ((0.5 - t * 0.112) % 1 + 1) % 1
      const pos2 = curve.getPointAt(progress2)
      streakRef2.current.position.copy(pos2)
    }
  })

  return (
    <group ref={ref} scale={0.3}>
      <mesh geometry={geo}>
        <meshBasicMaterial color={color} opacity={0.9} transparent />
      </mesh>
      <mesh ref={streakRef}>
        <sphereGeometry args={[0.0357, 12, 12]} />
        <meshBasicMaterial color={color} opacity={0.6} transparent />
      </mesh>
      <mesh ref={streakRef2}>
        <sphereGeometry args={[0.0357, 12, 12]} />
        <meshBasicMaterial color={color} opacity={0.6} transparent />
      </mesh>
      <pointLight intensity={3} distance={1} color={color} decay={1} />
    </group>
  )
}

function InnerCube({ color }) {
  const groupRef = useRef()
  const lineRef = useRef()

  const cubeVerts = useMemo(() => [
    [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1],
    [-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]
  ], [])

  const geo = useMemo(() => {
    const cubeEdges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ]
    const positions = new Float32Array(cubeEdges.length * 2 * 3)
    let idx = 0
    cubeEdges.forEach(([i, j]) => {
      positions[idx++] = cubeVerts[i][0]
      positions[idx++] = cubeVerts[i][1]
      positions[idx++] = cubeVerts[i][2]
      positions[idx++] = cubeVerts[j][0]
      positions[idx++] = cubeVerts[j][1]
      positions[idx++] = cubeVerts[j][2]
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [cubeVerts])

  const pointGeo = useMemo(() => {
    const positions = new Float32Array(cubeVerts.length * 3)
    let idx = 0
    cubeVerts.forEach(([x, y, z]) => {
      positions[idx++] = x
      positions[idx++] = y
      positions[idx++] = z
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [cubeVerts])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const rotX = t * 0.021
    const rotY = t * 0.035
    groupRef.current.rotation.x = rotX
    groupRef.current.rotation.y = rotY
  })

  return (
    <group ref={groupRef}>
      <lineSegments ref={lineRef} geometry={geo}>
        <lineBasicMaterial color={color} opacity={0.15} transparent />
      </lineSegments>
      <points geometry={pointGeo}>
        <pointsMaterial
          size={0.08}
          color={color}
          opacity={0.5}
          transparent
          sizeAttenuation
        />
      </points>
    </group>
  )
}

function Particles({ color }) {
  const count = 1000
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        opacity={0.6}
        transparent
        sizeAttenuation
      />
    </points>
  )
}

export default function HeroTesseract() {
  const [color, setColor] = useState(COLOR_DARK)
  const [scale, setScale] = useState(2)
  const [posX, setPosX] = useState(3)
  const [posY, setPosY] = useState(0.3)

  useEffect(() => {
    const update = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      const isClaro = theme === 'claro'
      const w = window.innerWidth

      let s, x, y
      if (w < 640) {
        s = isClaro ? 1.2 : 1
        x = 0
        y = 1.6
      } else if (w < 900) {
        s = isClaro ? 1.6 : 1.3
        x = 0.8
        y = 1.5
      } else if (w < 1200) {
        s = isClaro ? 2 : 1.6
        x = 1.8
        y = 0.8
      } else {
        s = isClaro ? 2.3 : 2
        x = 3
        y = 0.3
      }

      setColor(isClaro ? COLOR_LIGHT : COLOR_DARK)
      setScale(s)
      setPosX(x)
      setPosY(y)
    }
    update()
    window.addEventListener('resize', update)
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      window.removeEventListener('resize', update)
      obs.disconnect()
    }
  }, [])

  return (
    <div className="hero-canvas">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight />
        <group position={[posX, posY, 0]} scale={scale}>
          <TesseractModel color={color} />
          <VertexDots color={color} />
          <InnerCube color={color} />
          <InfinitySymbol color={color} />
        </group>
        <Particles color={color} />
      </Canvas>
    </div>
  )
}
