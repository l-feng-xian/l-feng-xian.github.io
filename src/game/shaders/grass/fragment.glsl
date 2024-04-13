uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uTipColor1;
uniform vec3 uTipColor2;
uniform sampler2D uGrassAlphaTexture;
uniform sampler2D uNoiseTexture;
uniform float uNoiseScale;
uniform int uEnableShadows;

uniform float uGrassLightIntensity;
uniform float uShadowDarkness;
uniform float uDayTime;
varying vec3 vColor;

varying vec2 vUv;
varying vec2 vGlobalUV;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vWindColor;

void main(){
    vec4 grassAlpha=texture2D(uGrassAlphaTexture,vUv);
    
    vec4 grassVariation=texture2D(uNoiseTexture,vGlobalUV*uNoiseScale);
    vec3 tipColor=mix(uTipColor1,uTipColor2,grassVariation.r);
    
    vec4 diffuseColor=vec4(mix(uBaseColor,tipColor,vUv.y),step(.1,grassAlpha.r));
    vec3 grassFinalColor=diffuseColor.rgb*uGrassLightIntensity;
    
    // light calculation derived from <lights_fragment_begin>
    vec3 geometryPosition=vViewPosition;
    vec3 geometryNormal=vNormal;
    vec3 geometryViewDir=(isOrthographic)?vec3(0,0,1):normalize(vViewPosition);
    vec3 geometryClearcoatNormal;
    IncidentLight directLight;
    float shadow=0.;
    float currentShadow=0.;
    float NdotL;
    if(uEnableShadows==1){
        #if(NUM_DIR_LIGHTS>0)
        DirectionalLight directionalLight;
        #if defined(USE_SHADOWMAP)&&NUM_DIR_LIGHT_SHADOWS>0
        DirectionalLightShadow directionalLightShadow;
        #endif
        #pragma unroll_loop_start
        for(int i=0;i<NUM_DIR_LIGHTS;i++){
            directionalLight=directionalLights[i];
            getDirectionalLightInfo(directionalLight,directLight);
            directionalLightShadow=directionalLightShadows[i];
            currentShadow=getShadow(directionalShadowMap[i],
                directionalLightShadow.shadowMapSize,
                directionalLightShadow.shadowBias,
                directionalLightShadow.shadowRadius,
            vDirectionalShadowCoord[i]);
            currentShadow=all(bvec2(directLight.visible,receiveShadow))?currentShadow:1.;
            float weight=clamp(pow(length(vDirectionalShadowCoord[i].xy*2.-1.),4.),.0,1.);
            
            shadow+=mix(currentShadow,1.,weight);
        }
        #pragma unroll_loop_end
        #endif
        grassFinalColor=mix(grassFinalColor,grassFinalColor*uShadowDarkness,1.-shadow);
    }else{
        grassFinalColor=grassFinalColor;
    }
    diffuseColor.rgb=clamp(diffuseColor.rgb*shadow,0.,1.);
    
    #include<alphatest_fragment>
    gl_FragColor=vec4(grassFinalColor,1.);
    
}