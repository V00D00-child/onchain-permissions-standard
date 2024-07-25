# ERC-7715 Implementation Notes

This repository is now trying to represent ERC-7715 to closely resemble the changes proposed [in this change](https://github.com/ilikesymmetry/ERCs/pull/1/files#diff-30a722e02b85e6e33ea9d633379985173e9a669ffffdbba3662e28c0ec8adbe7).

The version of ERC-7715 that this repository implements has some differences from ERC-7715 as defined at time of writing this document, and includes some features that are not defined in 7715, but that I believe to be useful for the long term health of the standard. Most of the changes have been implemented in non-breaking ways, but some changes make this implementation incompatible with 7715.

## Blockers / Breaking Changes

### Expiry is a policy and shouldn't be requestor-defined

It doesn't make any sense for the requestor to define how long the permissions they request should be valid for. In fact, I think it's dubious that the permissions request need a `policies` array at all: While well behaved sites can encourage good permission-approval hygiene by requesting only what they require, all the safety of a permissions approval flow comes from a user's ability to review and even amend permissions before they're approved.

For this reason, while having an expiration time as a default on any granted permissions makes sense, this doesn't make sense as a required request parameter: The user may have their own default permission timer that overrides this number, a bad actor will always request the longest timeout (and so this value should be ignored anyways), and the concept of an expiry already fits well within the already-existent concept of a `policy`.

## Non Blocking

### String Based Permission Types

Currently, ERC-7715 uses strings to define the type of requested permissions. This ensures that signers and requestors are bound to identifying permissions only by this string, and are unable to add additional specificity later on in the development of this specification.

Instead, I recommend we define the `type` field as an object of the form:

```typescript
type TypeDescriptor = {
  name: string,
  [otherKey: string]?: string,
}
```

This gives us room for signers to support additional specifiers later on, so that requestors can then optionally add those specifiers to their request, to ensure optimal compatibility.

Some examples of additional keys that might be added later on:
- semVer version identifier (Like `>=0.1.17`)
- Other ERCs this interface complies to (`number[]`)
- Expected type interface.

On the upside, it's easy to detect between a string and an object, so this doesn't have to be a blocking concern, since it's easy to evolve a signer towards this. I will implement our initial version to support either.

### Single Global Permissions Recipient

Requesting a single signer globally means that in the case where the requestor is requesting permissions across multiple chains (where they might have different session accounts available on each chain), they are unable to specify a different account to receive each permission. This makes multichain permissions significantly more brittle.

One way we can support this interface while also supporting our desired long-term interface would be to support EITHER a global single `signer`, OR a `signer` per requested permission object. Under the hood, our implementation could convert the global signer to a signer for each permission, ensuring our approach is maximally multi-chain long term.

### Support for a Justification Field

A somewhat newer trend in permissions requests is to allow the requestor to provide a justification for permissions requested. There is a natural security concern with allowing an untrusted party to provide input to be presented to the user within a trusted interface, but given that it is represented in an adequate security frame, I believe it can streamline an experience that is already inalienable from a site: The ability to provide context around its own permission requests. You can witness the inalienability of this right in a variety of applications today, in which they present a fake in-app permissions prompt before initiating the system prompt, so that they can present the justification in their own terms, before handing over to what is otherwise an application-hostile permissions prompt.

In my implementation, I am keeping the `justification` field as optional.

### Required boolean can be optional

A reasonable default (required: true) can obviate the vast majority of uses of this option. I'm including it as optional in our implementation.

### Data fields can be optional

Not all permissions or policies may require data payloads, so I'm leaving those fields as optional for now.
