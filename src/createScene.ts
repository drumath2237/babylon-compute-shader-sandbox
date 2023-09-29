import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  PointsCloudSystem,
  MeshBuilder,
  CloudPoint,
  ComputeShader,
  StorageBuffer,
} from "@babylonjs/core";
import { randomNumberBetween } from "./utils";

import sinWaveComputeShader from "./3dSinWave.wgsl?raw";

class Playground {
  public static async CreateSceneAsync(
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> {
    const scene = new Scene(engine);
    const camera = new FreeCamera("camera1", new Vector3(0, 1, -2), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(true);
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    //=============================================================

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

    const PARTICLE_COUNT = 100 * 100;

    const positionBuffer = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positionBuffer[i * 3] = randomNumberBetween(-1, 1);
      positionBuffer[i * 3 + 1] = 0;
      positionBuffer[i * 3 + 2] = randomNumberBetween(-1, 1);
    }
    const positionStorage = new StorageBuffer(
      engine,
      positionBuffer.byteLength
    );
    positionStorage.update(positionBuffer);

    sinWave.setStorageBuffer("positionBuffer", positionStorage);

    await sinWave.dispatchWhenReady(100, 100);
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

    return scene;
  }
}

export { Playground };

