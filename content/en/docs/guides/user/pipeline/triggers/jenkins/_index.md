---
title: "Triggering pipelines with Jenkins"
linkTitle: "Jenkins"
description: >
  Add a [Jenkins](https://jenkins.io/) trigger to your pipeline.
---


## Prerequisites

* [Set up Jenkins](/docs/setup/other_config/ci/jenkins/) as a continuous integration system in
    your Spinnaker deployment.
* Enable [artifact support](/docs/reference/artifacts/#enabling-artifact-support).  

## Adding a Jenkins trigger

1.  [Create a pipeline](/docs/guides/user/pipeline/managing-pipelines/#create-a-pipeline).
1.  In the **Configuration** stage of your new pipeline,
    [add a trigger](/docs/guides/user/pipeline/managing-pipelines/#add-a-trigger).
1.  Select **Jenkins** from the **Type** menu, which brings up the following
    screen:

    ![](add-trigger.png)

1.  Select a Jenkins master from the **Master** drop-down menu, then select a job from
    the **Job** drop-down.
1.  Add a property file, if desired. See the [property
    files](/docs/guides/user/pipeline/expressions/#property-files) section of the
    Pipeline Expression Guide for more information about how to specify and use
    property files.

## Build Artifacts
Jenkins has the ability to save files from a build as a build artifacts. These objects could be compiled binaries or kubernetes manifests or any other artifact created as part of the build process.

Best practice dictates that these artifacts should be uploaded to a dedicated artifact repository such as GCR, DockerHub, Artifactory, Maven etc, however sometimes it's easier to store the artifact as part of the build output.

Here is an example of a Jenkins pipeline that stores artifacts


```javascript
stages {
  stage('Generate Kubernetes Manifests') {
    steps {
    sh '''
    npm install
    npm run import
    npm run build
    echo "BUILD=${BUILD_NUMBER}" > build.properties
    '''
    }
  }
}
post {
  always {
    archiveArtifacts artifacts: 'dist/*.yaml', fingerprint: true
    archiveArtifacts artifacts: 'build.properties', fingerprint: true
  }
}
```
This job will generate the following artifacts

![Jenkins Build Artifacts](https://github.com/dniasoff/spinnaker.io/raw/master/content/en/docs/guides/user/pipeline/triggers/jenkins/build-output.png)

The line ``echo "BUILD=${BUILD_NUMBER}" > build.properties`` adds a build number field to the build.properties which can be used later to generate the URL used to download the artifact using HTTP.

The build.properties artifact should be added to the Jenkins trigger like this

![Jenkins Build Trigger](https://github.com/dniasoff/spinnaker.io/raw/master/content/en/docs/guides/user/pipeline/triggers/jenkins/build-properties.png)

Finally to add the Jenkins build artifact as a Spinnaker artifact, do the following

 1. Create a HTTP File artifact account for Jenkins using the Jenkins base URL and credentials that has permissions to access the build artifact
 2. Right click on the build artifact displayed in the Jenkins Build Output above. This will give you the full URL for the build artifact - something like this ``https://{jenkins-url}/job/DevToolStack/90/artifact/cdk8s/dist/terraform-operator.k8s.yaml``
 3. Add a new HTTP file artifact to the pipeline replacing the build number with the BUILD field from the properties using the following variable - ``${trigger.properties['BUILD']}`` like this

 ![Manifest Configuration](https://github.com/dniasoff/spinnaker.io/raw/master/content/en/docs/guides/user/pipeline/triggers/jenkins/manifest-configuration.png)


