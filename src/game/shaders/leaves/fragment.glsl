uniform vec3 u_Color;
uniform sampler2D u_Texture;

varying vec2 v_uvs;

void main(){
    vec4 texColor=texture2D(u_Texture,v_uvs);
    // gl_FragColor=vec4(u_Color*texColor.rgb,texColor.a);
    
    if(texColor.r<.05&&texColor.g<.05&&texColor.b<.05){
        gl_FragColor=vec4(texColor.rgb,0.);// 黑色部分透明
    }else if(texColor.r>.95&&texColor.g>.95&&texColor.b>.95){
        gl_FragColor=vec4(u_Color,texColor.a);// 白色部分替换颜色
    }else{
        gl_FragColor=vec4(texColor.rgb,texColor.a);// 其他颜色保持不变
    }
}