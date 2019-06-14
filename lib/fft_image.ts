import {ComplexArray} from './fft';

export function FFTImageDataRGBA(data: Uint8ClampedArray, nx: number, ny: number): ComplexArray {
  const rgb: Array<Uint8ClampedArray> = splitRGB(data);

  return mergeRGB(
    FFT2D(new ComplexArray(rgb[0], Float32Array), nx, ny),
    FFT2D(new ComplexArray(rgb[1], Float32Array), nx, ny),
    FFT2D(new ComplexArray(rgb[2], Float32Array), nx, ny)
  );
};

function splitRGB(data: Uint8ClampedArray): Array<Uint8ClampedArray> {
  const n: number = data.length / 4;
  const r = new Uint8ClampedArray(n);
  const g = new Uint8ClampedArray(n);
  const b = new Uint8ClampedArray(n);

  for(let i = 0; i < n; i++) {
    r[i] = data[4 * i];
    g[i] = data[4 * i + 1];
    b[i] = data[4 * i + 2];
  }

  return [r, g, b];
}

function mergeRGB(r: ComplexArray, g: ComplexArray, b: ComplexArray): ComplexArray {
  const n = r.length;
  const output = new ComplexArray(n * 4);

  for(let i = 0; i < n; i++) {
    output.real[4 * i] = r.real[i];
    output.imag[4 * i] = r.imag[i];
    output.real[4 * i + 1] = g.real[i];
    output.imag[4 * i + 1] = g.imag[i];
    output.real[4 * i + 2] = b.real[i];
    output.imag[4 * i + 2] = b.imag[i];
  }

  return output;
}

function FFT2D(input: ComplexArray, nx: number, ny: number, inverse: boolean = false): ComplexArray {
  const transform = inverse ? 'InvFFT' : 'FFT';
  const output = new ComplexArray(input.length, input.ArrayType);
  const row = new ComplexArray(nx, input.ArrayType);
  const col = new ComplexArray(ny, input.ArrayType);

  for(let j = 0; j < ny; j++) {
    row.map((v, i) => {
      v.real = input.real[i + j * nx];
      v.imag = input.imag[i + j * nx];
    });
    row[transform]().forEach((v, i) => {
      output.real[i + j * nx] = v.real;
      output.imag[i + j * nx] = v.imag;
    });
  }

  for(let i = 0; i < nx; i++) {
    col.map((v, j) => {
      v.real = output.real[i + j * nx];
      v.imag = output.imag[i + j * nx];
    });
    col[transform]().forEach((v, j) => {
      output.real[i + j * nx] = v.real;
      output.imag[i + j * nx] = v.imag;
    });
  }

  return output;
}
