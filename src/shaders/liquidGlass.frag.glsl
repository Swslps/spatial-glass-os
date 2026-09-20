precision highp float;
uniform sampler2D uBackground;
uniform vec2 uResolution;
uniform float uIor,uDispersion,uRoughness,uTime,uAmplitude,uFrequency,uDecay;
uniform vec3 uRipples[8];
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
vec3 frosted(vec2 p){vec3 sum=vec3(0.0);float radius=uRoughness*.027;for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){sum+=texture2D(uBackground,clamp(p+vec2(float(x),float(y))*radius,0.001,0.999)).rgb;}}return sum/9.0;}
void main(){
 vec2 uv=gl_FragCoord.xy/uResolution;vec2 gradient=vec2(0.0);
 for(int i=0;i<8;i++){float t=uTime-uRipples[i].z;vec2 delta=uv-uRipples[i].xy;float r=length(delta);if(t>0.0&&t<8.0&&r<t*.45){
 float phase=uFrequency*r-t*12.0;float envelope=uAmplitude*exp(-uDecay*t)*exp(-3.0*r);
 float dh=envelope*(-3.0*cos(phase)-uFrequency*sin(phase));gradient+=dh*delta/max(r,.001);
 }}
 vec3 n=normalize(vNormal+vec3(-gradient,0.0));vec3 viewDir=normalize(vWorld-cameraPosition);
 vec3 r=refract(viewDir,n,1.0/max(1.001,uIor-uDispersion));vec3 g=refract(viewDir,n,1.0/uIor);vec3 b=refract(viewDir,n,1.0/(uIor+uDispersion));
 vec3 col=vec3(frosted(uv+r.xy*.19).r,frosted(uv+g.xy*.19).g,frosted(uv+b.xy*.19).b);
 float f0=pow((1.0-uIor)/(1.0+uIor),2.0);float fresnel=f0+(1.0-f0)*pow(1.0-max(dot(-viewDir,n),0.0),5.0);
 float spec=pow(max(dot(reflect(viewDir,n),normalize(vec3(-2.0,3.0,4.0))),0.0),80.0);
 vec3 reflectedLight=mix(vec3(.22,.29,.25),vec3(.97,1.0,.98),smoothstep(-.6,.8,n.y));
 col=mix(col,reflectedLight,fresnel*.8)+spec*.75;
 col*=1.0-uRoughness*.18;gl_FragColor=vec4(col,1.0);
}
