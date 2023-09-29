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
    _: HTMLCanvasElement
  ): Promise<Scene> {
    const scene = new Scene(engine);
    scene.createDefaultCameraOrLight(true, true, true);

    //=============================================================

    return scene;
  }
}

export { Playground };

