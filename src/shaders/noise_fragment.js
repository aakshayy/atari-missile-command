var noise_fragment = `
precision mediump float;

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
            

uniform vec2 uResolution;
uniform float uTime;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    
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

    //Generate simplex noise
    //https://thebookofshaders.com/11/
    vec2 st = gl_FragCoord.xy/uResolution.xy;
    st.x *= uResolution.x/uResolution.y;
    vec3 color = vec3(1.0, 0.0, 0.0);
    vec2 pos = vec2(st*3.);

    float DF = 0.0;

    // Add a random position
    float a = 0.0;
    vec2 vel = vec2(uTime*.1);
    DF += snoise(pos+vel)*.25+.25;

    // Add a random position
    a = snoise(pos*vec2(cos(uTime*0.15),sin(uTime*0.1))*0.1)*3.1415;
    vel = vec2(cos(a),sin(a));
    DF += snoise(pos+vel)*.25+.25;

    float noise = smoothstep(.7,.75,fract(DF));

    vec3 materialColor;
    if(noise < 0.6)
        materialColor = vec3(0.95, 0.5, 0.03);
    else
        materialColor = noise * vec3(1.0, 0.0, 0.0);
    materialColor = materialColor * litColor;
    gl_FragColor = vec4(materialColor.x, materialColor.y, materialColor.z, 1.0);
}
`