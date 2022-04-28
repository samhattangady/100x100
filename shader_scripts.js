const vertex_shader_source = `#version 300 es
    precision mediump float;
    in vec2 position;
    in vec2 tex_coord;
    out vec2 vert_tex_coord;

    void main()
    {
        // float x = position.x / canvas_width;
        // float y = position.y / canvas_height;
        gl_Position = vec4(position.xy, 0.5,  1.0);
        vert_tex_coord = tex_coord;
    }
`;
const fragment_shader_source = `#version 300 es
    precision mediump float;
    in vec2 vert_tex_coord;
    out vec4 frag_color;
    uniform sampler2D tex;

    void main()
    {
        vec4 alpha = texture(tex, vert_tex_coord);
        frag_color = vec4(alpha);
    } 
`;
const flow_fragment_shader_source = `#version 300 es
    precision mediump float;
    precision mediump sampler3D;
    in vec2 vert_tex_coord;
    out vec4 frag_color;
    uniform sampler2D tex;
    uniform sampler3D tex2;
    uniform float time;

    // // https://iquilezles.org/articles/gradientnoise/
    // vec3 hash( vec3 p ) // replace this by something better. really. do
    // {
    //     p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
    //               dot(p,vec3(269.5,183.3,246.1)),
    //               dot(p,vec3(113.5,271.9,124.6)));

    //     return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    // }
    // float noise( in vec3 x )
    // {
    //     // grid
    //     vec3 p = floor(x);
    //     vec3 w = fract(x);
    //     // quintic interpolant
    //     vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    //     // gradients
    //     vec3 ga = hash( p+vec3(0.0,0.0,0.0) );
    //     vec3 gb = hash( p+vec3(1.0,0.0,0.0) );
    //     vec3 gc = hash( p+vec3(0.0,1.0,0.0) );
    //     vec3 gd = hash( p+vec3(1.0,1.0,0.0) );
    //     vec3 ge = hash( p+vec3(0.0,0.0,1.0) );
    //     vec3 gf = hash( p+vec3(1.0,0.0,1.0) );
    //     vec3 gg = hash( p+vec3(0.0,1.0,1.0) );
    //     vec3 gh = hash( p+vec3(1.0,1.0,1.0) );
    //     // projections
    //     float va = dot( ga, w-vec3(0.0,0.0,0.0) );
    //     float vb = dot( gb, w-vec3(1.0,0.0,0.0) );
    //     float vc = dot( gc, w-vec3(0.0,1.0,0.0) );
    //     float vd = dot( gd, w-vec3(1.0,1.0,0.0) );
    //     float ve = dot( ge, w-vec3(0.0,0.0,1.0) );
    //     float vf = dot( gf, w-vec3(1.0,0.0,1.0) );
    //     float vg = dot( gg, w-vec3(0.0,1.0,1.0) );
    //     float vh = dot( gh, w-vec3(1.0,1.0,1.0) );
    //     // interpolation
    //     return va +
    //            u.x*(vb-va) +
    //            u.y*(vc-va) +
    //            u.z*(ve-va) +
    //            u.x*u.y*(va-vb-vc+vd) +
    //            u.y*u.z*(va-vc-ve+vg) +
    //            u.z*u.x*(va-vb-ve+vf) +
    //            u.x*u.y*u.z*(-va+vb+vc-vd+ve-vf-vg+vh);
    // }

    void main()
    {
        frag_color = vec4(1.0);
        if (time == 0.0) {
            frag_color = vec4(vert_tex_coord, 1.0, 1.0);
        } else if (time < 0.0 ) {
            frag_color = texture(tex2, vec3(vert_tex_coord, -time));
        } else {
            float xnoise = 0.0; //  * noise(vec3(vert_tex_coord, time));
            float ynoise = 0.0; //  * noise(vec3(vert_tex_coord.yx, time));
            vec4 col = texture(tex, vert_tex_coord + vec2(xnoise, ynoise));
            frag_color = col;
        }
    } 
`;
