export class Util
{
    static deepEquals(val1:any, val2:any):boolean {
        if (typeof(val1) != typeof(val2)) return false;

        if (val1 === val2) return true;
        if ((val1 === null) != (val2 === null)) return false;

        if (typeof(val1) == "object"){
            let keys:any = {};
            for (let k in val1) keys[k] = true;
            for (let k in val2) keys[k] = true;

            for (let k in keys){
                if (!Util.deepEquals(val1[k], val2[k])) return false;
            }
            return true;
        }

        return false;
    }

    static deepJsonCopy(val:any):any {
        return JSON.parse(JSON.stringify(val));
    }
}