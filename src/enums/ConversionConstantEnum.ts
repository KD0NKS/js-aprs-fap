export enum ConversionConstantEnum {
    KNOT_TO_KMH = 1.852         // nautical miles per hour to kilometers per hour
    , MPH_TO_KMH = 1.609344     // miles per hour to kilometers per hour
    , KMH_TO_MS = 10 / 36       // kilometers per hour to meters per second
    , MPH_TO_MS = MPH_TO_KMH * KMH_TO_MS  // miles per hour to meters per second
    , HINCH_TO_MM = 0.254       // hundredths of an inch to millimeters
    , FEET_TO_METERS = 0.3048
}