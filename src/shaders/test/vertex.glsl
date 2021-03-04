uniform float uTime;
uniform sampler2D uTexture_;

varying vec2 vUv;

void main()
{
    vec3 newPosition = position;
    // float a = texture2D(uTexture_, uv).x;
    // newPosition.z += a * 0.1;
    // newPosition.z += sin(newPosition.x * 10.0 - uTime) * 0.01;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);  
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
}