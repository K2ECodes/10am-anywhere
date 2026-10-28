#!/usr/bin/env node
// 10am content engine: AI UGC reel from real products in Sanity.
//
//   node engine/ugc.mjs --products slug1,slug2 --scene "..." --voice "script..." --captions "line|line|line" --out engine/out/dinner
//
// 1. still   : nano-banana-2 (kie.ai) renders a phone-shot "creator" scene using
//              the real product photos as references (12 credits)
// 2. voice   : Gemini TTS on kie.ai reads the voiceover (under 1 credit)
// 3. reel    : ffmpeg animates the still (slow push-in), burns the captions and
//              mixes the voice into a 9:16 MP4 ready for Reels / TikTok
// Real motion video (kling image-to-video, ~90 credits) slots in at step 3 once
// the kie.ai balance allows: pass --motion.
//
// KIE_API_KEY comes from the environment or KIE_ENV_FILE. It is never printed.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const flag = (k) => process.argv.includes('--' + k);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function key() {
  if (process.env.KIE_API_KEY) return process.env.KIE_API_KEY;
  const f = process.env.KIE_ENV_FILE || path.join(process.env.HOME, 'thumbnails/using-claude-wrong/.env');
  const m = fs.existsSync(f) && fs.readFileSync(f, 'utf8').match(/^KIE_API_KEY=(.+)$/m);
  if (!m) throw new Error('KIE_API_KEY not found');
  return m[1].trim().replace(/^["']|["']$/g, '');
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function kie(method, url, body) {
  const r = await fetch('https://api.kie.ai' + url, { method, headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  const j = await r.json();
  if (j.code !== 200) throw new Error(`kie ${url}: ${j.code} ${j.msg}`);
  return j.data;
}
async function task(model, input, label) {
  const { taskId } = await kie('POST', '/api/v1/jobs/createTask', { model, input });
  process.stdout.write(`  ${label}: task ${taskId.slice(0, 8)} `);
  for (let w = 3000; ; w = Math.min(w * 1.4, 12000)) {
    await sleep(w); process.stdout.write('.');
    const d = await kie('GET', `/api/v1/jobs/recordInfo?taskId=${taskId}`);
    if (d.state === 'success') { console.log(` done (${d.creditsConsumed ?? '?'} credits)`); return JSON.parse(d.resultJson).resultUrls[0]; }
    if (d.state === 'fail') throw new Error(`${label} failed: ${d.failMsg}`);
  }
}
async function download(url, out) { const r = await fetch(url); fs.writeFileSync(out, Buffer.from(await r.arrayBuffer())); return out; }

const out = path.resolve(arg('out', path.join(ROOT, 'engine/out/reel')));
fs.mkdirSync(out, { recursive: true });
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'engine/data/latest.json'), 'utf8'));
const all = [...data.edits.flatMap((e) => e.products), ...data.picks];
const products = arg('products', '').split(',').filter(Boolean).map((s) => all.find((p) => p.slug === s) || (() => { throw new Error('unknown product ' + s); })());
const scene = arg('scene');
const voice = arg('voice');
const captions = arg('captions', '').split('|').filter(Boolean);
if (!products.length || !scene || !voice) { console.error('need --products, --scene, --voice'); process.exit(1); }

const still = path.join(out, 'still.png');
if (!fs.existsSync(still) || flag('fresh')) {
  const prompt = `Authentic iPhone UGC photo, vertical 9:16, natural evening light, slightly imperfect handheld framing, real skin texture, no text, no logos added. ${scene} The products in the reference images must appear exactly as they are (same shape, material and colour): ${products.map((p) => `${p.brand} ${p.name}`).join(', ')}.`;
  const url = await task('nano-banana-2', { prompt, image_input: products.map((p) => p.image), aspect_ratio: '9:16', resolution: '2K', output_format: 'png' }, 'still');
  await download(url, still);
}
const vo = path.join(out, 'voice.wav');
if (!fs.existsSync(vo) || flag('fresh')) {
  const url = await task('google/gemini-3-8-flash-tts', { speakers: [{ speaker_id: 'Speaker 1', voice_name: arg('voice-name', 'Kore') }], dialogue_turns: [{ speaker_id: 'Speaker 1', style: 'Woman in her 30s filming a casual Instagram story for friends. Warm, relaxed, understated, natural pace, never salesy.', text: voice }] }, 'voice');
  await download(url, vo);
}

// Reel: push-in on the still, one caption at a time, spread across the voice.
const dur = Math.max(6, Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', vo]).toString()) + 0.6);
const fps = 30, frames = Math.round(dur * fps);
const font = '/System/Library/Fonts/Supplemental/Georgia Italic.ttf';
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, '\u2019').replace(/%/g, '\\%');
const per = dur / Math.max(1, captions.length);
const caps = captions.map((c, i) => `drawtext=fontfile='${font}':text='${esc(c)}':fontsize=58:fontcolor=white:borderw=0:shadowcolor=black@0.55:shadowx=0:shadowy=3:x=(w-text_w)/2:y=h*0.74:enable='between(t,${(i * per).toFixed(2)},${((i + 1) * per - 0.05).toFixed(2)})'`);
const vf = [`scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840`, `zoompan=z='min(1+0.10*on/${frames},1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${fps}`, ...caps, 'format=yuv420p'].join(',');
const mp4 = path.join(out, 'reel.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-i', still, '-i', vo, '-vf', vf, '-t', dur.toFixed(2), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', '-af', 'apad', '-shortest', '-movflags', '+faststart', mp4]);
fs.writeFileSync(path.join(out, 'brief.json'), JSON.stringify({ products: products.map((p) => p.slug), scene, voice, captions, made: new Date().toISOString() }, null, 1));
console.log('reel:', mp4, `(${dur.toFixed(1)}s)`);
