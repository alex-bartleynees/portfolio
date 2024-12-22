---
title: "Gatsby and Sanity.io"
pubDate: "June 15 2021"
heroImage: "/images/gatsby.jpeg"
author: "Alex Bartley Nees"
---

<p class="paragraph">
          I recently finished making a website for my brother’s new art gallery
          in Wellington. A major requirement for the website was that he needed
          to be able to update everything himself without touching the code or
          asking me for help. This was because he would have a new art
          exhibition each month and needed to be easily able to add it to the
          website. I had never made a website with this functionality before,
          but I felt up to the challenge.
</p>

<p class="paragraph u-margin-top-medium">
          After doing some research online, I decided to use Sanity Studio as a
          headless CMS to update the content on the website. A headless CMS is a
          back-end only content management system. A headless CMS was ideal
          because I could use it with my front-end of choice, in this case,
          Gatsby, a static site generator based on React. Getting started with
          Sanity was easy because they provide a command-line interface tool
          that makes it easy to start and deploy a project. A great thing about
          Sanity is that everything is easily customisable because it is built
          on React. All the content in Sanity is defined by “schemas” which are
          javascript objects and arrays. In this case, I set up the schemas to
          add new exhibitions with as many artists and artworks as my brother
          needed. I simply used a boolean to define whether the exhibition was
          either the current or upcoming exhibition, or if it should be placed
          in the archive. Once the schema is set up you simply need to type
          “sanity deploy” in the terminal and follow the instructions to deploy
          it to the web.
</p>

<p class="paragraph  u-margin-top-medium">
          With Sanity Studio and the schemas set up, I next set about getting
          the data into Gatsby and displaying it on the page. Gatsby is a static
          site generator built on React. It’s static because you can run a build
          command and it fetches all the data and outputs a bunch of HTML, CSS
          and Javascript files but because it is based on React it can also have
          lots of dynamic functionality. I went with Gatsby for this site
          because the website was mainly static, with a new exhibition only
          being added once a month and Gatsby has the speed of React and
          single-page web apps while having the advantages of search engine
          optimisation. With React, it can be harder to optimise for search
          engines because all of the javascript has to be run on the client-side
          before the search engine can know what is on the page. Gatsby is
          server-side rendered which makes the content immediately available to
          search engine crawlers. This made it a great choice for this website.
        </p>

<p class="paragraph u-margin-top-medium">
          Gatsby uses GraphQL to access data. GraphQL uses queries to get the
          particular data you need. The first step was to run “sanity deploy
          graphQL” to make the schema available to GraphQl to query. The next
          step was to write the queries to access the data from the Sanity
          Studio. In Gatsby, you can have one query per component. Gatsby makes
          it really easy to write queries by having a tool called “GraphiQL”
          which lets you see the structure of your data in your browser and
          easily run queries which you can then copy into Gatsby.
</p>

<p class="paragraph u-margin-top-medium u-margin-bottom-big">
          Once GraphQL gets the data into Gatsby, it was simply a matter of
          using javascript object and array methods to display the data on the
          page! See the end result here! &rarr;
          <a class="link underline" href="https://envy6011.net/">Envy 6011</a>
</p>
