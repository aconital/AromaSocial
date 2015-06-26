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

Then just navigate your browser to http://localhost:3000 and you're set!

## Front End Documentation

The front end of the website is generated by using Jade views rendered by Node.js - this is primarily in the app.js file.  

The jade files are fairly straightforward - the guest.jade view is for the navbar and footer when the user is not logged in.  The layout.jade file is for the navbar and footer when the user IS logged in.  Each view (besides layout.jade and guest.jade correspond to an individual webpage).  Most relevant information is passed to the views by variables which can be accessed in Jade (usually by placing the variable in "#{variable}" to render it as text - or just the variable name can be used if accessing in a Jade conditional (eg. if statement)).

The front end uses [React.js](http://facebook.github.io/react/) to render most of the components.  The components for the newsfeed page are rendered in newsfeed.js (in the public/javascripts/ folder), components for the profile page are rendered in profile.js and the search page components are rendered in the search.js file (all in the public/javascripts/ folder).

The styling of many of the elements are done using the Bootstrap framework.  Some elements like the Modal in the profile.js file are built using React-Bootstrap (a library for bootstrap components using react).  These elements are defined at the top of profile.js (for example: `var Modal = ReactBootstrap.Modal;`)

Each page (search, profile and newsfeed) has a div element that has the id `#content` which is what the React components are mounted to.  The parent React components for the search page, profile page and newsfeed page are SearchPage, PublicationBox, and Newsfeed, respectively.  From each of these pages, if the user clicks to "SEE FULL TEXT", they stay on the same page, however, the parent React components are unmounted and components containing the file and the information on the file is mounted to the div element with the id `#content`.  The closer look at the file is handled in the showpublication.js file in the /public/javascripts/ folder.  When the user clicks the back button, they remain on the same page, however the current React Components are unmounted and the original React components for that page are mounted using the flag `search` set for whether the file was loaded from the search page or the newsfeed page.  

  * Newsfeed Page:
    * Besides the header and footer (loaded from layout.jade), all of the components are loaded from newsfeed.js (using React)
    * The NewsFeed class gets the json array from the server with all of the newsfeed updates and sets it as a state variable which is passed to the NewsfeedList class 
    * Within the NewsfeedList class, the json array is mapped to various attributes of the newsfeed item and passed to the Update class
    * Update then displays the mapped data (stored as properties of the Update object - this.props) to html elements (well, jsx elements really)
    * When the user clicks the "SEE FULL TEXT" button, the function showPublication in the Update class is called which in turn calls the showPublicationNewsFeed() function 
      * This function unmounts the component at the div element with id  `#content` and renders the Zoom React class - located in the showpublication.js file
      
  * Search Page:
    * This page is rendered at the url `/searchpage` which renders the React component SearchPage which loads the search results based on the tags from the server and displays them below the form
    * This page is accessible from the url and also from the navbar from any other page
    * The submission of the search form on the search page (not the navbar) is handled by the function handleSearchSubmit within the SearchPage React class
    * The publications returned from the server from the search is saved as the state and is passed to the React component ResultList which maps the json array of the results from the search to attributes in the Result component
    * the Result component displays these properties as HTMl elements on the page
    * a Result object is created for each publication returned from the server
    * when the state of the SearchPage object changes, the list of the results is updated - this is an inherent trait in React
    
  * Profile Page:
    * Parts of this page are only displayed if the user is viewing their own profile page - which will allow them to edit their information and post publications. This is determined using the isMe flag sent from the server.  
    * Part of this page is created using pure Jade - this is the section containing the profile picture + upload picture modal as well as the form to update the user's full name and email located below the profile picture.  The fullname and email and profile picture are only editable if the user viewing their own profile.
    * The rest of the profile page is rendered using React components
    * The profile page's parent component is PublicationBox which contains two components - PublicationForm and PublicationList.  The PublicationForm is only displayed if the isMe flag is set
    * PublicationForm renders a bunch of form tabs - the current tab is stored as a state variable and based on which state it is in, the content is loaded accordingly
    * PublicationBox loads the user's own publications from the server and saves it as a state variable which is passed to PublicationList 
    * PublicationList maps this json array to individual Publication objects which displays the information as HTML elements
    * When the user clicks "SEE FULL TEXT" the PublicationBox component is unmounted - using the showPublication function in the Publication class which calls showPublication()
    * showPublication() renders the ProfileZoom React class located in showpublication.js
    * ProfileZoom renders the LargerPublication class which only displays the option to delete the publication if the user is viewing their own profile
    
Keep in mind that most of the forms are handled using JQuery and Ajax to prevent some weird loading issues we were having when the form was submitted on its own.  Look for the .submit() handlers for the id's of the form if you need to change anything about the forms or the ways they are submitted. 

