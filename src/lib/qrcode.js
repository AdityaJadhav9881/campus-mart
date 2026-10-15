const VERSION_SPEC = {
  1: { ecPerBlock: 10, blocks: [[1, 16]] },
  2: { ecPerBlock: 16, blocks: [[1, 28]] },
  3: { ecPerBlock: 26, blocks: [[1, 44]] },
  4: { ecPerBlock: 18, blocks: [[2, 32]] },
  5: { ecPerBlock: 24, blocks: [[2, 43]] },
  6: { ecPerBlock: 16, blocks: [[4, 27]] },
  7: { ecPerBlock: 18, blocks: [[4, 31]] },
  8: { ecPerBlock: 22, blocks: [[2, 38], [2, 39]] },
  9: { ecPerBlock: 22, blocks: [[3, 36], [2, 37]] },
  10: { ecPerBlock: 26, blocks: [[4, 43], [1, 44]] },
};

const ALIGNMENT_CENTERS = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

function gfMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function rsGenerator(degree) {
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 2);
  }
  return result;
}

function rsRemainder(data, divisor) {
  const result = new Array(divisor.length).fill(0);
  for (const byte of data) {
    const factor = byte ^ result.shift();
    result.push(0);
    for (let i = 0; i < result.length; i++) {
      result[i] ^= gfMul(divisor[i], factor);
    }
  }
  return result;
}

function pickVersion(byteLength) {
  for (let version = 1; version <= 10; version++) {
    const spec = VERSION_SPEC[version];
    const totalData = spec.blocks.reduce((sum, [count, size]) => sum + count * size, 0);
    const ccBits = version <= 9 ? 8 : 16;
    if (
      byteLength <= (1 << ccBits) - 1 &&
      4 + ccBits + byteLength * 8 <= totalData * 8
    ) {
      return version;
    }
  }
  throw new Error("QR: data too long for supported versions (1-10)");
}

function toCodewords(bytes, version) {
  const spec = VERSION_SPEC[version];
  const totalData = spec.blocks.reduce((sum, [count, size]) => sum + count * size, 0);
  const ccBits = version <= 9 ? 8 : 16;
  const bits = [];

  const push = (value, count) => {
    for (let i = count - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };

  push(0b0100, 4);
  push(bytes.length, ccBits);
  for (const byte of bytes) push(byte, 8);

  const capacityBits = totalData * 8;
  for (let i = 0; i < 4 && bits.length < capacityBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const words = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    words.push(byte);
  }

  const pads = [0xec, 0x11];
  let p = 0;
  while (words.length < totalData) words.push(pads[p++ % 2]);
  return words;
}

function interleaveEcc(dataWords, version) {
  const spec = VERSION_SPEC[version];
  const generator = rsGenerator(spec.ecPerBlock);
  const blocks = [];
  let offset = 0;

  for (const [count, size] of spec.blocks) {
    for (let i = 0; i < count; i++) {
      const data = dataWords.slice(offset, offset + size);
      offset += size;
      blocks.push({ data, ecc: rsRemainder(data, generator) });
    }
  }

  const result = [];
  const maxData = Math.max(...blocks.map((b) => b.data.length));
  for (let i = 0; i < maxData; i++) {
    for (const block of blocks) {
      if (i < block.data.length) result.push(block.data[i]);
    }
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (const block of blocks) result.push(block.ecc[i]);
  }
  return result;
}

function getBit(value, index) {
  return ((value >>> index) & 1) !== 0;
}

function drawFormatBits(modules, mask) {
  const size = modules.length;
  const data = (0b00 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  const bits = ((data << 10) | rem) ^ 0x5412;

  const set = (x, y, dark) => {
    modules[y][x] = dark;
  };

  for (let i = 0; i <= 5; i++) set(8, i, getBit(bits, i));
  set(8, 7, getBit(bits, 6));
  set(8, 8, getBit(bits, 7));
  set(7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, getBit(bits, i));

  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, getBit(bits, i));
  set(8, size - 8, true);
}

function drawVersionBits(modules, isFunction, version) {
  if (version < 7) return;
  const size = modules.length;
  let rem = version;
  for (let i = 0; i < 12; i++) {
    rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  }
  const bits = (version << 12) | rem;

  for (let i = 0; i < 18; i++) {
    const bit = getBit(bits, i);
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    modules[b][a] = bit;
    isFunction[b][a] = true;
    modules[a][b] = bit;
    isFunction[a][b] = true;
  }
}

function buildGrid(version) {
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));

  const setFn = (x, y, dark) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    modules[y][x] = dark;
    isFunction[y][x] = true;
  };

  for (let i = 0; i < size; i++) {
    setFn(6, i, i % 2 === 0);
    setFn(i, 6, i % 2 === 0);
  }

  const drawFinder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(cx + dx, cy + dy, dist !== 2 && dist !== 4);
      }
    }
  };
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  const centers = ALIGNMENT_CENTERS[version];
  const last = centers.length - 1;
  for (let i = 0; i < centers.length; i++) {
    for (let j = 0; j < centers.length; j++) {
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === last) ||
        (i === last && j === 0)
      ) {
        continue;
      }
      const cx = centers[i];
      const cy = centers[j];
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
  }

  drawFormatBits(modules, 0);
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      isFunction[i][8] = true;
      isFunction[8][i] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    isFunction[8][size - 1 - i] = true;
    isFunction[size - 1 - i][8] = true;
  }
  isFunction[size - 8][8] = true;

  drawVersionBits(modules, isFunction, version);

  return { modules, isFunction, size };
}

function placeCodewords(words, modules, isFunction, size) {
  let bitIndex = 0;
  const totalBits = words.length * 8;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && bitIndex < totalBits) {
          modules[y][x] = getBit(words[bitIndex >>> 3], 7 - (bitIndex & 7));
          bitIndex++;
        }
      }
    }
  }
}

function applyMask(modules, isFunction, mask) {
  const size = modules.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFunction[y][x]) continue;
      let invert;
      switch (mask) {
        case 0:
          invert = (x + y) % 2 === 0;
          break;
        case 1:
          invert = y % 2 === 0;
          break;
        case 2:
          invert = x % 3 === 0;
          break;
        case 3:
          invert = (x + y) % 3 === 0;
          break;
        case 4:
          invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
          break;
        case 5:
          invert = ((x * y) % 2) + ((x * y) % 3) === 0;
          break;
        case 6:
          invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
          break;
        default:
          invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
      }
      if (invert) modules[y][x] = !modules[y][x];
    }
  }
}

function penaltyScore(modules) {
  const size = modules.length;
  let score = 0;

  const addHistory = (runLength, history) => {
    if (history[0] === 0) runLength += size;
    history.pop();
    history.unshift(runLength);
  };

  const countPatterns = (h) => {
    const n = h[1];
    const core =
      n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n;
    return (
      (core && h[0] >= n * 4 && h[6] >= n ? 1 : 0) +
      (core && h[6] >= n * 4 && h[0] >= n ? 1 : 0)
    );
  };

  const terminateCount = (currentColor, runLength, history) => {
    if (currentColor) {
      addHistory(runLength, history);
      runLength = 0;
    }
    addHistory(runLength + size, history);
    return countPatterns(history);
  };

  for (let y = 0; y < size; y++) {
    let runColor = false;
    let runX = 0;
    const history = [0, 0, 0, 0, 0, 0, 0];
    for (let x = 0; x < size; x++) {
      if (modules[y][x] === runColor) {
        runX++;
        if (runX === 5) score += 3;
        else if (runX > 5) score++;
      } else {
        addHistory(runX, history);
        if (!runColor) score += countPatterns(history) * 40;
        runColor = modules[y][x];
        runX = 1;
      }
    }
    score += terminateCount(runColor, runX, history) * 40;
  }

  for (let x = 0; x < size; x++) {
    let runColor = false;
    let runY = 0;
    const history = [0, 0, 0, 0, 0, 0, 0];
    for (let y = 0; y < size; y++) {
      if (modules[y][x] === runColor) {
        runY++;
        if (runY === 5) score += 3;
        else if (runY > 5) score++;
      } else {
        addHistory(runY, history);
        if (!runColor) score += countPatterns(history) * 40;
        runColor = modules[y][x];
        runY = 1;
      }
    }
    score += terminateCount(runColor, runY, history) * 40;
  }

  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = modules[y][x];
      if (
        color === modules[y][x + 1] &&
        color === modules[y + 1][x] &&
        color === modules[y + 1][x + 1]
      ) {
        score += 3;
      }
    }
  }

  let dark = 0;
  for (const row of modules) {
    for (const cell of row) {
      if (cell) dark++;
    }
  }
  const total = size * size;
  const k = Math.floor(Math.abs(dark * 20 - total * 10) / total);
  score += k * 10;

  return score;
}

export function qrMatrix(text) {
  const bytes = Array.from(new TextEncoder().encode(String(text)));
  if (bytes.length === 0) throw new Error("QR: empty data");

  const version = pickVersion(bytes.length);
  const dataWords = toCodewords(bytes, version);
  const allWords = interleaveEcc(dataWords, version);

  const { modules, isFunction, size } = buildGrid(version);
  placeCodewords(allWords, modules, isFunction, size);

  let best = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(modules, isFunction, mask);
    drawFormatBits(modules, mask);
    const score = penaltyScore(modules);
    if (score < bestScore) {
      bestScore = score;
      best = modules.map((row) => row.slice());
    }
    applyMask(modules, isFunction, mask);
  }

  return best;
}
