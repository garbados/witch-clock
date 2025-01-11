export function comesafter (d1, d2) {
  return (d1.getTime() - d2.getTime()) > 0
}

export function comesbefore (d1, d2) {
  return (d1.getTime() - d2.getTime()) < 0
}

export function firstwhich (list, predicate) {
  // return first elem that passes predicate
  for (const elem of list) {
    if (predicate(elem)) return elem
  }
  // or null
  return null
}

export function lastwhich (list, predicate) {
  // access the list in reverse order
  // and return the first match
  for (const i of [...new Array(list.length + 1).keys()].slice(1)) {
    const elem = list[list.length - i]
    if (predicate(elem)) return elem
  }
  // or null
  return null
}
