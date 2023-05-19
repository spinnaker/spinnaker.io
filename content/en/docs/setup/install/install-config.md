---

title:  "Run Spinnaker Locally"
description: Run spinnaker locally for testing or small installations
weight: 30
---

### Minimal Configuration for kubernetes

1. Run the following command, using the `$ACCOUNT` name you created when you
configured Kubernetes:

   ```
   hal config deploy edit --type distributed --account-name $ACCOUNT
   ```
1. Make sure [kubectl is installed](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
on the machine running Halyard.

   After you install it, you might need to update the `$PATH` to ensure Halyard
   can find it, and if Halyard was already running you might need to restart it
   to pick up the new `$PATH`:

   `hal shutdown`

   Then invoke any `hal` command to restart the Halyard daemon.
   
1. Configure [Kubernetes liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/)
for your Spinnaker services, setting the `initialDelaySeconds` to the upper bound of your longest service startup time:

   ```
   hal config deploy edit --liveness-probe-enabled true --liveness-probe-initial-delay-seconds $LONGEST_SERVICE_STARTUP_TIME
   ```  

## Further reading

* [Spinnaker Architecture](/docs/reference/architecture/) for a better understanding
  of the Distributed installation.

## Next steps

Now that your deployment environment is set up, you need to provide Spinnaker
with a [Persistent Storage](/docs/setup/install/storage/) source.
