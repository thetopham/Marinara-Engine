# Manual ComfyUI Workflow Checkpoint

These files are editable ComfyUI UI workflows. They are troubleshooting masters,
not API connection payloads.

## Run order

1. Restart ComfyUI Desktop so updated custom nodes are registered.
2. Open `krea2-character-reference-manual.json` and queue one still.
3. Inspect identity retention and record wall time plus peak VRAM/RAM.
4. Only after that still succeeds, open
   `ltx23-refs2vid-msr-manual-3080.json` and queue its minimal direct-video test.
5. Record output path, wall time, peak VRAM/RAM, and any offload or OOM message.
6. Keep editing and rerunning these UI masters until they are visually useful.
7. Export each proven graph from ComfyUI in API format for the Engine handoff.

## Krea candidate

`krea2-character-reference-manual.json` uses:

- `redcraft23INT8INT4FP8_30Krea2.safetensors`;
- `qwen3-vl-4b-heretic_int8.safetensors`;
- `qwen_image_vae.safetensors`;
- `marinara-msr-character-2b.jpg` as the manual identity reference;
- Qwen image conditioning plus `VAEEncode -> ReferenceLatent`;
- a 432 by 768 portrait target and a connected `SaveImage` output.

This first smoke test proves the installed Krea stack and one-reference identity
path. Location plus character inputs are the next controlled graph change, not
part of this first render.

## LTX MSR candidate

`ltx23-refs2vid-msr-manual-3080.json` uses:

- `ltx-2.3-22b-distilled-1.1_transformer_only_int8_convrot.safetensors`;
- `gemma_3_12B_it_fp4_mixed.safetensors` plus the LTX text projection;
- separate LTX 2.3 video and audio VAEs;
- `LTX-2.3-Licon-MSR-V2.safetensors` through the IC-LoRA loader;
- `marinara-msr-character-2b.jpg` as subject 1;
- `marinara-msr-location-vesperhold-guild-hall.png` as the background;
- a 512-pixel long side, 2 seconds, 24 fps, and 49 target frames;
- an empty audio latent and a connected MP4 output.

The custom-audio branch and unused subject slots remain bypassed. The graph must
not be called RTX-3080-compatible until a real render completes on the 10 GB
card. If it OOMs or offloads too slowly, preserve this exact graph as the control
for a normal ComfyUI RunPod Pod benchmark.

## API handoff gate

Do not hand-edit these UI files into API payloads. After each graph works, use
ComfyUI's API export and verify the exported loader-to-conditioning-to-output
path before adding semantic placeholders. The Engine workstation should consume
only those proven exports.
