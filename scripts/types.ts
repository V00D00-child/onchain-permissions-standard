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
  data: z.record(z.any()),
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
  data: z.record(z.any()).optional(),
});

export const Policy = z.infer<typeof zPolicy>;

export const zAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const zPermissionRequest = z.object({
  chainId: z.number(),
  account: zAddress.optional(),
  expiry: z.number().optional(),
  signer: zSigner.optional(),

  permission: z.object({
    type: zTypeDescriptor,
    data: z.record(z.any()).optional(),
  }),

  policies: z.array(zPolicy).optional(),
  required: z.boolean().default(true),

  // Signer is not part of ERC-7715, but gives us better multichain support when available.
  justification: z.string().optional(),
});

export const PermissionRequest = z.infer<typeof zPermissionRequest>;

export const zPermissionsRequest = z.array(zPermissionRequest);

export const PermissionsRequest = z.infer<typeof zPermissionsRequest>;

const zUpgradeOp = z.object({
  target: zSigner,
  operation: z.string(),
});

export const zGrantedPermission = z.object({
  context: z.string(),
  accountMeta: z.object({
    factory: z.string().startsWith('0x'),
    factoryData: z.string().startsWith('0x'),
    upgradeOps: z.array(zUpgradeOp).optional(),
  }).optional(),
  signerMeta: z.object({
    // userOpBuilder: z.string().startsWith('0x').optional(), // Excluded for reasons mentioned in 7715-issues.md
    delegationManager: z.string().startsWith('0x').optional(),  
  }),
 
  // Not part of the standard yet, but could be nice to include:
  permission: zPermissionRequest.optional(),
});

export const GrantedPermission = z.infer<typeof zGrantedPermission>;

export const zGrantedPermissionsResponse = z.array(zGrantedPermission);

export const GrantedPermissionsResponse = z.infer<typeof zGrantedPermissionsResponse>;

