import * as THREE from 'three';

export default function (texture) {
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xFF7677,
    });
    return material;
}