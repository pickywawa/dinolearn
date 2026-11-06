precision highp float;
varying vec2 outTexCoord;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform float t;
uniform float night;

float ellipse(vec2 p,vec2 center,vec2 radius){
  return 1.-smoothstep(.65,1.,length((p-center)/radius));

}

void main(){
  vec2 uv=vec2(outTexCoord.x,1.-outTexCoord.y);
  vec2 p=uv;
  float a=2.;

  float left=ellipse(p,vec2(.025,.69),vec2(.12,.18));
  float right=ellipse(p,vec2(.96,.86),vec2(.13,.25));

  float lake=smoothstep(.68,.72,uv.y)*(1.-smoothstep(.81,.86,uv.y)*(1.-smoothstep(.40,.47,uv.x)))*(1.-right)*(1.-left);

  p.x+=a*lake*.0011*sin(uv.y*190.-t*1.6);
  p.y+=a*lake*.0009*sin(uv.x*90.+uv.y*130.-t*2.);

  float fall=ellipse(uv,vec2(.782,.568),vec2(.055,.103));
  p.y+=a*fall*.003*sin(uv.y*190.-t*6.);
  p.x+=a*fall*.0008*sin(uv.y*155.-t*4.);

  vec3 color=texture2D(iChannel0,p).rgb;
  float streak=pow(max(0.,sin(uv.x*950.+uv.y*50.-t*4.)),16.)*pow(max(0.,sin(uv.y*140.-t*7.)),4.);
  color+=a*fall*streak*.11;
  float foam=ellipse(uv,vec2(.774,.682),vec2(.075,.014));
  color+=a*foam*.025*sin(t*3.+uv.x*170.);

  // Clouds are composited only over the blue sky, behind warm terrain and foliage.
  vec3 base=texture2D(iChannel0,uv).rgb;

  float sky=smoothstep(.08,.22,base.b-base.r)*smoothstep(.10,.20,base.b-base.g)*(1.-smoothstep(.46,.51,uv.y));

  float cloudX=fract(uv.x-t/600.);
  vec4 cloud=texture2D(iChannel1,vec2(cloudX,uv.y));
  // Fade the source edges before wrapping to avoid sliced cloud silhouettes.
  cloud*=smoothstep(0.,.06,cloudX)*(1.-smoothstep(.94,1.,cloudX));

  // Phaser uploads textures with premultiplied alpha.
  color=color*(1.-cloud.a*sky)+cloud.rgb*sky;

  gl_FragColor=vec4(color*mix(vec3(1.),vec3(.357,.416,.659),night),1.);

}
