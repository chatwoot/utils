import { convertSecondsToTimeUnit } from "../src/helpers"

describe("#convertSecondsToTimeUnit", () => {
    it("it should return { time:  1, unit: 'm' } if  60 seconds passed", () => {
        expect(convertSecondsToTimeUnit(60, { minute: 'm', hour: 'h', day: 'd' })).toEqual({ time:  1, unit: 'm' });
    });
    it("it should return { time:  1, unit: 'Minutes' } if  60 seconds passed", () => {
        expect(convertSecondsToTimeUnit(60, { minute: 'Minutes', hour: 'Hours', day: 'Days' })).toEqual({ time:  1, unit: 'Minutes' });
    });

});
