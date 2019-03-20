function sin(radius) {
    return Math.sin(radius);
}

function cos(radius) {
    return Math.cos(radius);
}

function pointOffset(point, dx, dy) {
    return cc.p(point.x + dx, point.y + dy);
}

function pointRotateVector(vector, radius) {
    var x = vector.x * cos(radius) - vector.y * sin(radius);
    var y = vector.x * sin(radius) + vector.y * sin(radius);
    return cc.p(x, y);
}

function pointRotatePoint(targetPoint, originPoint, radius) {
    var tempVector = pointOffset(targetPoint, -originPoint.x, -originPoint.y);
    var rotatedVector = pointRotateVector(tempVector, radius);
    var newPoint = pointOffset(rotatedVector, originPoint.x, originPoint.y);
    return newPoint;
}