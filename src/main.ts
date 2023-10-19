import "./style.css";
import {
  CloudPoint,
  ComputeShader,
  PointsCloudSystem,
  Scene,
  StorageBuffer,
  UniformBuffer,
  Vector3,
  WebGPUEngine,
} from "@babylonjs/core";
import computeShaderSource from "./3dSinWave.wgsl?raw";
import { randomNumberBetween } from "./utils";

const main = async () => {
  const renderCanvas = document.getElementById(
    "renderCanvas"
  ) as HTMLCanvasElement;
  if (!renderCanvas) {
    return;
  }

  const engine = new WebGPUEngine(renderCanvas, {
    antialias: true,
  });
  await engine.initAsync();

  const scene = new Scene(engine);
  scene.createDefaultCameraOrLight(true, true, true);

  window.addEventListener("resize", () => {
    engine.resize();
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  //========================================================

  let time = 5;

  const sinWaveComputeShader = new ComputeShader(
    "3d sin wave",
    engine,
    { computeSource: computeShaderSource },
    {
      bindingsMapping: {
        params: { group: 0, binding: 0 },
        positionBuffer: { group: 0, binding: 1 },
      },
    }
  );

  const waveParamsUniformBuffer = new UniformBuffer(
    engine,
    undefined,
    undefined,
    "params"
  );
  waveParamsUniformBuffer.addUniform("time", 1);
  waveParamsUniformBuffer.updateFloat("time", time);

  sinWaveComputeShader.setUniformBuffer("params", waveParamsUniformBuffer);

  const PARTICLE_ONE_SIDE = 300;
  const PARTICLE_COUNT = PARTICLE_ONE_SIDE * PARTICLE_ONE_SIDE;

  const positionBuffer = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positionBuffer[i * 3] = randomNumberBetween(-10, 10);
    positionBuffer[i * 3 + 1] = 0;
    positionBuffer[i * 3 + 2] = randomNumberBetween(-10, 10);
  }
  const positionStorage = new StorageBuffer(engine, positionBuffer.byteLength);
  positionStorage.update(positionBuffer);

  sinWaveComputeShader.setStorageBuffer("positionBuffer", positionStorage);

  const pointCloud = new PointsCloudSystem("pointCloud", 3, scene, {
    updatable: true,
  });
  pointCloud.addPoints(PARTICLE_COUNT, (p: CloudPoint, i: number) => {
    p.position = new Vector3(
      positionBuffer[i * 3],
      positionBuffer[i * 3 + 1],
      positionBuffer[i * 3 + 2]
    );
  });
  await pointCloud.buildMeshAsync();

  pointCloud.updateParticle = (p: CloudPoint) => {
    p.position = new Vector3(
      positionBuffer[p.idx * 3] / 20.0,
      positionBuffer[p.idx * 3 + 1] / 20.0,
      positionBuffer[p.idx * 3 + 2] / 20.0
    );
    return p;
  };

  scene.registerBeforeRender(async () => {
    time += 0.1;
    waveParamsUniformBuffer.updateFloat("time", time);
    waveParamsUniformBuffer.update();

    await sinWaveComputeShader.dispatchWhenReady(
      PARTICLE_ONE_SIDE,
      PARTICLE_ONE_SIDE
    );
    const res = await positionStorage.read();
    positionBuffer.set(new Float32Array(res.buffer));

    pointCloud.setParticles();
  });
};

main();
