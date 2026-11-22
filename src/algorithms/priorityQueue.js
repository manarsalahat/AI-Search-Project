// Binary min-heap priority queue used by informed/cost-based search algorithms

export class PriorityQueue {
  constructor(comparator) {
    this._heap = [];
    this._compare = comparator;
  }

  isEmpty() {
    return this._heap.length === 0;
  }

  push(item) {
    this._heap.push(item);
    this._siftUp(this._heap.length - 1);
  }

  pop() {
    if (this._heap.length === 0) return undefined;
    const top = this._heap[0];
    const last = this._heap.pop();
    if (this._heap.length > 0) {
      this._heap[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  _siftUp(index) {
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this._compare(this._heap[index], this._heap[parent]) < 0) {
        [this._heap[index], this._heap[parent]] = [this._heap[parent], this._heap[index]];
        index = parent;
      } else {
        break;
      }
    }
  }

  _siftDown(index) {
    const length = this._heap.length;
    while (true) {
      const left = (index << 1) + 1;
      const right = left + 1;
      let smallest = index;
      if (left < length && this._compare(this._heap[left], this._heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this._compare(this._heap[right], this._heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest !== index) {
        [this._heap[index], this._heap[smallest]] = [this._heap[smallest], this._heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}
