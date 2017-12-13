var simple_fragment = `
precision mediump float; // set float to medium precision

uniform vec3 uEyePosition; // the eye's position in world
        
uniform vec3 uLightAmbient; // the light's ambient color
uniform vec3 uLightDiffuse; // the light's diffuse color
uniform vec3 uLightSpecular; // the light's specular color
uniform vec3 uLightPosition; // the light's position
        
uniform vec3 uAmbient; // the ambient reflectivity
uniform vec3 uDiffuse; // the diffuse reflectivity
uniform vec3 uSpecular; // the specular reflectivity
uniform float uShininess; // the specular exponent
            
varying vec3 vWorldPos; // world xyz of fragment
varying vec3 vVertexNormal; // normal of fragment

varying vec2 vUV;
uniform sampler2D uTexture;
        
void main(void) {
    // ambient term
    vec3 ambient = uAmbient * uLightAmbient; 
            
    // diffuse term
    vec3 normal = normalize(vVertexNormal); 
    vec3 light = normalize(uLightPosition - vWorldPos);
    //two side coloring
    float lambert = max(0.0, dot(normal,light));
    vec3 diffuse = uDiffuse * uLightDiffuse * lambert; // diffuse term
            
    // specular term
    vec3 eye = normalize(uEyePosition - vWorldPos);
    vec3 halfVec = normalize(light + eye);
    float highlight = pow(max(0.0, dot(normal, halfVec)),uShininess);
    vec3 specular = uSpecular * uLightSpecular * highlight; // specular term
            
    // combine to find lit color
    vec3 litColor = ambient + diffuse + specular; 
    
    vec4 materialColor = vec4(litColor, 1.0);

    vec4 textureColor = texture2D(uTexture, vec2(vUV.s, vUV.t));
    gl_FragColor = materialColor * textureColor;
} // end main
`;