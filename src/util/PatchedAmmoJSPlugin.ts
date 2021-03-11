import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math";
import { VertexBuffer } from "@babylonjs/core/Meshes/buffer";
import { IPhysicsEnabledObject } from "@babylonjs/core/Physics/physicsImpostor";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";

export function patchedAmmoJSPlugin(){
    // This is a patched version of the _addMeshVerts function in BabylonJS
    // As such it is under the original license, Apache 2.0
    function _addMeshVerts(this:any, btTriangleMesh: any, topLevelObject: IPhysicsEnabledObject, object: IPhysicsEnabledObject) {
        var triangleCount = 0;
        if (object && object.getIndices && object.getWorldMatrix && object.getChildMeshes) {
            var indices = object.getIndices();
            if (!indices) {
                indices = [];
            }
            var vertexPositions = object.getVerticesData(VertexBuffer.PositionKind);
            if (!vertexPositions) {
                vertexPositions = [];
            }

            const oldPos = topLevelObject.position;
            const oldRot = topLevelObject.rotationQuaternion;

            topLevelObject.position = new Vector3(0,0,0);
            topLevelObject.rotationQuaternion = new Quaternion();

            topLevelObject.computeWorldMatrix(false);
            object.computeWorldMatrix(false);
            const newMat = object.getWorldMatrix().clone();

            topLevelObject.position = oldPos;
            topLevelObject.rotationQuaternion = oldRot;

            var faceCount = indices.length / 3;
            for (var i = 0; i < faceCount; i++) {
                var triPoints = [];
                for (var point = 0; point < 3; point++) {
                    var v = new Vector3(vertexPositions[(indices[(i * 3) + point] * 3) + 0], vertexPositions[(indices[(i * 3) + point] * 3) + 1], vertexPositions[(indices[(i * 3) + point] * 3) + 2]);

                    // Adjust for initial scaling
                    v = Vector3.TransformCoordinates(v, newMat);

                    var vec: any;
                    if (point == 0) {
                        vec = this._tmpAmmoVectorA;
                    } else if (point == 1) {
                        vec = this._tmpAmmoVectorB;
                    } else {
                        vec = this._tmpAmmoVectorC;
                    }
                    vec.setValue(v.x, v.y, v.z);

                    triPoints.push(vec);
                }
                btTriangleMesh.addTriangle(triPoints[0], triPoints[1], triPoints[2]);
                triangleCount++;
            }

            object.getChildMeshes().forEach((m) => {
                triangleCount += this._addMeshVerts(btTriangleMesh, topLevelObject, m);
            });
        }
        return triangleCount;
    }

    const ret = new AmmoJSPlugin();
    (ret as any)._addMeshVerts = _addMeshVerts.bind(ret);

    return ret;
}