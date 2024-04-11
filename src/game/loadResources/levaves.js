import * as THREE from 'three';

import vertexShader from '../shaders/leaves/vertex.glsl';
import fragmentShader from '../shaders/leaves/fragment.glsl';

function Levaves(enabled, remap, normalize, texture) {
    const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms:
        {
            u_effectBlend: { value: enabled },
            u_remap: { value: remap ? 1.0 : 0.0 },
            u_normalize: { value: normalize ? 1.0 : 0.0 },
            u_Texture: { value: texture },
            u_Color: { value: new THREE.Color(1.0, 0.5, 0.5) }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    return material;
};

export default Levaves;