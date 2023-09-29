import "./style.css";
import {
  CloudPoint,
  ComputeShader,
  PointsCloudSystem,
  Scene,
  StorageBuffer,
  Vector3,
  WebGPUEngine,
} from "@babylonjs/core";
import sinWaveComputeShader from "./3dSinWave.wgsl?raw";
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

  const sinWave = new ComputeShader(
    "3d sin wave",
    engine,
    { computeSource: sinWaveComputeShader },
    {
      bindingsMapping: {
        positionBuffer: { group: 0, binding: 0 },
      },
    }
  );

  const PARTICLE_ONE_SIDE = 500;
  const PARTICLE_COUNT = PARTICLE_ONE_SIDE * PARTICLE_ONE_SIDE;

  const positionBuffer = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positionBuffer[i * 3] = randomNumberBetween(-10, 10);
    positionBuffer[i * 3 + 1] = 0;
    positionBuffer[i * 3 + 2] = randomNumberBetween(-10, 10);
  }
  const positionStorage = new StorageBuffer(engine, positionBuffer.byteLength);
  positionStorage.update(positionBuffer);

  sinWave.setStorageBuffer("positionBuffer", positionStorage);

  await sinWave.dispatchWhenReady(PARTICLE_ONE_SIDE, PARTICLE_ONE_SIDE);
  const positions = await positionStorage.read();
  positionBuffer.set(new Float32Array(positions.buffer));

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
      positionBuffer[p.idx * 3] / 10.0,
      positionBuffer[p.idx * 3 + 1] / 10.0,
      positionBuffer[p.idx * 3 + 2] / 10.0
    );
    return p;
  };

  setInterval(() => {
    pointCloud.setParticles();
  }, 1000 / 30);
};

main();

