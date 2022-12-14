import { AbstractBuilderModel } from './AbstractBuilderModel'

/*
 * "compressed": 1 for compressed format
 * "ambiguity": Use amount (0..4) of position ambiguity. Note that position ambiguity and compression can't be used at the same time.
 * "dao": Use !DAO! extension for improved precision
 */
export class BuildPositionModel extends AbstractBuilderModel {
    /**
     * True to signal messaging capability, 0 for no messaging capability (default)
     */
    public isMessagingEnabled = false

    constructor(options?: any) {
        if(options && options != null) {
            super(options)

            if(options["isMessagingEnabled"] && options["isMessagingEnabled"] != null && this.isBoolean(options["isMessagingEnabled"])) {
                this.isMessagingEnabled = options["isMessagingEnabled"]
            }
        } else {
            super()
        }
    }
}