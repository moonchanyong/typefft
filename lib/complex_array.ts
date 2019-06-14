type ComplexObject = {
  real: number,
  imag: number
};

type HandleArray =
  Float32Array |
  Float64Array |
  Uint8ClampedArray |
  Array<Number> |
  ComplexArray;

export default class ComplexArray {
  other: HandleArray;
  ArrayType: any;
  real: HandleArray;
  imag: HandleArray;
  length: number = 0;

  constructor(other: HandleArray | number, arrayType:any = Float32Array) {
    if (other instanceof ComplexArray) {
      // Copy constuctor.
      this.ArrayType = other.ArrayType as any;
      this.real = new this.ArrayType(other.real);
      this.imag = new this.ArrayType(other.imag);
    } else {
      this.ArrayType = arrayType;
      // other can be either an array or a number.
      this.real = this.ArrayType === Array? other : new this.ArrayType(other);
      this.imag = new this.ArrayType(this.real.length);
    }

    this.length = this.real.length;
  }

  conjugate = () => new ComplexArray(this).map(value => value.imag *= -1);

  toString() {
    const components: Array<String> = [];

    this.forEach((value: ComplexObject, i: number) =>
      components.push(`(${value.real.toFixed(2)}, ${value.imag.toFixed(2)})`));

    return `[${components.join(', ')}]`;
  }

  forEach(iterator: (value: ComplexObject, i: number, n: number) => void): void {
    const n: number = this.length;
    // For gc efficiency, re-use a single object in the iterator.
    const value: ComplexObject = Object.seal(Object.defineProperties({}, {
      real: {writable: true}, imag: {writable: true},
    }));

    for (let i = 0; i < n; i++) {
      value.real = this.real[i];
      value.imag = this.imag[i];
      iterator(value, i, n);
    }
  }

  // In-place mapper.
  map(mapper: (value: ComplexObject, i: number, n: number) => void): this {
    this.forEach((value: ComplexObject, i: number, n: number) => {
      mapper(value, i, n);
      this.real[i] = value.real;
      this.imag[i] = value.imag;
    });

    return this;
  }

  magnitude() {
    const mags = new this.ArrayType(this.length);

    this.forEach((value, i) =>
      mags[i] = Math.sqrt(value.real*value.real + value.imag*value.imag));

    return mags;
  }
}
