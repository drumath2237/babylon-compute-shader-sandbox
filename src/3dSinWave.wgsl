struct Params {
  time: f32
}

@group(0) @binding(0) var<uniform> params : Params;
@group(0) @binding(1) var<storage,read_write> positionBuffer : array<f32>;

@compute @workgroup_size(2,2,1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var particleId = global_id.x * 300u + global_id.y;
    var x = positionBuffer[particleId * 3u];
    var z = positionBuffer[particleId * 3u + 2u];
    var distance = sqrt(x * x + z * z);

    positionBuffer[particleId * 3u + 1u] = sin(distance * 1.2 - params.time);
}
