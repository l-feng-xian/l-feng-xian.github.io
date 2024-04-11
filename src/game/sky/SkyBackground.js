import * as THREE from 'three'

import vertexShader from '../shaders/skyBackground/vertex.glsl'
import fragmentShader from '../shaders/skyBackground/fragment.glsl'

function SkyBackground()
{
    const material = new THREE.ShaderMaterial({
        uniforms:
        {
            uTexture: { value: null }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    })

    return material
}
export default SkyBackground