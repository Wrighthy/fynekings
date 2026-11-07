# Third-party models and libraries

Commercial use. Checked 7 November 2026. Depth Anything V2 Base, Large, and Giant are not used.

| Name | Version / commit | License | URL |
| --- | --- | --- | --- |
| `@mediapipe/tasks-vision` | 1.0.1 | Apache-2.0 | https://www.npmjs.com/package/@mediapipe/tasks-vision |
| MediaPipe Holistic Landmarker | `float16/1` task file | Apache-2.0 | https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/1/holistic_landmarker.task |
| MediaPipe Image Segmenter, selfie multiclass | `selfie_multiclass_256x256` `float32/1` | Apache-2.0 | https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/1/selfie_multiclass_256x256.tflite |
| `onnx-community/depth-anything-v2-small` | commit `4472b7362082ad9968fee890ca0f1e5aca36b93d` | Apache-2.0 | https://huggingface.co/onnx-community/depth-anything-v2-small |
| Depth Anything V2 Small (upstream weights) | commit `03876f8651c73a60fe4c2c48294e09fcb6838fcf` | Apache-2.0 | https://huggingface.co/depth-anything/Depth-Anything-V2-Small |
| `@huggingface/transformers` | 3.8.1 | Apache-2.0 | https://github.com/huggingface/transformers.js |

MediaPipe task models are published by Google under Apache-2.0. The ONNX depth card (`license:apache-2.0` on the Hugging Face model record) matches the upstream Small checkpoint. Base, Large, and Giant variants are excluded.

The wasm runtime and task files are loaded from pinned URLs rather than copied into this repo. Pin them locally before a production release if the files should not be fetched at runtime.

Holistic face landmarks cannot be switched off in tasks-vision 1.0.1. Face blendshapes and pose segmentation masks are disabled.
