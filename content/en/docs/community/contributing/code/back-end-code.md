---
title:  "Code Languages, Libraries, and Conventions "
description: >
  This page introduces the foundations Spinnaker services are built on, and code conventions the community has adopted.
---

Spinnaker is a collection of microservices built from a common foundation which has evolved over time. You do not need to know all of the technologies listed to contribute. Please consider these standards and conventions when submitting pull requests to Spinnaker.

## Languages

Spinnaker is comprised of JVM backend-services and a frontend application (Deck). See an [overview of the architecture](/docs/reference/architecture/microservices-overview) in our reference documentation.

Use the following languages to fix and extend Spinnaker services:

- Deck
  - [TypeScript](https://www.typescriptlang.org/)
- Backend Services
  - [Kotlin](https://kotlinlang.org/)
  - Java + [Lombok](https://projectlombok.org/)

Sub-projects of Spinnaker microservices are called __modules__.

### Kotlin

Our language of choice is [Kotlin](https://kotlinlang.org/), and we recommend using it in any module that does _not_ currently use Groovy. However, it is absolutely fine to write Java code if that's what you're more comfortable with.

There are cross-compilation issues with mixing Groovy and Kotlin in the same source tree. To reduce complexity, please avoid mixing both languages in a single module.

### Java

If you are writing new code for an existing module that uses Groovy, please write in Java.

Spinnaker uses Java 8, and where appropriate, we encourage use of newer features such as lambdas, the streams API, the `java.time` package, and default interface methods.


### Groovy

Although much of Spinnaker is written in it, we have deprecated [Groovy](https://groovy-lang.org/). Please avoid contributing new production code that uses Groovy. Changes to existing Groovy code are acceptable, but new classes should not be written in Groovy.

You are welcome to use Groovy with [Spock](http://spockframework.org/) for writing tests.

Refactoring is also welcome. If your changes touch Groovy code that you can transform into Java, please feel free to do so. Interfaces, for example require almost no changes.

Types from the Groovy runtime libraries should not be exposed in the API of any class.
Since Groovy closures can be automatically type-coerced to Java [SAM types](https://dzone.com/articles/java-8-functional-interfaces-sam), please use an appropriate SAM type for parameters or return types that may be implemented with Groovy closures.

## Libraries
### Current Third-party Libraries

Spinnaker is built on the shoulders of giants.
This is not an exhaustive list of libraries that we use, but the ones we've identified as having a large presence across the product.

- Deck
  - [React](https://reactjs.org/)
- Backend Services
  - Runtime
    - [gRPC](https://grpc.io/)
    - [Jackson](https://github.com/FasterXML/jackson)
    - [Jedis](https://github.com/xetorthio/jedis)
    - [jOOQ](https://www.jooq.org/)
    - [Keiko](https://github.com/spinnaker/keiko)
    - [Micrometer](http://micrometer.io/)
    - [OkHttp](https://square.github.io/okhttp/)
    - [Spring Boot 2](https://spring.io/projects/spring-boot)
    - [Resilience4j](https://resilience4j.readme.io/)
  - Testing
    - [Minutest](https://github.com/dmcg/minutest)
    - [Mockk](https://mockk.io/)
    - [Spock](http://spockframework.org/)
    - [Strikt](https://strikt.io/)
    - [Testcontainers](https://www.testcontainers.org/)

### Deprecated Third-party Libraries

Spinnaker is an ever-evolving system, and as such, so are the foundations we've chosen to build on top of.
These libraries still see extensive use within Spinnaker, however they have been deprecated in favor of another solution and the spread of their use is discouraged.

- Deck
  - [Angular](https://angularjs.org/): Actively migrating to React.
- Backend Services
  - [Hystrix](https://github.com/Netflix/Hystrix): Replaced by Resilience4j.
  - [Retrofit](https://square.github.io/retrofit/): Moving to gRPC. Where HTTP is required, converging on [Spring RestTemplate](https://spring.io/guides/gs/consuming-rest/).
  - [Spectator](https://github.com/Netflix/spectator): Replaced by Micrometer.
  - [Spek](https://spekframework.org/): Converging on Minutest + Strikt + Mockk.

## Conventions

### Code formatting

We follow [Google's Java Style Guide](https://google.github.io/styleguide/javaguide.html) for Java.
We follow [ktlint](https://ktlint.github.io/) for Kotlin.

For Groovy and miscellaneous files, please use:

* 2 space indents.
* No more than 1 consecutive line of whitespace.
* Line breaks rather than overly long lines (limit to 120 column width if possible).
* Camel case conventions as per Java.

Code formatting is applied automatically with a git pre-commit hook, but if you need to check or apply code formatting outside of this process:

* Format code: `./gradlew spotlessApply`
* Check code: `./gradlew spotlessCheck`

### Package structure

Spinnaker microservices automatically component-scan for `@Configuration` classes in the `com.netflix.spinnaker.config` package (although we will need to rethink this convention for Java 9 compatibility).
Other classes should be placed in `com.netflix.spinnaker.<service>.<feature>` where `<service>` is the microservice name, for example `orca` or `clouddriver` and `<feature>` is something descriptive of the feature being implemented.

Please do not separate classes into different packages according to _what_ they are.
Packages should represent the group of classes that implement a particular piece of functionality not all components of a particular type.

### Naming things

Please use descriptive but concise names for variables, classes, properties, methods, and so on.
Longer names are good when they add clarity.
Shorter names are good when they reduce redundancy.

#### Representing units

It's preferable to use types that properly represent things like durations, or timestamps (`java.time.Duration` and `java.time.Instant` would be ideal in those specific cases).
If that's not practical please include a suffix on the property / variable name that describes the unit.
A property declared as `public long getTimeout()` is ambiguous and can easily lead to errors when developers using your code assume what the units are.

For example, these names are much less likely to result in errors:

```java
public long getTimeoutMillis();
public long getTimeoutSeconds();
```

### Nullability

When writing Java code, please use `@javax.annotation.Nullable` and `@javax.annotation.Nonnull` annotations on return types and parameters of public methods.
This lets the Kotlin compiler make better decisions about the interactions between Kotlin and Java code.

### Date and time values

Please use classes from `java.time` and not `java.util.Date` or `java.util.Calendar`.

### Exceptions

Please select, or create, appropriate exception types rather than throwing overly general things such as `RuntimeException`.

Exception types you create should extend `RuntimeException` (directly or indirectly).
Please try to include descriptive information in exception messages, especially for errors that will be surfaced to the user.

The package `kork-exceptions` includes some standard base exception types that you are encouraged to use directly or extend as needed.

### Deprecations

Deprecating old, unused or high-debt code is highly encouraged!
When deprecating code, you MUST include the `@Deprecation` annotation, _along with supporting documentation_:

1. Why is this code deprecated? This should be a link to a Github Issue with the `no-lifecycle` label.
1. What is this code being replaced by?

Do not annotate code as deprecated without additional context. Deprecations without sufficient context will be rejected.

### Ambiguous Types

Refrain from using open-ended, ambiguous types, such as `Map<String, Object>`.
These types, while flexible, make APIs unobvious, difficult to integrate with and test.
Instead, use well-defined types, or if a `Map` type is truly needed, use the most constrictive contract as possible, such as `Map<String, String>`.

### Testing

We really appreciate contributions that include tests.
Thorough testing at the unit level with maybe an integration test to validate how components tie together is ideal.

#### Testing tools

Spinnaker uses [Spock](http://spockframework.org/) for testing Java and Groovy code.

For Kotlin we are still pinning down specific best practices but currently recommend JUnit tests (written in Kotlin) using [AssertJ](https://joel-costigliola.github.io/assertj/) and [Mockito](http://site.mockito.org/) via [mockito-kotlin](https://github.com/nhaarman/mockito-kotlin).
