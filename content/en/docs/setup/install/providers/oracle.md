---

title:  "Oracle"
sidebar:
  nav: setup
aliases: 
  - /setup/providers/oracle/
---


In [Oracle Cloud](https://cloud.oracle.com/), a Spinnaker
[Account](/docs/concepts/providers/#accounts) maps to an [Oracle Cloud Infrastructure user]( https://cloud.oracle.com/en_US/tryit).

## Prerequisites

You will need the following to enable Oracle Cloud provider in Spinnaker:
- A user in IAM for the person or system who will be using Spinnaker, and put that user in at 
least one IAM group with any desired permissions. 
See [Adding Users](https://docs.cloud.oracle.com/iaas/Content/GSG/Tasks/addingusers.htm#one). 
- The user's home region. 
See [Managing Regions](https://docs.cloud.oracle.com/iaas/Content/Identity/Tasks/managingregions.htm). 
(e.g. `--region us-ashburn-1`)
- RSA key pair in PEM format (minimum 2048 bits).
See [How to Generate an API Signing Key](https://docs.cloud.oracle.com/iaas/Content/API/Concepts/apisigningkey.htm#How). 
(e.g. `--ssh-private-key-file-path /home/ubuntu/.oci/myPrivateKey.pem`)
- Fingerprint of the public key. 
See [How to Get the Fingerprint of the Key](https://docs.cloud.oracle.com/iaas/Content/API/Concepts/apisigningkey.htm#How3). 
(e.g. `--fingerprint 11:22:33:..:aa`)
- Tenancy's OCID and user's OCID.
See [Where to Get the Tenancy and User OCIDs](https://docs.cloud.oracle.com/iaas/Content/API/Concepts/apisigningkey.htm#Other). 
(e.g. `--tenancyId ocid1.tenancy.oc1..aa... --user-id ocid1.user.oc1..aa...`)
- Compartment OCID: On Oracle Cloud Console, open the navigation menu. Under Governance and Administration, go to Identity and click Compartments. 
See [Managing Compartments](https://docs.cloud.oracle.com/iaas/Content/Identity/Tasks/managingcompartments.htm). 
(e.g. `--compartment-id ocid1.compartment.oc1..aa...`)
- Upload the public key from the key pair in the Console. 
See [How to Upload the Public Key](https://docs.cloud.oracle.com/iaas/Content/API/Concepts/apisigningkey.htm#How2). 

## Add an Oracle Cloud account

1. Enable the Oracle Cloud provider and add the account

```yaml
oracle:
  enabled: true
  accounts:
  - name: my-oci-acct
    compartment-id: ocid1.compartment.oc1..aaaaaaaatjuwhxwkspkxhumqke4o73b2b
    fingerprint: 8f:05:f4:94:f3:5f:e3:30:ec:35 
    region: us-phoenix-1
    ssh-private-key-file-path: /mnt/secrets/oci_api_key.pem
    tenancyId: ocid1.tenancy.oc1..aaaaaaaa225wmphohi3iiyxxxjruo
    userId: ocid1.user.oc1..aaaaaaaagosdr3zsh67tvgpnmw42ywqc 
```

## Next steps
Optionally, you can [set up another cloud provider](/docs/setup/install/providers/) or
continue the [installation instructions](/docs/setup/install/)

