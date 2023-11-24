/** 获取 两指连成的直线移动后的 角度 */
export const calculateDegreeOfTouches = (initialTouches, currentTouches) => {
  let initialVector = vectorWithTouches(initialTouches);
  let currentVector = vectorWithTouches(currentTouches);
  return calculateDegreeOfVectors(initialVector, currentVector);
};

/** 获取 两指移动后与移动前相比 两指连线的倍数关系  */
export const calculateScaleOfTouches = (initialTouches, currentTouches) => {
  let initialDistance = calculateDistanceOfVector(
    vectorWithTouches(initialTouches)
  );
  let currentDistance = calculateDistanceOfVector(
    vectorWithTouches(currentTouches)
  );
  return currentDistance / initialDistance;
};

/** 根据 A点、初始触摸位置B点、当前触摸位置C点，计算AC/AB放大比例 */
export function calculateScaleWhenDragging(pointA, pointB, pointC) {
  const distanceAB = calculateDistance(pointA, pointB);
  const distanceAC = calculateDistance(pointA, pointC);
  const scale = distanceAC / distanceAB;
  return scale;
}

/** 计算向量AC与AB的夹角，并约定 顺时针为正，逆时针为负 */
export function calculateDegree(pointA, pointB, pointC) {
  // 计算向量AB和向量AC的坐标差
  const vectorAB = vectorWithPoints(pointA, pointB);
  const vectorAC = vectorWithPoints(pointA, pointC);
  return calculateDegreeOfVectors(vectorAB, vectorAC);
}

/** 根据两指坐标信息 获取两指向量 */
const vectorWithTouches = (touches) => {
  const a = touches[0];
  const b = touches[1];
  return vectorWithPoints(
    { x: a.pageX, y: a.pageY },
    { x: b.pageX, y: b.pageY }
  );
};

/** 计算两点之间的距离 */
function calculateDistance(pointA, pointB) {
  const vector = vectorWithPoints(pointA, pointB);
  return calculateDistanceOfVector(vector);
}

/** 计算向量的模长 即两点之间距离 */
function calculateDistanceOfVector({ x, y }) {
  // 使用勾股定理计算距离
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

/** 根据两点A、B 获取向量AB */
function vectorWithPoints(pointA, pointB) {
  return { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
}

/** 计算两个向量的夹角 */
function calculateDegreeOfVectors(vectorAB, vectorCD) {
  // 计算点积
  const dotProduct = vectorAB.x * vectorCD.x + vectorAB.y * vectorCD.y;
  // 计算向量的模长
  const lengthAB = Math.sqrt(vectorAB.x ** 2 + vectorAB.y ** 2);
  const lengthCD = Math.sqrt(vectorCD.x ** 2 + vectorCD.y ** 2);
  // 计算角度（以弧度为单位）
  const acos = Math.min(dotProduct / (lengthAB * lengthCD), 1);
  const angleRadians = Math.acos(acos);
  // console.log("angleRadians", angleRadians);
  // LOG  angleRadians 0.13306726200855712
  /** 计算2个向量的叉乘，代表 vectorAC与vectorAB的夹角的正负性。 eg. 叉乘结果为正数 代表夹角为逆时针 */
  let crossProduct = vectorAB.x * vectorCD.y - vectorAB.y * vectorCD.x;
  return (crossProduct > 0 ? 1 : -1) * angleRadians;
}
