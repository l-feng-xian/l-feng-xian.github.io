import * as THREE from 'three';

export default function GetModelSize(model) {
    const vec3_4 = new THREE.Vector3();
    const bbox = new THREE.Box3();
    bbox.expandByObject(model);
    const size = bbox.getSize(vec3_4);
    
    return size;
}