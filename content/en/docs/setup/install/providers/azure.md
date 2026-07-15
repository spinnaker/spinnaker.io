---

title:  "Azure"
description: 
aliases: 
  - /setup/providers/azure/
---



In [Azure](https://azure.microsoft.com/), an
[Account](/docs/concepts/providers/#accounts) maps to a credential able to
authenticate against a given [Azure subscription](https://azure.microsoft.com/free/).

## Prerequisites

You need a [Service Principal](https://docs.microsoft.com/cli/azure/create-an-azure-service-principal-azure-cli)
to authenticate with Azure and a [Key Vault](https://azure.microsoft.com/services/key-vault/)
to store a default username/ssh public key for deployed [VM Scale Sets](https://docs.microsoft.com/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-overview).
The next steps assume the use of the [Azure CLI 2.0](https://docs.microsoft.com/cli/azure/install-azure-cli).
The example commands will set environment variables along the way for use when
creating an account in the final stage. You can check that you have `az` installed by running:

```bash
az --version
```

First, log in and set your subscription:

```bash
az login
az account list
SUBSCRIPTION_ID=<Insert Subscription ID>
az account set --subscription $SUBSCRIPTION_ID
```

Next, create a Service Principal (where the name is unique in your subscription) and set environment variables based on the output:

```bash
az ad sp create-for-rbac --name "Spinnaker" --role contributor --scopes /subscriptions/${SUBSCRIPTION_ID}
APP_ID=<Insert App Id>
TENANT_ID=<Insert Tenant Id>
```

> NOTE: You will need the App Key (also called password) when creating an account, but you will be prompted on standard input for that since it is sensitive data.

Next, create a resource group for your Key Vault. Make sure to specify a location (e.g. westus) available in your account:

```bash
az account list-locations --query [].name
RESOURCE_GROUP="Spinnaker"
az group create --name $RESOURCE_GROUP --location <Insert Location>
```

Finally, create a Key Vault (where the vault name is globally unique) and add a default username/ssh public key. This credential is used to provision all Azure VM scale sets by default. You can log on to VM instances in VM scale sets with this credential.

```bash
VAULT_NAME=<Insert Vault Name>
az keyvault create --enabled-for-template-deployment true --resource-group $RESOURCE_GROUP --name $VAULT_NAME
az keyvault set-policy --secret-permissions get --name $VAULT_NAME --spn $APP_ID
az keyvault secret set --name VMUsername --vault-name $VAULT_NAME --value <Insert default username>
az keyvault secret set --name VMSshPublicKey --vault-name $VAULT_NAME --value <Insert default SSH public key>
```

If you prefer to use password instead of SSH public key, then replace
```bash
az keyvault secret set --name VMSshPublicKey --vault-name $VAULT_NAME --value <Insert default SSH public key>
```
with
```bash
az keyvault secret set --name VMPassword --vault-name $VAULT_NAME --value <Insert default password>
```
Follow the Azure VM username and password rules documented [here](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/faq#what-are-the-username-requirements-when-creating-a-vm).

## Adding an account

Enable azure and add the azure account to `clouddriver-local.yml`
```yaml
azure:
  enabled: true
  accounts:
    - name: my-azure-account
      clientId: replaceMeWithAppId
      tenant-id: replaceMeWithTenantId
      subscriptionId: replaceMeWithSubscriptId
      defaultKeyValue: replaceMeWithVaultName
      defaultResourceGroup: replaceMeWithResourceGroup
      packerResourceGroup: replaceMeWithResourceGroup
      useSshPublicKey: true
      appKey: 
      regions:
      - regionname

```

> NOTE:
> 1. You will be prompted for the App Key on standard input. If necessary,
you can generate a new key: `az ad sp credential reset --name $APP_ID`
> 2. SSH public key will be used to provision VM scale set by default. If you prefer to use password, change the flag for this as so:
`useSshPublicKey: false`.  Secret values of either the SSH public key or password are stored in the Azure key vault specified by the property `defaultKeyVault`, in which the stored secret names are called "VMPassword" and "VMSshPublicKey", separately.
> 3. The Azure regions used by default are "eastus" and "westus". If you would like to add custom regions, adjust the property\
`regions` per the above

## Advanced account settings
For a full list of account properties, see the [AzureConfigurationProperties](https://github.com/spinnaker/spinnaker/blob/main/clouddriver/clouddriver-azure/src/main/groovy/com/netflix/spinnaker/clouddriver/azure/config/AzureConfigurationProperties.groovy) class.

## Next steps

Optionally, you can [set up another cloud provider](/docs/setup/install/providers/) or
continue the [installation instructions](/docs/setup/install/)
