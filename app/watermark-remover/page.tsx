"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MODEL_INPUT_SIZE = 512;
const ORT_WASM_PATH = "/onnx/";
const MODEL_DOWNLOAD_URL =
  "https://drive.google.com/file/d/16cRZWEQyJFecg77ebUBXjFxAik0iFU_C/view?usp=sharing";

const WATERMARK_DEFAULTS = {
  widthRatio: 0.15,
  heightRatio: 0.15,
  extendedRatio: 0.16,
};

const PROGRESS_STEPS = [
  { label: "模型", threshold: 50 },
  { label: "读取", threshold: 65 },
  { label: "预处理", threshold: 80 },
  { label: "推理", threshold: 92 },
  { label: "合成", threshold: 100 },
];

type OrtSession = {
  run: (feeds: Record<string, unknown>) => Promise<Record<string, any>>;
};

type ModelState = {
  session: OrtSession | null;
  buffer: Uint8Array | null;
  source: string | null;
};

const calculateWatermarkRegion = (
  width: number,
  height: number,
  widthRatio: number,
  heightRatio: number,
  ratioOverride?: number,
) => {
  const wRatio = ratioOverride ?? widthRatio;
  const hRatio = ratioOverride ?? heightRatio;
  const regionWidth = Math.floor(width * wRatio);
  const regionHeight = Math.floor(height * hRatio);
  const x = width - regionWidth;
  const y = height - regionHeight;
  return { x, y, width: regionWidth, height: regionHeight };
};

const resizeImageForModel = (bitmap: ImageBitmap) => {
  const canvas = document.createElement("canvas");
  canvas.width = MODEL_INPUT_SIZE;
  canvas.height = MODEL_INPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法创建 Canvas 上下文");
  }
  ctx.drawImage(bitmap, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  return ctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
};

const preprocessImage = (
  ort: any,
  imageData: ImageData,
  widthRatio: number,
  heightRatio: number,
) => {
  const { width, height, data } = imageData;
  const float32Data = new Float32Array(3 * width * height);

  for (let i = 0; i < width * height; i += 1) {
    float32Data[i] = data[i * 4] / 255.0;
    float32Data[width * height + i] = data[i * 4 + 1] / 255.0;
    float32Data[2 * width * height + i] = data[i * 4 + 2] / 255.0;
  }

  const imageTensor = new ort.Tensor("float32", float32Data, [
    1,
    3,
    height,
    width,
  ]);

  const maskData = new Float32Array(width * height);
  const region = calculateWatermarkRegion(width, height, widthRatio, heightRatio);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      maskData[idx] = y >= region.y && x >= region.x ? 1.0 : 0.0;
    }
  }

  const maskTensor = new ort.Tensor("float32", maskData, [1, 1, height, width]);

  return { imageTensor, maskTensor };
};

const postprocessImage = (outputTensor: any, width: number, height: number) => {
  const data = outputTensor.data as Float32Array | Float64Array;
  const rgbaData = new Uint8ClampedArray(width * height * 4);

  let maxVal = 0;
  const sampleSize = Math.min(1000, data.length / 3);
  for (let i = 0; i < sampleSize; i += 1) {
    maxVal = Math.max(maxVal, Math.abs(data[i]));
  }
  const isNormalized = maxVal <= 2.0;

  for (let i = 0; i < width * height; i += 1) {
    let r = data[i];
    let g = data[width * height + i];
    let b = data[2 * width * height + i];

    if (isNormalized) {
      r *= 255;
      g *= 255;
      b *= 255;
    }

    rgbaData[i * 4] = Math.min(255, Math.max(0, Math.round(r)));
    rgbaData[i * 4 + 1] = Math.min(255, Math.max(0, Math.round(g)));
    rgbaData[i * 4 + 2] = Math.min(255, Math.max(0, Math.round(b)));
    rgbaData[i * 4 + 3] = 255;
  }

  return new ImageData(rgbaData, width, height);
};

const composeFinalImage = (
  bitmap: ImageBitmap,
  processedImageData: ImageData,
  widthRatio: number,
  heightRatio: number,
  extendedRatio: number,
) => {
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = bitmap.width;
  finalCanvas.height = bitmap.height;
  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) {
    throw new Error("无法创建 Canvas 上下文");
  }
  finalCtx.drawImage(bitmap, 0, 0);

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = MODEL_INPUT_SIZE;
  tempCanvas.height = MODEL_INPUT_SIZE;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) {
    throw new Error("无法创建 Canvas 上下文");
  }
  tempCtx.putImageData(processedImageData, 0, 0);

  const origRegion = calculateWatermarkRegion(
    bitmap.width,
    bitmap.height,
    widthRatio,
    heightRatio,
    extendedRatio,
  );
  const processedRegion = calculateWatermarkRegion(
    MODEL_INPUT_SIZE,
    MODEL_INPUT_SIZE,
    widthRatio,
    heightRatio,
    extendedRatio,
  );

  finalCtx.drawImage(
    tempCanvas,
    processedRegion.x,
    processedRegion.y,
    processedRegion.width,
    processedRegion.height,
    origRegion.x,
    origRegion.y,
    origRegion.width,
    origRegion.height,
  );

  return finalCanvas.toDataURL("image/png", 1.0);
};

export default function WatermarkRemoverPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<ModelState>({
    session: null,
    buffer: null,
    source: null,
  });
  const modelFileRef = useRef<File | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [ortReady, setOrtReady] = useState(false);
  const [modelStatus, setModelStatus] = useState("未选择模型文件");
  const [modelLoading, setModelLoading] = useState(false);
  const [modelFileName, setModelFileName] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("等待图片");
  const [busy, setBusy] = useState(false);

  const [widthRatio, setWidthRatio] = useState(
    WATERMARK_DEFAULTS.widthRatio,
  );
  const [heightRatio, setHeightRatio] = useState(
    WATERMARK_DEFAULTS.heightRatio,
  );
  const [extendedRatio, setExtendedRatio] = useState(
    WATERMARK_DEFAULTS.extendedRatio,
  );

  const hasModelFile = Boolean(modelFileName);
  const progressPercent = Math.min(100, Math.max(0, progress));
  const activeStepIndex =
    progressPercent === 0
      ? -1
      : PROGRESS_STEPS.findIndex((step) => progressPercent <= step.threshold);
  const resolvedActiveIndex =
    activeStepIndex === -1 ? PROGRESS_STEPS.length - 1 : activeStepIndex;

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ort) {
      setOrtReady(true);
    }
  }, []);

  const ensureOrt = () => {
    const ort = (window as any).ort;
    if (!ort) {
      throw new Error("ONNX Runtime 未加载");
    }
    ort.env.wasm.wasmPaths = ORT_WASM_PATH;
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    return ort;
  };

  const getModelSource = () => {
    if (modelFileRef.current) {
      return `file:${modelFileRef.current.name}:${modelFileRef.current.size}`;
    }
    return null;
  };

  const loadModel = async () => {
    if (modelLoading) return;
    const ort = ensureOrt();
    const source = getModelSource();
    if (!source) {
      setModelStatus("未选择模型文件");
      setStatus("请先下载并选择模型文件");
      return;
    }
    if (modelRef.current.session && modelRef.current.source === source) {
      setModelStatus("已就绪");
      return;
    }

    setModelLoading(true);
    setModelStatus("加载中");
    setProgress(10);
    setStatus("加载模型中...");

    try {
      let buffer = modelRef.current.buffer;
      if (!buffer || modelRef.current.source !== source) {
        if (!modelFileRef.current) {
          throw new Error("未选择模型文件");
        }
        setStatus("读取模型文件...");
        const arrayBuffer = await modelFileRef.current.arrayBuffer();
        buffer = new Uint8Array(arrayBuffer);
        setProgress(40);
      }

      if (!buffer) {
        throw new Error("模型加载失败");
      }

      const session = await ort.InferenceSession.create(buffer, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "basic",
      });

      modelRef.current = {
        session,
        buffer,
        source,
      };

      setModelStatus("已就绪");
      setProgress(50);
      setStatus("模型已就绪");
    } catch (error) {
      console.error(error);
      setModelStatus("加载失败");
      setStatus(
        error instanceof Error ? `模型加载失败：${error.message}` : "模型加载失败",
      );
      setProgress(0);
    } finally {
      setModelLoading(false);
    }
  };

  const resetModel = () => {
    modelRef.current = { session: null, buffer: null, source: null };
    setModelStatus("未选择模型文件");
  };

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus("仅支持图片文件");
      return;
    }
    setImageFile(file);
    setResultUrl(null);
    setStatus(`已选择图片：${file.name}`);
    setProgress(0);
  }, []);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          handleImageFile(file);
          return;
        }
      }
    }
  }, [handleImageFile]);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  const processImage = async () => {
    if (!imageFile) {
      setStatus("请先选择图片");
      return;
    }
    if (!modelFileRef.current) {
      setStatus("请先下载并选择模型文件");
      return;
    }
    if (modelLoading) {
      setStatus("模型加载中，请稍候");
      return;
    }
    if (busy) return;
    setBusy(true);
    setResultUrl(null);
    setProgress(5);
    setStatus("读取图片...");

    try {
      const ort = ensureOrt();
      const session =
        modelRef.current.session && modelRef.current.source === getModelSource()
          ? modelRef.current.session
          : null;
      if (!session) {
        await loadModel();
      }
      if (!modelRef.current.session) {
        throw new Error("模型未就绪");
      }

      setProgress((current) => Math.max(current, 55));
      setStatus("加载图片数据...");
      const bitmap = await createImageBitmap(imageFile);
      setProgress((current) => Math.max(current, 65));
      setStatus("准备 AI 输入...");
      const resized = resizeImageForModel(bitmap);
      const { imageTensor, maskTensor } = preprocessImage(
        ort,
        resized,
        widthRatio,
        heightRatio,
      );

      setProgress((current) => Math.max(current, 80));
      setStatus("AI 去水印中...");
      const output = await modelRef.current.session.run({
        image: imageTensor,
        mask: maskTensor,
      });
      const outputName = Object.keys(output)[0];
      const processed = postprocessImage(
        output[outputName],
        MODEL_INPUT_SIZE,
        MODEL_INPUT_SIZE,
      );

      setProgress((current) => Math.max(current, 92));
      setStatus("合成高清结果...");
      const finalDataUrl = composeFinalImage(
        bitmap,
        processed,
        widthRatio,
        heightRatio,
        extendedRatio,
      );

      setResultUrl(finalDataUrl);
      setProgress(100);
      setStatus("处理完成");
      bitmap.close();
    } catch (error) {
      console.error(error);
      setStatus(
        error instanceof Error ? `处理失败：${error.message}` : "处理失败",
      );
      setProgress(0);
    } finally {
      setBusy(false);
    }
  };

  const clearAll = () => {
    setImageFile(null);
    setResultUrl(null);
    setPreviewUrl(null);
    setProgress(0);
    setStatus("已清空");
  };

  return (
    <main className="space-y-6 animate-in fade-in-50">
      <Script
        src={`${ORT_WASM_PATH}ort.min.js`}
        strategy="afterInteractive"
        onLoad={() => setOrtReady(true)}
      />

      <Card className="border-dashed border-muted bg-background/80">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">Gemini 去水印</CardTitle>
              <CardDescription>
                使用 LaMa 模型在本地移除 Gemini 水印，不上传图片。
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-[11px]">
              AI Inpaint
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          使用前请先手动下载模型文件（lama_fp32.onnx），然后在下方选择加载。
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>模型加载</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-xs text-muted-foreground">
                模型仅在浏览器内存中缓存，刷新页面需要重新加载。
              </p>
              <div className="space-y-2">
                <Label htmlFor="modelFile">选择模型文件（.onnx）</Label>
                <Input
                  ref={modelInputRef}
                  id="modelFile"
                  type="file"
                  accept=".onnx"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    modelFileRef.current = file;
                    setModelFileName(file?.name ?? null);
                    resetModel();
                    setModelStatus(file ? "待加载" : "未选择模型文件");
                  }}
                />
                {modelFileName && (
                  <p className="text-xs text-muted-foreground">
                    已选择：{modelFileName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={loadModel}
                  disabled={!ortReady || modelLoading || !hasModelFile}
                >
                  {modelLoading ? "加载中…" : "预加载模型"}
                </Button>
                <Button asChild variant="secondary">
                  <a href={MODEL_DOWNLOAD_URL} target="_blank" rel="noreferrer">
                    下载模型
                  </a>
                </Button>
                <Badge variant={modelStatus === "已就绪" ? "default" : "secondary"}>
                  {ortReady ? modelStatus : "运行时未就绪"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>水印区域配置</CardTitle>
              <CardDescription>
                仅处理右下角区域，默认 15%×15%。若水印偏大可适当提高。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 text-sm">
                <Label htmlFor="widthRatio">宽度比例</Label>
                <Input
                  id="widthRatio"
                  type="number"
                  min={0.05}
                  max={0.4}
                  step={0.01}
                  value={widthRatio}
                  onChange={(event) =>
                    setWidthRatio(Number(event.target.value) || 0.15)
                  }
                />
              </div>
              <div className="space-y-2 text-sm">
                <Label htmlFor="heightRatio">高度比例</Label>
                <Input
                  id="heightRatio"
                  type="number"
                  min={0.05}
                  max={0.4}
                  step={0.01}
                  value={heightRatio}
                  onChange={(event) =>
                    setHeightRatio(Number(event.target.value) || 0.15)
                  }
                />
              </div>
              <div className="space-y-2 text-sm">
                <Label htmlFor="extendedRatio">扩展比例</Label>
                <Input
                  id="extendedRatio"
                  type="number"
                  min={0.05}
                  max={0.4}
                  step={0.01}
                  value={extendedRatio}
                  onChange={(event) =>
                    setExtendedRatio(Number(event.target.value) || 0.16)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>图片输入</CardTitle>
              <CardDescription>
                拖拽 / 点击 / 粘贴 图片，完成后再执行去水印。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground transition",
                  dragActive && "border-primary bg-primary/10 text-foreground",
                )}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
              >
                <p>拖拽图片到这里，或点击下方按钮选择。</p>
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  选择图片
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                />
                {imageFile && (
                  <p className="text-xs text-muted-foreground">
                    当前图片：{imageFile.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>处理进度</CardTitle>
              <CardDescription>
                模型加载后即可开始，处理时间取决于图片大小与浏览器性能。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>进度</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">状态：{status}</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {PROGRESS_STEPS.map((step, index) => {
                    const done = progressPercent >= step.threshold;
                    const active = index === resolvedActiveIndex;
                    return (
                      <span
                        key={step.label}
                        className={cn(
                          "rounded-full border px-2 py-0.5",
                          done && "border-primary bg-primary text-primary-foreground",
                          !done &&
                            active &&
                            "border-primary text-primary",
                          !done &&
                            !active &&
                            "border-border/60 text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={processImage}
                  disabled={
                    !imageFile ||
                    busy ||
                    modelLoading ||
                    !ortReady ||
                    !hasModelFile
                  }
                >
                  {busy ? "处理中…" : "开始去水印"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={clearAll}
                  disabled={busy}
                >
                  清空
                </Button>
                {resultUrl && (
                  <Button asChild variant="secondary">
                    <a href={resultUrl} download="gemini-clean.png">
                      下载结果
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>效果对比</CardTitle>
              <CardDescription>
                左右对比去水印前后差异。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewUrl ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      原图
                    </p>
                    <div className="overflow-hidden rounded-xl border">
                      <img
                        src={previewUrl}
                        alt="original"
                        className="block h-auto w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      去水印
                    </p>
                    <div className="overflow-hidden rounded-xl border">
                      {resultUrl ? (
                        <img
                          src={resultUrl}
                          alt="cleaned"
                          className="block h-auto w-full"
                        />
                      ) : (
                        <div className="flex min-h-[160px] items-center justify-center text-sm text-muted-foreground">
                          暂无结果，请先执行去水印。
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  还没有图片，请先上传并执行去水印。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
