#!/usr/bin/env node

import { readFileSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

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
  gifFallbackHeight,
  primaryColor
} = config;

console.log('🎬 Traitement de vidéo brute Comptalyze...\n');

// Récupérer le chemin du fichier source
const sourceFile = process.argv[2];

if (!sourceFile) {
  console.error('❌ Usage : npm run demo:fromRaw <path/to/raw.mp4>');
  process.exit(1);
}

if (!existsSync(sourceFile)) {
  console.error(`❌ Fichier introuvable : ${sourceFile}`);
  process.exit(1);
}

console.log(`📁 Fichier source : ${sourceFile}`);

// Fonction pour obtenir la durée d'une vidéo
function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath
    ]);

    let output = '';
    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });

    ffprobe.on('close', (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        resolve(duration);
      } else {
        reject(new Error('Failed to get video duration'));
      }
    });
  });
}

// Fonction pour couper et traiter la vidéo
function trimAndProcessVideo(inputPath, outputPath, startTime, duration) {
  return new Promise((resolve, reject) => {
    console.log(`✂️  Découpe de ${startTime}s à ${startTime + duration}s...`);

    // Créer le texte overlay avec le style Comptalyze
    const textFilter = `drawtext=` +
      `fontfile=/Windows/Fonts/arial.ttf:` +
      `text='Comptalyze':` +
      `fontcolor=white:` +
      `fontsize=48:` +
      `box=1:` +
      `boxcolor=${primaryColor}@0.8:` +
      `boxborderw=20:` +
      `x=(w-text_w)/2:` +
      `y=50:` +
      `enable='between(t,0,1)'`;

    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-ss', startTime.toString(),
      '-i', inputPath,
      '-t', duration.toString(),
      '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,${textFilter}`,
      '-r', fps.toString(),
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an', // Pas d'audio
      outputPath
    ]);

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
    const gifFps = Math.min(fps, 20);

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
          
          if (stats.size > maxGifSize) {
            if (useFullSize) {
              console.log(`⚠️  GIF trop lourd (${sizeMB} Mo > ${maxGifSize / 1024 / 1024} Mo)`);
              console.log(`🔄 Nouvelle tentative avec dimensions réduites (${gifFallbackWidth}×${gifFallbackHeight})...`);
              createOptimizedGif(mp4Path, gifPath, false).then(resolve).catch(reject);
            } else {
              console.warn(`⚠️  Attention : GIF dépasse toujours ${maxGifSize / 1024 / 1024} Mo`);
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
    // 1. Obtenir la durée de la vidéo source
    const totalDuration = await getVideoDuration(sourceFile);
    console.log(`⏱️  Durée totale : ${totalDuration.toFixed(2)}s`);

    // 2. Calculer le meilleur segment (au milieu si possible)
    const targetDuration = Math.min(durationSec, totalDuration);
    const startTime = Math.max(0, (totalDuration - targetDuration) / 2);
    
    console.log(`🎯 Segment sélectionné : ${startTime.toFixed(2)}s → ${(startTime + targetDuration).toFixed(2)}s`);

    // 3. Traiter la vidéo
    const mp4Path = join(projectRoot, 'public', 'hero-demo.mp4');
    const gifPath = join(projectRoot, 'public', 'hero-demo.gif');

    await trimAndProcessVideo(sourceFile, mp4Path, startTime, targetDuration);

    // 4. Créer le GIF
    await createOptimizedGif(mp4Path, gifPath);

    console.log('\n✨ Traitement terminé avec succès !');
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








