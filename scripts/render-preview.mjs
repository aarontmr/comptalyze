#!/usr/bin/env node

import { readFileSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import http from 'http';
import { createReadStream } from 'fs';
import { lookup } from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Charger la configuration
const config = JSON.parse(
  readFileSync(join(__dirname, 'config.json'), 'utf-8')
);

const {
  durationSec,
  fps,
  width,
  height,
  maxMp4Size,
  maxGifSize,
  gifFallbackWidth,
  gifFallbackHeight
} = config;

console.log('🎬 Démarrage de l\'enregistrement de la démo Comptalyze...\n');

// Fonction pour créer un serveur HTTP simple
function createServer(port = 3456) {
  const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/demo/hero-preview.html' : req.url;
    filePath = join(projectRoot, filePath);

    if (!existsSync(filePath)) {
      res.writeHead(404);
      res.end('404 Not Found');
      return;
    }

    const mimeType = lookup(filePath) || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mimeType });
    createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`✅ Serveur local démarré sur http://localhost:${port}`);
      resolve({ server, url: `http://localhost:${port}` });
    });
  });
}

// Helper function pour attendre
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fonction pour enregistrer avec Puppeteer
async function recordDemo(url) {
  console.log('🎥 Lancement de Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });

  console.log(`📐 Viewport configuré : ${width}×${height}`);
  console.log('🌐 Chargement de la page...');

  await page.goto(url, { waitUntil: 'networkidle0' });

  // Attendre que la démo soit prête
  await page.waitForFunction(() => window.__demoReady === true, { timeout: 5000 });
  
  console.log('✅ Page prête, début de l\'enregistrement...');

  // Enregistrer les frames
  const frames = [];
  const frameInterval = 1000 / fps;
  const totalFrames = Math.ceil(durationSec * fps);

  for (let i = 0; i < totalFrames; i++) {
    const screenshot = await page.screenshot({ type: 'png' });
    frames.push(screenshot);
    
    if (i % 24 === 0) {
      console.log(`📸 Frame ${i}/${totalFrames} (${((i/totalFrames)*100).toFixed(1)}%)`);
    }
    
    await sleep(frameInterval);
  }

  console.log(`✅ ${totalFrames} frames capturées`);

  await browser.close();
  return frames;
}

// Fonction pour encoder en MP4 avec ffmpeg
function encodeToMp4(frames, outputPath) {
  return new Promise((resolve, reject) => {
    console.log('🎬 Encodage MP4 avec ffmpeg...');

    const ffmpeg = spawn('ffmpeg', [
      '-y', // Overwrite
      '-f', 'image2pipe',
      '-r', fps.toString(),
      '-i', '-', // Input depuis pipe
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outputPath
    ]);

    let frameIndex = 0;
    const writeNextFrame = () => {
      if (frameIndex < frames.length) {
        ffmpeg.stdin.write(frames[frameIndex], () => {
          frameIndex++;
          writeNextFrame();
        });
      } else {
        ffmpeg.stdin.end();
      }
    };

    writeNextFrame();

    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        const stats = statSync(outputPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`✅ MP4 créé : ${outputPath} (${sizeMB} Mo)`);
        
        if (stats.size > maxMp4Size) {
          console.warn(`⚠️  Attention : MP4 dépasse ${maxMp4Size / 1024 / 1024} Mo`);
        }
        
        resolve(outputPath);
      } else {
        console.error('❌ Erreur ffmpeg:', stderr);
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', reject);
  });
}

// Fonction pour créer un GIF optimisé
function createOptimizedGif(mp4Path, gifPath, useFullSize = true) {
  return new Promise((resolve, reject) => {
    console.log('🎨 Création du GIF optimisé...');

    const targetWidth = useFullSize ? width : gifFallbackWidth;
    const targetHeight = useFullSize ? height : gifFallbackHeight;
    const gifFps = Math.min(fps, 20); // Limiter à 20 fps pour le GIF

    const paletteGen = spawn('ffmpeg', [
      '-y',
      '-i', mp4Path,
      '-vf', `fps=${gifFps},scale=${targetWidth}:${targetHeight}:flags=lanczos,palettegen=max_colors=128`,
      join(projectRoot, 'public', 'palette.png')
    ]);

    paletteGen.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Palette generation failed'));
        return;
      }

      const gifGen = spawn('ffmpeg', [
        '-y',
        '-i', mp4Path,
        '-i', join(projectRoot, 'public', 'palette.png'),
        '-filter_complex', `fps=${gifFps},scale=${targetWidth}:${targetHeight}:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
        '-loop', '0',
        gifPath
      ]);

      let stderr = '';
      gifGen.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      gifGen.on('close', (code) => {
        if (code === 0) {
          const stats = statSync(gifPath);
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          console.log(`✅ GIF créé : ${gifPath} (${sizeMB} Mo)`);
          
          // Vérifier la taille
          if (stats.size > maxGifSize) {
            if (useFullSize) {
              console.log(`⚠️  GIF trop lourd (${sizeMB} Mo > ${maxGifSize / 1024 / 1024} Mo)`);
              console.log(`🔄 Nouvelle tentative avec dimensions réduites (${gifFallbackWidth}×${gifFallbackHeight})...`);
              createOptimizedGif(mp4Path, gifPath, false).then(resolve).catch(reject);
            } else {
              console.warn(`⚠️  Attention : GIF dépasse toujours ${maxGifSize / 1024 / 1024} Mo après réduction`);
              resolve(gifPath);
            }
          } else {
            resolve(gifPath);
          }
        } else {
          console.error('❌ Erreur GIF:', stderr);
          reject(new Error(`GIF generation failed with code ${code}`));
        }
      });
    });
  });
}

// Fonction principale
async function main() {
  try {
    // 1. Démarrer le serveur
    const { server, url } = await createServer();

    // 2. Enregistrer avec Puppeteer
    const frames = await recordDemo(url);

    // 3. Fermer le serveur
    server.close();
    console.log('🛑 Serveur local arrêté\n');

    // 4. Créer les répertoires de sortie
    const mp4Path = join(projectRoot, 'public', 'hero-demo.mp4');
    const gifPath = join(projectRoot, 'public', 'hero-demo.gif');

    // 5. Encoder en MP4
    await encodeToMp4(frames, mp4Path);

    // 6. Créer le GIF
    await createOptimizedGif(mp4Path, gifPath);

    console.log('\n✨ Rendu terminé avec succès !');
    console.log('\n📦 Fichiers générés :');
    console.log(`   • ${mp4Path}`);
    console.log(`   • ${gifPath}`);
    
    // Afficher les tailles finales
    const mp4Stats = statSync(mp4Path);
    const gifStats = statSync(gifPath);
    console.log('\n📊 Tailles finales :');
    console.log(`   • MP4: ${(mp4Stats.size / 1024 / 1024).toFixed(2)} Mo / ${(maxMp4Size / 1024 / 1024).toFixed(0)} Mo max`);
    console.log(`   • GIF: ${(gifStats.size / 1024 / 1024).toFixed(2)} Mo / ${(maxGifSize / 1024 / 1024).toFixed(0)} Mo max`);

  } catch (error) {
    console.error('\n❌ Erreur :', error.message);
    process.exit(1);
  }
}

main();

