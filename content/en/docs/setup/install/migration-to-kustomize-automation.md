---
title: Migrating from Operator/Halyard to Kustomize Deployment
linkTitle: Migrating from Operator/Halyard to Kustomize Deployment
aliases: []
description: >
  Learn how to migrate to Kustomize Deployment automatically.  Mirrored from the armory
  docs https://docs.armory.io/continuous-deployment/spinnaker-user-guides/armory-operator-to-kustomize-migration/
---

## Migrating to a Kustomize Deployment
> Thank you to harness spinnaker team for the script and automation to enable migration to kustomize easily.  This
> is a mirror from their [documentation on migration off of operator](https://docs.armory.io/continuous-deployment/spinnaker-user-guides/armory-operator-to-kustomize-migration/)
> and though operator specific in many aspects, this should work just as well for halyard deployments

### Introduction

This document provides step-by-step instructions for migrating your Spinnaker installation from using the Armory Operator
deployment method OR a halyard deployment to a native Kubernetes deployment using Kustomize. This approach gives you
more direct control over your Spinnaker resources and removes the dependency on halyard 

{{% alert color="warning" title="Important" %}}
Please thoroughly test this migration in a non-production environment before deploying to production.
{{% /alert %}}


#### Prerequisites

- Kubectl command-line tool installed and configured to access your cluster
- Basic understanding of Kubernetes resources (deployments, services, configmaps)
- Access to the current Spinnaker namespace

#### Migration Process Overview

1. Download current configuration files and Kubernetes resources
2. Set up Kustomize structure for native deployment
3. Remove Operator ownership from services (Only for operator changes)
4. Scale down the Operator
5. Deploy using Kustomize
6. Validate the deployment
7. Remove Operator and CRDs (after confirming stability)

##### Step 1: Download Current Configuration

The script provided below will download:
- All configuration files located in /opt/spinnaker/config from each service
- All deployment, service, and statefulset YAML files for each service


###### How to Use the Download Script

1. Save the script at the bottom of this document to a file named `download_spinnaker_configs.sh`
2. Make the script executable:
   `chmod +x download_spinnaker_configs.sh`
3. Run the script with your Spinnaker namespace:
   `./download_spinnaker_configs.sh your-spinnaker-namespace`
4. The script will create an operator-migration directory containing all needed files

###### What Gets Downloaded

- **Deployments:** YAML files for each service deployment
- **Services:** YAML files for all Spinnaker services
- **StatefulSets:** YAML files for any statefulsets (like front50)
- **Configuration Files:** All files from /opt/spinnaker/config in each pod

WARNING:  THIS WILL download any secrets that are NOT using an encrypted secret.  USE CAUTION.  It's recommend to
move secrets to a [valid secret engine](https://spinnaker.io/docs/reference/secrets/) as part of any spinnaker deployment.

##### Step 2: Set Up Kustomize Structure

Create a Kustomize directory structure for your Spinnaker deployment:
1. Move the downloaded deployments and services to their respective directories
2. Create configmaps from the downloaded configuration files
3. Set up the kustomization.yaml files

{{% alert color="warning" title="Tip" %}}
You can use the GitHub - https://github.com/spinnaker/spinnaker/tree/main/spinnaker-kustomize repo as a reference for Kustomize structure
{{% /alert %}}

##### Step 3: Remove Operator Ownership from Services

This step detaches the Operator's control while keeping services running.  ONLY for operator deploys.  Halyard deployments
should not need to execute this step.

1. Identify resources owned by the Operator:
   `kubectl get all -n your-spinnaker-namespace -o json | jq '.items[] | select(.metadata.ownerReferences[]? | .apiVersion=="spinnaker.io/v1alpha2" and .kind=="SpinnakerService") | {name: .metadata.name, kind: .kind}'`
2. Remove ownership references using patch commands:
   `kubectl patch deployment spin-deck -n your-spinnaker-namespace --type json -p='[{"op": "remove", "path": "/metadata/ownerReferences"}]'`
3. Repeat for all resources with Operator ownership
   {{% alert color="warning" title="Note" %}}
   This breaks the connection between the Operator and services but keeps everything running
   {{% /alert %}}

##### Step 4: Verify Ownership Removal
ONLY for operator deployments.  Confirm that no resources are still owned by the Operator:
`kubectl get all -n your-spinnaker-namespace -o json | jq '.items[] | select(.metadata.ownerReferences[]? | .apiVersion=="spinnaker.io/v1alpha2" and .kind=="SpinnakerService") | {name: .metadata.name, kind: .kind}'`
The command should return empty if all ownership references have been removed.

##### Step 5: Extra Precautions Before Deployment
Compare current resources with your Kustomize configurations:
`kubectl diff -f <(kustomize build ./overlays/prod)`

Review the differences carefully. Look for:
- Immutable field changes (might require special handling)
- Configuration changes that could affect service behavior
- Missing resources that should be included

###### Perform a Dry Run

Test your deployment without actually applying changes:
`kubectl apply --dry-run=client -f <(kustomize build ./overlays/prod)`

##### Step 6: Scale Down the Operator (only on operator deploys)
Prevent the Operator from interfering with your deployment:
`kubectl scale deployment spinnaker-operator -n your-spinnaker-namespace --replicas=0`

##### Step 7: Deploy Using Kustomize

Apply your Kustomize configurations:

`kubectl apply -f <(kustomize build ./overlays/prod)`

##### Step 8: Validate and Monitor
1. Check that all pods are running:
   `kubectl get pods -n your-spinnaker-namespace`
2. Verify Spinnaker services are accessible:
    - Access the Spinnaker UI
    - Test a simple pipeline
    - Check integrations are working
3. Monitor the environment for stability over the next few days

##### Step 9: Remove Operator and CRDs

Once stability is confirmed (at least 24 hours later):
1. Remove the Operator CRDs:
   `kubectl delete crd spinnakerservices.spinnaker.io`
2. Remove the Operator deployment if still present:
   `kubectl delete deployment spinnaker-operator -n your-spinnaker-namespace`

##### Rollback Plan
If issues arise during migration:
1. Scale up the Operator:
   `kubectl scale deployment spinnaker-operator -n your-spinnaker-namespace --replicas=1`
2. Reapply the previous SpinnakerService resource:
   `kubectl apply -f original-spinnakerservice.yaml`
3. Allow the Operator to reconcile and restore the previous state

#### Download Script
```bash 
#!/bin/bash

# Script to download ONLY files from /opt/spinnaker/config in Spinnaker pods

set -e

if [ -z "$1" ]; then
  echo "Please provide a namespace"
  echo "Usage: $0 <namespace>"
  exit 1
fi

NAMESPACE=$1
OUTPUT_DIR="operator-migration"

echo "Creating output directory: $OUTPUT_DIR"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# 1. First download deployments and services
echo "Downloading Kubernetes deployments and services..."

# Download Deployments
echo "Downloading deployments..."
mkdir -p "$OUTPUT_DIR/deployments"
kubectl get deployments -n "$NAMESPACE" -o name | while read -r deployment; do
  deployment_name=$(echo "$deployment" | cut -d/ -f2)
  echo "Downloading deployment: $deployment_name"
  kubectl get deployment "$deployment_name" -n "$NAMESPACE" -o yaml > "$OUTPUT_DIR/deployments/$deployment_name.yaml"
done

# Download Services
echo "Downloading services..."
mkdir -p "$OUTPUT_DIR/services"
kubectl get services -n "$NAMESPACE" -o name | while read -r service; do
  service_name=$(echo "$service" | cut -d/ -f2)
  echo "Downloading service: $service_name"
  kubectl get service "$service_name" -n "$NAMESPACE" -o yaml > "$OUTPUT_DIR/services/$service_name.yaml"
done

# Download StatefulSets if any
echo "Checking for statefulsets..."
if kubectl get statefulsets -n "$NAMESPACE" 2>/dev/null | grep -q .; then
  mkdir -p "$OUTPUT_DIR/statefulsets"
  kubectl get statefulsets -n "$NAMESPACE" -o name | while read -r statefulset; do
    statefulset_name=$(echo "$statefulset" | cut -d/ -f2)
    echo "Downloading statefulset: $statefulset_name"
    kubectl get statefulset "$statefulset_name" -n "$NAMESPACE" -o yaml > "$OUTPUT_DIR/statefulsets/$statefulset_name.yaml"
  done
fi

# 2. Now download files from /opt/spinnaker/config
echo "Downloading files ONLY from /opt/spinnaker/config..."

# Get all pods
PODS=$(kubectl get pods -n "$NAMESPACE" -o name | cut -d/ -f2)
for POD in $PODS; do
  SERVICE=$(echo "$POD" | sed -E 's/([a-z-]+)-[0-9a-z-]+.*/\1/')
  
  echo "Processing pod: $POD (service: $SERVICE)"
  mkdir -p "$OUTPUT_DIR/$SERVICE"
  
  # Check ONLY for /opt/spinnaker/config
  if kubectl exec -n "$NAMESPACE" "$POD" -- ls -la /opt/spinnaker/config &>/dev/null; then
    echo "Found /opt/spinnaker/config directory in $POD"
    
    # List all files first
    CONFIG_FILES=$(kubectl exec -n "$NAMESPACE" "$POD" -- find /opt/spinnaker/config -type f 2>/dev/null)
    if [ -z "$CONFIG_FILES" ]; then
      echo "No files found in /opt/spinnaker/config for $POD"
      continue
    fi
    
    echo "Found $(echo "$CONFIG_FILES" | wc -l | tr -d ' ') files in /opt/spinnaker/config for $POD"
    
    # Download each file
    for FILE in $CONFIG_FILES; do
      FILENAME=$(basename "$FILE")
      echo "Downloading $FILENAME from $POD"
      
      FILE_CONTENT=$(kubectl exec -n "$NAMESPACE" "$POD" -- cat "$FILE" 2>/dev/null)
      if [ $? -eq 0 ] && [ -n "$FILE_CONTENT" ]; then
        echo "$FILE_CONTENT" > "$OUTPUT_DIR/$SERVICE/$FILENAME"
        echo "Saved $FILENAME to $OUTPUT_DIR/$SERVICE/$FILENAME"
      else
        echo "Failed to download $FILENAME or file is empty"
      fi
    done
    
    # Check if we downloaded any files
    if [ -z "$(ls -A "$OUTPUT_DIR/$SERVICE" 2>/dev/null)" ]; then
      echo "No files were successfully downloaded from $POD"
    else
      echo "Successfully downloaded $(ls -1 "$OUTPUT_DIR/$SERVICE" | wc -l | tr -d ' ') files from $POD"
    fi
  else
    echo "No /opt/spinnaker/config directory found in $POD"
  fi
done

echo "======================================"
echo "Download completed. Files saved to: $OUTPUT_DIR"
echo "Summary of downloaded files by service:"

# Generate summary
for DIR in $(find "$OUTPUT_DIR" -mindepth 1 -maxdepth 1 -type d | sort); do
  SERVICE=$(basename "$DIR")
  FILE_COUNT=$(find "$DIR" -type f | wc -l)
  
  echo "- $SERVICE: $FILE_COUNT files"
  if [ "$FILE_COUNT" -gt 0 ]; then
    ls -1 "$DIR" | sort | while read -r file; do
      echo "  - $file"
    done
  fi
done

echo "Script execution complete!"

```
### Conclusion
By following these steps, you'll successfully migrate from the Spinnaker Operator to a native Kubernetes deployment using Kustomize. This approach gives you more direct control over your Spinnaker resources and eliminates dependency on the Operator.
If you encounter any issues during the migration process, please submit a support ticket for assistance.