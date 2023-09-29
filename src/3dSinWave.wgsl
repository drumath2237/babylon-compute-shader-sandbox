struct Params {
  positions: array<f32>
}

@group(0) @binding(0) var<storage,read_write> positionBuffer : Params;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var particleId = global_id.x * u32(500) + global_id.y;
    var x = positionBuffer.positions[particleId * u32(3)];
    var z = positionBuffer.positions[particleId * u32(3) + u32(2)];
    var distance = sqrt(x * x + z * z);

    positionBuffer.positions[particleId * u32(3) + u32(1)] = sin(distance);
}
