function isSuperset(set, subset) {
    set = new Set(set.map(e => e.toString()))
    for (var elem of subset) {
        if (!set.has(elem.toString())) {
            return false;
        }
    }
    return true;
}

function union(setA, setB) {
    var _union = new Set(setA);
    for (var elem of setB) {
        _union.add(elem);
    }
    return _union;
}

function intersection(setA, setB) {
    var _intersection = new Set();
    for (var elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

function difference(setA, setB) {
    var _difference = new Set(setA);
    for (var elem of setB) {
        _difference.delete(elem);
    }
    return _difference;
}

module.exports = {isSuperset, union, intersection, difference}