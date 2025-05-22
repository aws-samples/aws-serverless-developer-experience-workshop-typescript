// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
export class PublicationEvaluationCompleted {
  'evaluationResult': string;
  'propertyId': string;

  private static discriminator: string | undefined = undefined;

  private static attributeTypeMap: {
    name: string;
    baseName: string;
    type: string;
  }[] = [
    {
      name: 'evaluationResult',
      baseName: 'evaluation_result',
      type: 'string',
    },
    {
      name: 'propertyId',
      baseName: 'property_id',
      type: 'string',
    },
  ];

  public static getAttributeTypeMap() {
    return PublicationEvaluationCompleted.attributeTypeMap;
  }
}
