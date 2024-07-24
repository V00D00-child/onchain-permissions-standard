/* Onchain Permissions Standard Types
 *
 * This file is intended to define the types involved in the Onchain Permission Standard.
 * The types are defined as zod types, which can both export Typescript types, and be used as type validators.
 *
 * The zod types are prefixed with z, and the types are also exported.
 */

import { z } from 'zod';

export const zSigner = z.object({
  // Despite the 7715 support for 'key' type,
  // We're only supporting 'address' so that granted permissions
  // can enforce sophisticated policies that do not fit within 4337's constraints.
  type: z.enum(['address']),
  data: z.any(),
});

export type Signer = z.infer<typeof zSigner>;

// Rather than only define permissions by name,
// Requestors can optionally make this an object and leave room for forward-extensibility.
export const zTypeDescriptor = z.union([
  z.string(),
  z.object({
    name: z.string(),
    description: z.string().optional(),
  })
]);

export const zPolicy = z.object({
  type: zTypeDescriptor,
  data: z.any().optional(),
});

export const Policy = z.infer<typeof zPolicy>;

export const zPermission = z.object({
  type: zTypeDescriptor,
  policies: z.array(zPolicy),
  required: z.boolean().default(true),

  // Data is specific to this `type`, and will be interpreted by the permission's provider
  data: z
    .any()
    .optional(),

  // Signer is not part of ERC-7715, but gives us better multichain support when available.
  signer: zSigner.optional(),
  justification: z.string().optional(),

});

export const Permission = z.infer<typeof zPermission>;

export const zPermissionsRequest = z.object({
  // account: z.string().optional(), // Excluded for reasons mentioned in 7715-issues.md
  // chainId: z.number().optional(), // Excluded for reasons mentioned in 7715-issues.md

  signer: zSigner.optional(), // Discouraged in favor of per-permission signer specification.

  permissions: z.array(zPermission),

  // expiry: z.number(), // Excluded for reasons mentioned in 7715-issues.md
});

export const PermissionsRequest = z.infer<typeof zPermissionsRequest>;

const zUpgradeOp = z.object({
  target: zSigner,
  operation: z.string(),
});

export const zGrantedPermission = z.object({
  sessionAccount: zSigner,
  type: zTypeDescriptor,
  signerMeta: z.object({
    // userOpBuilder: z.string().startsWith('0x').optional(), // Excluded for reasons mentioned in 7715-issues.md
    delegationManager: z.string().startsWith('0x').optional(),  
  }),
  permissionsContext: z.string(),
  accountMeta: z.object({
    factory: z.string().startsWith('0x'),
    factoryData: z.string().startsWith('0x'),
    upgradeOps: z.array(zUpgradeOp).optional(),
  }).optional(),
});

export const GrantedPermission = z.infer<typeof zGrantedPermission>;

export const zGrantedPermissionsResponse = z.object({
  grantedPermissions: z.array(zGrantedPermission),
  expiry: z.number(),
});

export const GrantedPermissionsResponse = z.infer<typeof zGrantedPermissionsResponse>;

