// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Formats a date as a contract timestamp: `yyyy-MM-ddTHH:mm:ssZ`.
 *
 * The value is UTC, in whole seconds (the fraction `toISOString()` adds is dropped), with a literal `Z`.
 * Every value has the same width, so comparing the strings orders them by time.
 *
 * @param {Date} date - The instant to format.
 * @returns {string} The contract timestamp, for example `2026-11-21T02:42:30Z`.
 */
export const formatTimestamp = (date: Date): string =>
  date.toISOString().replace(/\.\d{3}Z$/, 'Z');

/**
 * The current instant as a contract timestamp.
 *
 * @returns {string} The contract timestamp.
 */
export const nowTimestamp = (): string => formatTimestamp(new Date());
