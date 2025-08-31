uniform vec3 uAtmosphereColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun orientation

    color += uAtmosphereColor;

    // Alpha
    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.42, edgeAlpha);

    // Final color
    gl_FragColor = vec4(color, edgeAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}