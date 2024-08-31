const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const updateData = async (arr, setData) => {
  setData([...arr]);
  await delay(10);
};

export const algorithms = {
  bubbleSort: async (arr, setData) => {
    let newArr = [...arr];
    for (let i = 0; i < newArr.length; i++) {
      for (let j = 0; j < newArr.length - i - 1; j++) {
        if (newArr[j] > newArr[j + 1]) {
          [newArr[j], newArr[j + 1]] = [newArr[j + 1], newArr[j]];
          await updateData(newArr, setData);
        }
      }
    }
  },

  mergeSort: async (arr, setData) => {
    const merge = async (arr, start, mid, end) => {
      let left = arr.slice(start, mid + 1);
      let right = arr.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;

      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        k++;
        await updateData([...arr], setData);
      }

      while (i < left.length) {
        arr[k] = left[i];
        i++;
        k++;
        await updateData([...arr], setData);
      }

      while (j < right.length) {
        arr[k] = right[j];
        j++;
        k++;
        await updateData([...arr], setData);
      }
    };

    const mergeSortRecursive = async (arr, start, end) => {
      if (start < end) {
        const mid = Math.floor((start + end) / 2);
        await mergeSortRecursive(arr, start, mid);
        await mergeSortRecursive(arr, mid + 1, end);
        await merge(arr, start, mid, end);
      }
    };

    let newArr = [...arr];
    await mergeSortRecursive(newArr, 0, newArr.length - 1);
  },

  cocktailShakerSort: async (arr, setData) => {
    let newArr = [...arr];
    let swapped = true;
    let start = 0;
    let end = newArr.length - 1;

    while (swapped) {
      swapped = false;

      for (let i = start; i < end; i++) {
        if (newArr[i] > newArr[i + 1]) {
          [newArr[i], newArr[i + 1]] = [newArr[i + 1], newArr[i]];
          swapped = true;
          await updateData(newArr, setData);
        }
      }

      if (!swapped) break;

      swapped = false;
      end--;

      for (let i = end - 1; i >= start; i--) {
        if (newArr[i] > newArr[i + 1]) {
          [newArr[i], newArr[i + 1]] = [newArr[i + 1], newArr[i]];
          swapped = true;
          await updateData(newArr, setData);
        }
      }

      start++;
    }
  },

  selectionSort: async (arr, setData) => {
    let newArr = [...arr];
    for (let i = 0; i < newArr.length; i++) {
      let minIdx = i;
      for (let j = i + 1; j < newArr.length; j++) {
        if (newArr[j] < newArr[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        [newArr[i], newArr[minIdx]] = [newArr[minIdx], newArr[i]];
        await updateData(newArr, setData);
      }
    }
  },

  quickSort: async (arr, setData) => {
    const partition = async (arr, low, high) => {
      const pivot = arr[high];
      let i = low - 1;
      for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          await updateData(arr, setData);
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      await updateData(arr, setData);
      return i + 1;
    };

    const quickSortRecursive = async (arr, low, high) => {
      if (low < high) {
        const pi = await partition(arr, low, high);
        await quickSortRecursive(arr, low, pi - 1);
        await quickSortRecursive(arr, pi + 1, high);
      }
    };

    await quickSortRecursive(arr, 0, arr.length - 1);
  },

  insertionSort: async (arr, setData) => {
    let newArr = [...arr];
    for (let i = 1; i < newArr.length; i++) {
      let key = newArr[i];
      let j = i - 1;
      while (j >= 0 && newArr[j] > key) {
        newArr[j + 1] = newArr[j];
        j--;
        await updateData(newArr, setData);
      }
      newArr[j + 1] = key;
      await updateData(newArr, setData);
    }
  },

  heapSort: async (arr, setData) => {
    const heapify = async (arr, n, i) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && arr[left] > arr[largest]) largest = left;
      if (right < n && arr[right] > arr[largest]) largest = right;

      if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        await updateData(arr, setData);
        await heapify(arr, n, largest);
      }
    };

    let newArr = [...arr];
    const n = newArr.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await heapify(newArr, n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      [newArr[0], newArr[i]] = [newArr[i], newArr[0]];
      await updateData(newArr, setData);
      await heapify(newArr, i, 0);
    }
  },

  bogoSort: async (arr, setData) => {
    const isSorted = (arr) => {
      for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) return false;
      }
      return true;
    };

    const shuffle = async (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      await updateData(arr, setData);
    };

    let newArr = [...arr];
    while (!isSorted(newArr)) {
      await shuffle(newArr);
    }
  },

  radixSort: async (arr, setData) => {
    const getMax = (arr) => {
      let max = arr[0];
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
      }
      return max;
    };

    const countingSort = async (arr, exp) => {
      let output = new Array(arr.length).fill(0);
      let count = new Array(10).fill(0);

      for (let i = 0; i < arr.length; i++) {
        count[Math.floor(arr[i] / exp) % 10]++;
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
      }

      for (let i = arr.length - 1; i >= 0; i--) {
        output[count[Math.floor(arr[i] / exp) % 10] - 1] = arr[i];
        count[Math.floor(arr[i] / exp) % 10]--;
      }

      for (let i = 0; i < arr.length; i++) {
        arr[i] = output[i];
        await updateData([...arr], setData);
      }
    };

    let newArr = [...arr];
    let max = getMax(newArr);

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      await countingSort(newArr, exp);
    }
  },

  combSort: async (arr, setData) => {
    const getNextGap = (gap) => {
      gap = Math.floor(gap / 1.3);
      if (gap < 1) return 1;
      return gap;
    };

    let newArr = [...arr];
    let gap = newArr.length;
    let swapped = true;

    while (gap !== 1 || swapped) {
      gap = getNextGap(gap);
      swapped = false;

      for (let i = 0; i < newArr.length - gap; i++) {
        if (newArr[i] > newArr[i + gap]) {
          [newArr[i], newArr[i + gap]] = [newArr[i + gap], newArr[i]];
          swapped = true;
          await updateData([...newArr], setData);
        }
      }
    }
  },

  shellSort: async (arr, setData) => {
    let newArr = [...arr];
    let n = newArr.length;

    // Start with a big gap, then reduce the gap
    for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
      // Do a gapped insertion sort for this gap size.
      // The first gap elements a[0..gap-1] are already in gapped order
      // keep adding one more element until the entire array is gap sorted
      for (let i = gap; i < n; i += 1) {
        // add a[i] to the elements that have been gap sorted
        // save a[i] in temp and make a hole at position i
        let temp = newArr[i];

        // shift earlier gap-sorted elements up until the correct location for a[i] is found
        let j;
        for (j = i; j >= gap && newArr[j - gap] > temp; j -= gap) {
          newArr[j] = newArr[j - gap];
          await updateData([...newArr], setData);
        }

        // put temp (the original a[i]) in its correct location
        newArr[j] = temp;
        await updateData([...newArr], setData);
      }
    }
  },

  bucketSort: async (arr, setData) => {
    const bucketSize = 10;
    let newArr = [...arr];
    
    if (newArr.length === 0) {
      return newArr;
    }

    // Determine minimum and maximum values
    let minValue = Math.min(...newArr);
    let maxValue = Math.max(...newArr);

    // Initialize buckets
    const bucketCount = Math.floor((maxValue - minValue) / bucketSize) + 1;
    const buckets = new Array(bucketCount).fill().map(() => []);

    // Distribute input array values into buckets
    for (let i = 0; i < newArr.length; i++) {
      const bucketIndex = Math.floor((newArr[i] - minValue) / bucketSize);
      buckets[bucketIndex].push(newArr[i]);
      
      // Visualize the bucketing process
      let visualArr = [];
      for (let j = 0; j < buckets.length; j++) {
        visualArr = visualArr.concat(buckets[j]);
      }
      while (visualArr.length < newArr.length) {
        visualArr.push(0); // Fill with zeros to maintain array size
      }
      await updateData(visualArr, setData);
    }

    // Sort buckets and place back into input array
    let currentIndex = 0;
    for (let i = 0; i < buckets.length; i++) {
      insertionSort(buckets[i]);
      for (let j = 0; j < buckets[i].length; j++) {
        newArr[currentIndex++] = buckets[i][j];
        await updateData([...newArr], setData);
      }
    }

    // Helper function for sorting individual buckets
    function insertionSort(arr) {
      const len = arr.length;
      for (let i = 1; i < len; i++) {
        let current = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > current) {
          arr[j + 1] = arr[j];
          j--;
        }
        arr[j + 1] = current;
      }
      return arr;
    }
  }
};