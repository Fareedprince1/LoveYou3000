const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// ---- Configuration ----
// Change INPUT_DIR to point at your raw frames folder
const INPUT_DIR = path.join(__dirname, '..', 'new video frame');
const OUTPUT_DIR = path.join(__dirname, '..', 'frames');
const TARGET_WIDTH = null; // Keep original resolution
const PNG_COMPRESSION = 9; // High compression for storage, but lossless

// Crop config — remove black letterbox bars (Disabled for new sequence)
const CROP_ENABLED = false;
const CROP_LEFT = 0;
const CROP_RIGHT = 0;

async function compressFrames() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all PNG files sorted
  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => f.endsWith('.png'))
    .sort();

  console.log(`Found ${files.length} frames to compress...`);
  console.log(`Input:  ${INPUT_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Target: Original resolution, Lossless PNG`);
  if (CROP_ENABLED) {
    console.log(`Crop: ${CROP_LEFT}px left, ${CROP_RIGHT}px right (removing letterbox bars)`);
  }
  console.log('');

  let totalOriginal = 0;
  let totalCompressed = 0;

  for (let i = 0; i < files.length; i++) {
    const inputPath = path.join(INPUT_DIR, files[i]);
    const frameNum = String(i + 1).padStart(3, '0');
    const outputPath = path.join(OUTPUT_DIR, `frame-${frameNum}.png`);

    const originalSize = fs.statSync(inputPath).size;
    totalOriginal += originalSize;

    let pipeline = sharp(inputPath);

    // Crop letterbox bars if enabled
    if (CROP_ENABLED) {
      const metadata = await sharp(inputPath).metadata();
      const cropWidth = metadata.width - CROP_LEFT - CROP_RIGHT;
      pipeline = pipeline.extract({
        left: CROP_LEFT,
        top: 0,
        width: cropWidth,
        height: metadata.height
      });
    }

    await pipeline
      .resize(TARGET_WIDTH, null, { withoutEnlargement: true })
      .png({ compressionLevel: PNG_COMPRESSION })
      .toFile(outputPath);

    const compressedSize = fs.statSync(outputPath).size;
    totalCompressed += compressedSize;

    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    process.stdout.write(`\r  [${i + 1}/${files.length}] ${files[i]} → frame-${frameNum}.png (${(compressedSize / 1024).toFixed(0)}KB, -${ratio}%)`);
  }

  console.log('\n');
  console.log(`✅ Done! Compressed ${files.length} frames`);
  console.log(`   Original:   ${(totalOriginal / 1024 / 1024).toFixed(1)}MB`);
  console.log(`   Compressed: ${(totalCompressed / 1024 / 1024).toFixed(1)}MB`);
  console.log(`   Saved:      ${((totalOriginal - totalCompressed) / 1024 / 1024).toFixed(1)}MB (${((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`\n💡 Update TOTAL_FRAMES in index.js to ${files.length} if changed.`);
}

compressFrames().catch(console.error);
