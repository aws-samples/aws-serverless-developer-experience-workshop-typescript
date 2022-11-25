
export class AWSEvent<T> {
    'detail': T;
    'detail_type': string;
    'resources': Array<string>;
    'id': string;
    'source': string;
    'time': Date;
    'region': string;
    'version': string;
    'account': string;

    static discriminator: string | undefined = undefined;

    static detail: string = "detail";

    static genericType: string = "T";

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": AWSEvent.detail,
            "baseName": AWSEvent.detail,
            "type": AWSEvent.genericType
        },
        {
            "name": "detail_type",
            "baseName": "detail-type",
            "type": "string"
        },
        {
            "name": "resources",
            "baseName": "resources",
            "type": "Array<string>"
        },
        {
            "name": "id",
            "baseName": "id",
            "type": "string"
        },
        {
            "name": "source",
            "baseName": "source",
            "type": "string"
        },
        {
            "name": "time",
            "baseName": "time",
            "type": "Date"
        },
        {
            "name": "region",
            "baseName": "region",
            "type": "string"
        },
        {
            "name": "version",
            "baseName": "version",
            "type": "string"
        },
        {
            "name": "account",
            "baseName": "account",
            "type": "string"
        }    ];

    public static getAttributeTypeMap() {
        return AWSEvent.attributeTypeMap;
    }

    public static updateAttributeTypeMapDetail(type: string) {
        var index = AWSEvent.attributeTypeMap.indexOf({name: AWSEvent.detail, baseName: AWSEvent.detail, type: AWSEvent.genericType});
        this.attributeTypeMap[index] = {name: AWSEvent.detail, baseName: AWSEvent.detail, type};
    }
}




