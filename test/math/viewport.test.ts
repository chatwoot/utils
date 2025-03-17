import {
  calculateCenterOffset,
  applyRotationTransform,
  normalizeToPercentage,
} from '../../src';

// Create a full DOMRect compatible mock
const createRect = (
  x: number,
  y: number,
  width: number,
  height: number
): DOMRect => {
  return {
    x,
    y,
    width,
    height,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({
      x,
      y,
      width,
      height,
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    }),
  } as DOMRect;
};

describe('calculateCenterOffset', () => {
  it('should calculate correct offsets when mouse is at center', () => {
    const mouseX = 150;
    const mouseY = 100;
    const rect = createRect(100, 50, 100, 100);
    const expectedOutput = { relativeX: 0, relativeY: 0 };
    const result = calculateCenterOffset(mouseX, mouseY, rect);
    expect(result).toEqual(expectedOutput);
  });

  it('should calculate correct offsets when mouse is at top-left corner', () => {
    const mouseX = 100;
    const mouseY = 50;
    const rect = createRect(100, 50, 100, 100);
    const expectedOutput = { relativeX: -50, relativeY: -50 };
    const result = calculateCenterOffset(mouseX, mouseY, rect);
    expect(result).toEqual(expectedOutput);
  });

  it('should calculate correct offsets when mouse is at bottom-right corner', () => {
    const mouseX = 200;
    const mouseY = 150;
    const rect = createRect(100, 50, 100, 100);
    const expectedOutput = { relativeX: 50, relativeY: 50 };
    const result = calculateCenterOffset(mouseX, mouseY, rect);
    expect(result).toEqual(expectedOutput);
  });

  it('should calculate correct offsets when mouse is outside the element', () => {
    const mouseX = 250;
    const mouseY = 200;
    const rect = createRect(100, 50, 100, 100);
    const expectedOutput = { relativeX: 100, relativeY: 100 };
    const result = calculateCenterOffset(mouseX, mouseY, rect);
    expect(result).toEqual(expectedOutput);
  });
});

describe('applyRotationTransform', () => {
  it('should not change coordinates when angle is 0 degrees', () => {
    const relativeX = 50;
    const relativeY = 25;
    const angle = 0;
    const expectedOutput = { rotatedX: 50, rotatedY: 25 };
    const result = applyRotationTransform(relativeX, relativeY, angle);
    expect(result.rotatedX).toBeCloseTo(expectedOutput.rotatedX);
    expect(result.rotatedY).toBeCloseTo(expectedOutput.rotatedY);
  });

  it('should swap and negate coordinates when angle is 90 degrees', () => {
    const relativeX = 50;
    const relativeY = 25;
    const angle = 90;
    const expectedOutput = { rotatedX: 25, rotatedY: -50 };
    const result = applyRotationTransform(relativeX, relativeY, angle);
    expect(result.rotatedX).toBeCloseTo(expectedOutput.rotatedX);
    expect(result.rotatedY).toBeCloseTo(expectedOutput.rotatedY);
  });

  it('should negate both coordinates when angle is 180 degrees', () => {
    const relativeX = 50;
    const relativeY = 25;
    const angle = 180;
    const expectedOutput = { rotatedX: -50, rotatedY: -25 };
    const result = applyRotationTransform(relativeX, relativeY, angle);
    expect(result.rotatedX).toBeCloseTo(expectedOutput.rotatedX);
    expect(result.rotatedY).toBeCloseTo(expectedOutput.rotatedY);
  });

  it('should handle negative angles correctly', () => {
    const relativeX = 50;
    const relativeY = 25;
    const angle = -90;
    const expectedOutput = { rotatedX: -25, rotatedY: 50 };
    const result = applyRotationTransform(relativeX, relativeY, angle);
    expect(result.rotatedX).toBeCloseTo(expectedOutput.rotatedX);
    expect(result.rotatedY).toBeCloseTo(expectedOutput.rotatedY);
  });
});

describe('normalizeToPercentage', () => {
  it('should convert center coordinates to 50%, 50%', () => {
    const rotatedX = 0;
    const rotatedY = 0;
    const width = 100;
    const height = 100;
    const expectedOutput = { x: 50, y: 50 };
    const result = normalizeToPercentage(rotatedX, rotatedY, width, height);
    expect(result).toEqual(expectedOutput);
  });

  it('should convert extreme negative coordinates to 0%', () => {
    const rotatedX = -100;
    const rotatedY = -100;
    const width = 100;
    const height = 100;
    const expectedOutput = { x: 0, y: 0 };
    const result = normalizeToPercentage(rotatedX, rotatedY, width, height);
    expect(result).toEqual(expectedOutput);
  });

  it('should convert extreme positive coordinates to 100%', () => {
    const rotatedX = 100;
    const rotatedY = 100;
    const width = 100;
    const height = 100;
    const expectedOutput = { x: 100, y: 100 };
    const result = normalizeToPercentage(rotatedX, rotatedY, width, height);
    expect(result).toEqual(expectedOutput);
  });

  it('should correctly handle non-square dimensions', () => {
    const rotatedX = 75;
    const rotatedY = 50;
    const width = 300;
    const height = 200;
    // For width 300: 50 + (75 / (300/2)) * 50 = 50 + (75 / 150) * 50 = 50 + 0.5 * 50 = 75
    // For height 200: 50 + (50 / (200/2)) * 50 = 50 + (50 / 100) * 50 = 50 + 0.5 * 50 = 75
    const expectedOutput = { x: 75, y: 75 };
    const result = normalizeToPercentage(rotatedX, rotatedY, width, height);
    expect(result).toEqual(expectedOutput);
  });

  it('should clamp values between 0% and 100%', () => {
    const rotatedX = 1000;
    const rotatedY = -1000;
    const width = 100;
    const height = 100;
    const expectedOutput = { x: 100, y: 0 };
    const result = normalizeToPercentage(rotatedX, rotatedY, width, height);
    expect(result).toEqual(expectedOutput);
  });
});
