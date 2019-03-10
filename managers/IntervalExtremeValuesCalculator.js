const omit = require('lodash').omit;

module.exports = class IntervalExtremeValuesCalculator {
    constructor() {
        this.keyBlacklist =["_id", "_name", "method", "bounding_box", "point","scraped", "date", "extra_data","geojson_coord"]
    }

    calculateIntervalsExtremeValues(results) {
        const intervalsObj = { options: {} };
        for (const data of results) {
            for (const key in data){
                if (! this.ignoredKey(key)){
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

    ignoredKey (key){
        for (const blackListedKey of this.keyBlacklist){
            if (key.indexOf(blackListedKey)>-1){
                return true;
            }
        }
        return false;
    }
}
