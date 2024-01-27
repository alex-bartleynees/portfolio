---
title: "NX, NGRX Signal Store and Angular 17"
pubDate: "January 25 2024"
heroImage: "/images/angular17logo.jpeg"
author: "Alex Bartley Nees"
---

<h2 class=padding-bottom-2>Enterprise Grade Architecture patterns with NX, NGRX Signal Store and Angular 17</h2>

## NX

NX is a popular build tool commonly used with Angular. Traditionally it has been used for mono-repos but it now also supports single-project structures as well. It provides a way for us to easily structure our project into easily defined modules with built-in generators to easily generate new libraries. It provides benefits such as warning us if we have circular dependencies and can provide clear boundaries between modules.

To create a NX workspace we start with `npx create-nx-workspace@latest`. The NX CLI walks us through setting up our project with the front-end library of our choice and we can choose a mono-repo set-up or standalone for a single project. In my case, I’ve gone with standalone for my project.

For a standalone project with NX, we have our usual Angular set up with our project in an src folder at the root of the project. NX also automatically sets up an e2e project with Cypress for Playwright to get started with e2e testing.
One of the main benefits of NX is easily creating libraries. I’ve created a libs folder to house our libraries. In NX we can create an Angular library, for shared components for example, or simply a Typescript library for services and shared utilities. This helps us to keep our app lean and provide separation of concerns. I’ve decided to create a core-data library and a core-state library. The core-data library houses our services for getting data from our API. The core-state library is where we will keep our services to manage the state for our project and components. This provides a clean separation between the component level of our application and the data-fetching and state management. I also added a shared components library to keep components that can be used across multiple domains/features of the application.

For my project ( a suggestions feedback app) I also created a domains folder in the project app folder for the different features of the application. This allows us to separate our domains into different modules and we can enforce module boundaries between our domains. This means that domain A cannot be imported by domain B. This means that our domains are decoupled from each other and we can update domain A knowing that it will not have any unintended effects on our other domains. Reusable shared components that can be used across domains should be placed in our shared library.

Example of application stucture with libs folder for shared libariries and project located in src folder with domains:
<img class=u-margin-bottom-small alt="app-file-structure" src="/images/app-file-structure.png" />

## NGRX Signal Store

For state management, I wanted to try out the NGRX signal store for this project. This is a new state management library by the team at NGRX built on top of Angular signals. NGRX is well known for its state management library inspired by the redux pattern using reducers and actions and built on top of RxJS observables, however, this is sometimes criticised for being boilerplate-heavy and overkill for a lot of applications.

The signal store is a lightweight alternative with minimal boilerplate and much more flexibility to create our own patterns. A key feature of the signal store is its functional approach, this allows us to create small functions and compose them together to create more complex functionality. The signal store allows us to create lightweight stores to manage a single piece of state and can be provided at a global or component level.

For the product feedback app, I’ve created a suggestions store to manage our suggestions and a users store to store the current user. These are both global state so we can use `{ providedIn: 'root' }`, to create a global service. Otherwise, if the state was just needed for a component we can simply add the store to the providers array of the component and the store will be created and destroyed with the components lifecycle. The signal store follows a functional approach but creates an Angular service for us under the hood. The benefits of using a store are that it provides a clearly defined API for our state and decouples our state management from the component level of our application.

We start with providing our initial state using the withState function. We can then add our methods with the withMethods function. Since we’ll often be fetching data in our stores NGRX provides a useful rxMethod function that allows us to seamlessly move between signals and observables. RxJS is still a major part of the Angular ecosystem and provides the best way to manage complex async operations. I’ve also added withLoading and withError utility functions to easily set our loading and error states. To create a function to be shared between stores we can use the signalStoreFeature function.

<img class=u-margin-bottom-small alt="suggestions-store-image" src="/images/suggestions-store.png" />

We an also use a withHooks function to create lifecycle hooks that are called when the store is created or destoryed. In this store we load the suggestions when the store is created:

<img class=u-margin-bottom-small alt="with-hooks-example" src="/images/with-hooks.png" />

### Facade pattern

For this project, I also decided to utilise the facade pattern. This is a commonly used pattern to simplify the interactions between services and components. I added a facade folder to the core-state library to contain facade services to use with our stores. This provides a very clean separation between the component level of our application and the data level of our application. This means instead of injecting our stores directly into the components, we can inject the facade service and only expose the methods we want our component to have access to. This also means if we later want to swap out our state-management library for something else we only need to update our facade services rather than going through each of our components.

## Angular 17

Angular 17 is one of the biggest Angular releases in a long time and provides many new features. The main new features are signals and the new control flow syntax.

### Signals

Signals are a new reactive primitive in Angular that provides a great way for managing state. The main benefit of signals is that they are reactive, when a value changes the consumers of the signal are notified and can react to this change. This provides performance improvements for Angular because when a value changes Angular won’t need to run change detection for the entire component tree, it can know exactly what changed and simply run change detection for a single component.

To create a new signal we use the signal function from angular/core and provide a default value, signals must always have a value. To update the signal we can use the update method to derive a new value from the current value, or the set method to set a new value.

#### Computed Signals

Computed signals allow us to create new signals from existing signals that automatically react to changes in the original signal. This is an extremely useful feature and it is used all the time with signals as it allows us to easily derive state from our existing state. For example, for the suggestions state in my project, I have used a computed signal to filter our suggestions by category. Because I used computed whenever the suggestions signal is updated our computed signal will also update.

Example of computed signal - the computed signal will update when any of the dependent signals update.
<img class=u-margin-bottom-small alt="computed signal example" src="/images/computed-signal.png" />

### Effect

Effect is another function that can be used with signals to perform side-effects to notify interested consumers when the signal changes. An effect runs whenerver one or more signal values change. An effect will always run at least once and run again whenever the signal values change. It's important to note effects always execute asynchronously during change detection. In practice for my project I did not find any use case for effect and I think it should be used sparingly and carefully. They should not be used to manage or update state but only for side effects and setting signals is disallowed by default in effects. An example for an effect might be keeping data in sync with the browsers local storage.

### Control flow

Angular 17 provides a new control flow syntax that is embedded in the templates rather than using structural directives applied to elements. I found that this is much more intuitive and developer-friendly than the directive approach. We can use `@if`, `@else`, or `@switch` for conditional statements and `@for` for loops. I found that this is much easier to remember than the directives and is much cleaner in the templates as we don’t have to use `ng-container` or `ng-template` anymore. @for now requires a track function which was optional with `*ngFor`. This provides a key for the for loop to keep track of what is rendered so that when an object changes the whole list does not need to be re-rendered which greatly improves performance.

New control flow syntax in component template:
<img class=u-margin-bottom-small alt="control flow example" src="/images/control-flow.png" />

### Standalone Components

Standalone components are now the default way of creating components and applications in Angular 17. This was my first time only using standalone components for a whole project and I found them very easy to use and a big DX improvement over ngModules. A standalone component
has the `standalone true` flag set in the component and manages its own imports via an imports array in the component decorator. It's important to note that a standalone component can not directly import a non-standalone component but must import the ngModule it is declared in, other standalone components can be directly imported. Standalone components can also be lazy loaded just like ngModules.

## Conclusion

NX easily allows us to create enterprise-grade Angular applications by following best practices for organising our project. Separating our project into smaller libraries makes our project more maintainable in the long-term by letting us have leaner apps, providing clear separation of concerns and easily managing module boundaries.

I was hugely impressed by the NGRX signal store as it allows us to easily create lightweight stores to manage our state with the advantage that we have a clear API for our components to use to update state. It also makes it easy to use RxJS for async side effects while effortlessly converting the observables into signals for use in our components.

Angular 17 is a fantastic release and sets Angular up for the future with signals. The new signals and control flow syntax make Angular much more developer-friendly and easier to use.

<p class=u-margin-bottom-medium>Check out my product-feedback app repo here for a deeper dive into the code:
<a class="link underline" href="https://github.com/alex-bartleynees/product-feedback-app-v2">Product Feedback App</a><p>
