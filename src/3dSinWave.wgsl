struct Params {
  time: f32
}

@group(0) @binding(0) var<uniform> params : Params;
@group(0) @binding(1) var<storage,read_write> positionBuffer : array<f32>;

@compute @workgroup_size(2,1,1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var particleId = global_id.x * u32(300) + global_id.y;
    var x = positionBuffer[particleId * u32(3)];
    var z = positionBuffer[particleId * u32(3) + u32(2)];
    var distance = sqrt(x * x + z * z);

    positionBuffer[particleId * u32(3) + u32(1)] = sin(distance * 1.2 - params.time);
}
