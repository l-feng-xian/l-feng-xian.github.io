import * as THREE from 'three'

import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'

function Tunnel() {
    const material = new THREE.ShaderMaterial({
        uniforms:
        {
            uTime: { value: 0 },
            uColorStart: { value: new THREE.Color('#c9ffeb') },
            uColorEnd: { value: new THREE.Color('#b2e4ff') },
            
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: false,
        side: THREE.DoubleSide,
        // blending: THREE.AdditiveBlending,
    })

    return material;
}

export default Tunnel;