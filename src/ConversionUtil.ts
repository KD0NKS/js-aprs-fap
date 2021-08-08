export class ConversionUtil {
    /**
     * Utility method to replace perl's Date-Calc check_date method.
     * Given the year, month, and day, this checks to see if it it's a valid date.
     *
     * @param {Number} year year for the date
     * @param {Number} month month for the date
     * @param {Number} day day for the date
     * @returns {boolean} Whether or not the given date is valid
     */
    static CheckDate(year: number, month: number, day: number): boolean {
        var d = new Date(year, month, day);

        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    }

    /**
     * Converts Degress to Radians
     * @param {number} deg
     * @returns {number} Degrees converted to Radians
     */
    static DegToRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Converts Radians to Degress
     * @param {number} rad
     * @returns {number} Radians converted to Degrees
     */
    static RadToDeg(rad: number): number {
        return rad * (180 / Math.PI);
    }

    /**
     * Converts Degrees Fahrenheit to Celsius
     * @param {number} degF Degrees in Fahrenheit
     * @returns {number} Degrees in Celsius
     */
    static FahrenheitToCelsius(degF: number): number {
        return (degF - 32) / 1.8;
    }
}