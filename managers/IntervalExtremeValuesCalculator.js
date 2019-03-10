const omit = require('lodash').omit;

module.exports = class IntervalExtremeValuesCalculator {
    constructor() {
        this.keyBlacklist =["_id", "_name", "method", "bounding_box", "point","scraped", "date", "extra_data","geojson_coord"]
        this.keyList=["number_of_", "average"];
    }

    calculateIntervalsExtremeValues(results) {
        const intervalsObj = { options: {} };
        for (const data of results) {
            for (const key in data){
                if (this.allowedKey(key)){
                    if (intervalsObj.options[key]) {
                        intervalsObj.options[key].max = Math.max(intervalsObj.options[key].max, data[key]);
                        intervalsObj.options[key].min = Math.min(intervalsObj.options[key].min, data[key]);
                    } else {
                        intervalsObj.options[key] ={min:data[key], max:data[key]}
                    }
                }
            }
        }
        return intervalsObj;
    }

    allowedKey (key){
        for (const allowedKey of this.keyList){
            if (key.indexOf(allowedKey)>-1){
                return true;
            }
        }
        return false;
    }
}
