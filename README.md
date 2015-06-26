# AROMASocial Website

This is a website for the uploading and sharing of data!

## Requirements

You'll need to have the following items installed before continuing.

  * [Node.js](http://nodejs.org): Use the installer provided on the NodeJS website.

## Quickstart

```bash
git clone https://github.com/aconital/AromaSocial.git
npm intall
npm start
```

Then just navigate your browser to http://locahost:3000 and you're set!

## Front End Documentation

The front end of the website is generated by using Jade views rendered by Node.js - this is primarily in the app.js file.  
The jade files are fairly straightforward - the guest.jade view is for the navbar and footer when the user is not logged in.  The layout.jade file is for the navbar and footer when the user IS logged in.  Each view (besides layout.jade and guest.jade correspond to an individual webpage).  Most relevant information is passed to the views by variables which can be accessed in Jade (usually by placing the variable in "#{variable}" to render it as text - or just the variable name can be used if accessing in a Jade conditional (eg. if statement)).

The front end uses React.js (http://facebook.github.io/react/) to render most of the components.  The components for the newsfeed page are rendered in newsfeed.js (in the public/javascripts/ folder), components for the profile page are rendered in profile.js and the search page components are rendered in the search.js file (all in the public/javascripts/ folder).

The styling of many of the elements are done using the Bootstrap framework.  Some elements like the Modal in the profile.js file are built using React-Bootstrap (a library for bootstrap components using react).  These elements are defined at the top of profile.js (for example: `var Modal = ReactBootstrap.Modal;`)

Each page (search, profile and newsfeed) has a div element that has the id `#content` which is what the React components are mounted to.  The parent React components for the search page, profile page and newsfeed page are SearchPage, PublicationBox, and Newsfeed, respectively.  From each of these pages, if the user clicks to "SEE FULL TEXT", they stay on the same page, however, the parent React components are unmounted and components containing the file and the information on the file is mounted to the div element with the id `#content`.  The closer look at the file is handled in the showpublication.js file in the /public/javascripts/ folder.  When the user clicks the back button, they remain on the same page, however the current React Components are unmounted and the original React components for that page are mounted using the flag `search` set for whether the file was loaded from the search page or the newsfeed page.  
 
