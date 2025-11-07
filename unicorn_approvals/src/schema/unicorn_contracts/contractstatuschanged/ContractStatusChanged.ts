export class ContractStatusChanged {
  'contractId': string;
  'contractLastModifiedOn': string;
  'contractStatus': string;
  'propertyId': string;

  private static discriminator: string | undefined = undefined;

  private static attributeTypeMap: {
    name: string;
    baseName: string;
    type: string;
  }[] = [
    {
      name: 'contractId',
      baseName: 'contract_id',
      type: 'string',
    },
    {
      name: 'contractLastModifiedOn',
      baseName: 'contract_last_modified_on',
      type: 'string',
    },
    {
      name: 'contractStatus',
      baseName: 'contract_status',
      type: 'string',
    },
    {
      name: 'propertyId',
      baseName: 'property_id',
      type: 'string',
    },
  ];

  public static getAttributeTypeMap() {
    return ContractStatusChanged.attributeTypeMap;
  }
}
