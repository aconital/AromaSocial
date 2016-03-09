var mandrill = require('node-mandrill')('UEomAbdaxFGITwF43ZsO6g');

//send an e-mail to shariqazz
mandrill('/messages/send', {
    message: {
        to: [{email: 'shariqazz15@gmail.com', name: 'Shariq Aziz'}],
        from_email: 'test@me.com',
        subject: "Testing Syncholar",
        text: "Howdy doo, I sent this message using mandrill."
    }
}, function(error, response) {
    // there was an error
    if (error) console.log( JSON.stringify(error) );

    //everything's good, lets see what mandrill said
    else console.log(response);
});