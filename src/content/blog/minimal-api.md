---
title: "Building a .NET Minimal API"
pubDate: "April 27 2024"
heroImage: "/images/.net-image.png"
author: "Alex Bartley Nees"
---

<h2 class=padding-bottom-2>Building a .NET Minimal API with Clean Architecture and MediatR</h2>

## Minimal APIs:

Minimal APIs in .NET are a way to create APIs with minimal dependencies. Minimal APIs focus on an “opt-in” model where we can choose which features we want to use as opposed to the traditional MVC API architecture with an “opt-out” model. This leads to Minimal APIs having increased performance due to lower overhead and fewer steps in the request-handling pipeline. This means that Minimal APIs are great for high-performance scenarios. The simplicity of MInimal APIs also means they can be quick to set up and get running.

## Clean Architecture:

Clean Architecture is a commonly used pattern for structuring our codebase to create clear boundaries for the different parts of our application which reduces their dependency on each other and improves testability and separation of concerns. Clean Architecture usually consists of four layers: Presentation Layer, Application Layer, Domain Layer and the Infrastructure layer.

Presentation Layer: The presentation layer is responsible for handling client interactions and delivering data. In a typical Web API, this layer would comprise the endpoints or controllers that handle HTTP requests and return JSON responses to the client.

Application Layer: The Application layer contains the business logic and use cases of our application and is independent of UI or infrastructure. In our API this is where our queries, commands and application services would go.

Domain Layer: The domain layer consists of our business rules, entities and domain-specific logic.

Infrastructure Layer: The infrastructure layer handles our external concerns such as databases and external services.

## MediatR:

MediatR is a commonly used package that allows us to easily implement the mediator pattern in .NET. The mediator pattern ensures the objects don’t directly communicate with each other, instead messaging through an intermediary mediator object. This reduces dependencies between objects and reduces coupling.

## Building our API:

To try out Minimal APIs I have built a Product Feedback API so that users can create suggestions to give us feedback, add comments and reply to comments.

We can scaffold a new Minimal API by using the dotnet command line (`dotnet new web -o name`) or the web development workload tool in Visual Studio (make sure to uncheck use controllers to create a Minimal API). This gives us the basic files needed for our API. We can see it’s quite straightforward and similar to NodeJS. We then want to create our Domain, Application and Infrastructure projects.

### Coding the domain layer:

The domain layer is responsible for representing the concepts of our business and business rules. This layer shouldn’t contain anything relating to data persistence but focus on our business details. For this simple application, this simply consists of our domain entities. It’s important to note that ideally our entities should not have any direct dependencies and are not coupled to our infrastructure. The domain layer is a great place to start when coding our application as it models our real-life use cases. Here I simply added classes for the Suggestion, Suggestion comment, Suggestion comment reply and User entities.

### Coding the infrastructure layer:

The infrastructure (or data-access) layer is where we place all our concerns relating to persisting our data. In this project, I am using Entity Framework Core to scaffold and manage our database. This layer contains our Database contexts, Migrations and repositories.

### Repository pattern:

The repository pattern is a design pattern that helps us to manage data access logic in a centralised location. This is not strictly necessary when using Entity Framework Core as EF Core itself encapsulates the repository pattern, but I wanted to try it out in this project. The general idea with this pattern is that we provide an abstraction, i.e an interface that our application layer interacts with. This way our application layers do not have any knowledge of what database we are using. This makes it a lot easier to swap out our concrete implementation for another if needed, for example, if we wanted to change our database from SQL Server to MySQL. In this project I added a Suggestions Repository class which is responsible for handling our database queries, this class implements the ISuggestionsRepository interface. It’s important to note that the interface itself is located in our application layer and not the infrastructure layer. This is because the application layer works with the interface to consume the data and should therefore be defined by the client, in this case, the application.

### Coding the application layer:

The application layer defines what tasks the software is supposed to do and the problems our domain is supposed to solve. This layer mustn’t contain domain knowledge but coordinate our tasks and delegate the domain knowledge to the domain layer. For this application, this layer contains our commands and queries, data transfer objects (DTOs), and validators.

#### Command Query Responsibility Segregation (CRQS):

The CQRS pattern is designed to to separate our models for reading and updating data. As our application grows, separating our queries and our updates helps us to maintain our code. There are a lot of ways to implement the CRQS pattern that can become very complex, for example, you might have separate databases for reads and writes. For this application, I used MediatR to implement CRQS with a single database simply using folders to seperate our models. MediatR is a Nuget package that implements the mediator pattern. In our application, we have specific folders to contain our commands and our queries. For handling our Suggestions commands and queries, I have a Suggestions folder with separate folders for commands and queries. This makes it clear where we are querying data and where we are writing data.

#### DTOs & Validators

In this layer, I also added a Common folder with sub-folders for our models (DTOs) and input validators. The DTOs (Domain Transfer Object) represent the data that will be returned to the consumer of the application or transferred to different application layers. For example, I have a Suggestion DTO which represents the data to be transferred to for a suggestion. It’s important that DTOs are lightweight and should only contain the necessary data compared to our domain entities which might contain business logic.

This is where I also added input validation for our models using Fluent Validation. Fluent Validation is a .Net library that helps us to easily create validation rules. We simply implement the AbstractValidator class for our model and add rules with the RuleFor method.

### Coding the presentation layer:

The presentation layer is where we handle client interaction, for our Web API this is where we will have our endpoints that consumers can use to interact with our application. Since this is a Minimal API, we don’t have controller classes, rather we define endpoints with handlers. We don’t want to write all our endpoints in the Program.cs file, as this would make the API harder to extend and maintain. Instead, we can make use of extension methods to register our endpoints which we can group in different files.

#### API endpoints:

In this layer, I have an EndpointDefinitions folder which contains a class for each group of endpoints, in this case, I have a class each for Suggestion endpoints, Comment endpoints and User endpoints. Each class extends an IEndpointDefinition interface with a register endpoints method. In the Extensions folder, I have a MinimalApiExtensions file, here we can add extension methods for setting up our API. The RegisterEndpointDefinitions methods extends the WebApplication. Here we can use Reflection to find the classes that implement the IEndPointDefinition interface for each class and then call the RegisterEndpoints method to register our endpoints with the application. In this file, we also have extension methods to register services and app config.

Example of IEndpointDefinition interface:
<img class=u-margin-bottom-small alt="register-endpoints-interface" src="/images/register-endpoints.png" />

Implementing our endpoints:
<img class=u-margin-bottom-small alt="suggestion endpoints" src="/images/Suggestions-Endpoints.png" />

Extension method to register our endpoints:
<img class=u-margin-bottom-small alt="extension mthod" src="/images/extension-method.png" />

## Conclusion:

Minimal APIs are great way to build apis in .NET that allow for a great deal of flexibility and have many of the same capabilities as controller based APIs while the opt-in model allows for improved performance.

Check out all the code here! &rarr;
<a class="link underline" href="https://github.com/alex-bartleynees/ProductFeedback.API_V2">Minimal Api Github repo</a>
