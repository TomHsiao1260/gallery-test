uniform sampler2D uTexture;
uniform vec2 uPoint;
varying vec2 vUv;

void main()
{
	// vec4 color  = texture2D(uTexture, vUv);

 //    color.a = step(uPoint.x - uPoint.y, vUv.x - vUv.y);

 //    gl_FragColor = color;
    // gl_FragColor.rgb -= vec3(distance(uPoint, vUv) * 0.3);

    gl_FragColor = vec4(vec3(vUv, 1.0), 1.0);
}