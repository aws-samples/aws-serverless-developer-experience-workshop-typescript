export class PublicationEvaluationCompleted {
  "evaluationResult": string;
  "propertyId": string;

  private static discriminator: string | undefined = undefined;

  private static attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
  }> = [
    {
      name: "evaluationResult",
      baseName: "evaluation_result",
      type: "string",
    },
    {
      name: "propertyId",
      baseName: "property_id",
      type: "string",
    },
  ];

  public static getAttributeTypeMap() {
    return PublicationEvaluationCompleted.attributeTypeMap;
  }
}
