uniform sampler2D uNoiseTexture;
uniform float uNoiseScale;
uniform float uTime;

varying vec3 vColor;
varying vec2 vGlobalUV;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vWindColor;
void main(){
    #include<color_vertex>
    
    // FOG
    #include<begin_vertex>
    #include<project_vertex>
    #include<fog_vertex>
    // FOG
    
    // SHADOW
    #include<beginnormal_vertex>
    #include<defaultnormal_vertex>
    #include<worldpos_vertex>
    #include<shadowmap_vertex>
    // SHADOW
    
    // wind effect
    vec2 uWindDirection=vec2(1.,1.);
    float uWindAmp=.1;
    float uWindFreq=50.;
    float uSpeed=1.;
    float uNoiseFactor=5.50;
    float uNoiseSpeed=.001;
    
    vec2 windDirection=normalize(uWindDirection);// Normalize the wind direction
    vec4 modelPosition=modelMatrix*instanceMatrix*vec4(position,1.);
    
    float terrainSize=100.;
    vGlobalUV=(terrainSize-vec2(modelPosition.xz))/terrainSize;
    
    vec4 noise=texture2D(uNoiseTexture,vGlobalUV+uTime*uNoiseSpeed);
    
    float sinWave=sin(uWindFreq*dot(windDirection,vGlobalUV)+noise.g*uNoiseFactor+uTime*uSpeed)*uWindAmp*(1.-uv.y);
    
    float xDisp=sinWave;
    float zDisp=sinWave;
    modelPosition.x+=xDisp;
    modelPosition.z+=zDisp;
    
    // use perlinNoise to vary the terrainHeight of the grass
    modelPosition.y+=exp(texture2D(uNoiseTexture,vGlobalUV*uNoiseScale).r)*.5*(1.-uv.y);
    
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    // assign varyings
    vUv=vec2(uv.x,1.-uv.y);
    vNormal=normalize(normalMatrix*normal);
    vWindColor=vec2(xDisp,zDisp);
    vViewPosition=mvPosition.xyz;
}