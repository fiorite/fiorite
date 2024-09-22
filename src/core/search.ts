/** @source https://stackoverflow.com/questions/22697936/binary-search-in-javascript */
export function binarySearch(array: readonly number[], value: number) {
  let start = 0;
  let end = array.length - 1;

  while (start <= end) {
    let middle = Math.floor((start + end) / 2);

    if (array[middle] === value) {
      return middle;
    }

    if (value < array[middle]) {
      end = middle - 1;
    } else {
      start = middle + 1;
    }
  }
  return -1;
}

// /*
//  * Binary search in JavaScript.
//  * Returns the index of the element in a sorted array or (-n-1) where n is the insertion point for the new element.
//  * Parameters:
//  *     ar - A sorted array
//  *     el - An element to search for
//  *     compare_fn - A comparator function. The function takes two arguments: (a, b) and returns:
//  *        a negative number  if a is less than b;
//  *        0 if a is equal to b;
//  *        a positive number of a is greater than b.
//  * The array may contain duplicate elements. If there are more than one equal elements in the array,
//  * the returned value can be the index of any one of the equal elements.
//  *
//  * @source https://stackoverflow.com/questions/22697936/binary-search-in-javascript
//  */
// export function binarySearch(ar: number[], el: number) {
//   let m = 0;
//   let n = ar.length - 1;
//   while (m <= n) {
//     const k = (n + m) >> 1;
//     const cmp = el - ar[k];
//     if (cmp > 0) {
//       m = k + 1;
//     } else if(cmp < 0) {
//       n = k - 1;
//     } else {
//       return k;
//     }
//   }
//   return -m - 1;
// }
