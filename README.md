# image-tool

## 项目介绍

因为沉迷使用 gemini 生成表情包，一下子找不到有什么网站可以一键切割表情包，于是就有了这个项目。可以到 [在线地址](https://image.huangsn.dev/) 使用（用的 cloudflare 的 pages 部署，可能需要魔法）

## 功能点

- 单文件纯前端，图片处理全在本地完成。
- 图片裁剪分片：比例预设（16:9/4:3/1:1/自由）、网格自定义、滚轮缩放/双击放大/镜像翻转、导出高清 PNG 分片并 ZIP 打包。
- 图片等比例缩放：批量拖拽/粘贴，最长边缩放保持比例，自动重命名（如 `foo_240x160.png`），逐张下载或复制到剪贴板，内置 ZIP 打包。
- 序列帧 GIF 生成器：读取图 / 网格切片 / 一键输出 GIF 动画。
- Gemini 去水印：基于 LaMa 模型的本地推理，支持手动加载模型文件。

## Gemini 去水印使用说明

1. 下载 `lama_fp32.onnx`（约 200MB），保存到本地任意位置。
   - 模型下载地址（来自 Gemini-Watermark-Remover）：https://drive.google.com/file/d/16cRZWEQyJFecg77ebUBXjFxAik0iFU_C/view?usp=sharing
2. 启动项目后进入「Gemini 去水印」页面，在「模型加载」中选择该文件并点击「预加载模型」。
3. 上传图片并执行去水印。
