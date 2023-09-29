import { Playground } from "./createScene";
import "./style.css";
import { WebGPUEngine } from "@babylonjs/core";

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

  const scene = await Playground.CreateSceneAsync(engine, renderCanvas);

  window.addEventListener("resize", () => {
    engine.resize();
  });

  engine.runRenderLoop(() => {
    scene.render();
  });
};

main();

